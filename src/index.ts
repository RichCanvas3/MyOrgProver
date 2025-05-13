import express, { Request, Response } from 'express';
import cors from 'cors';
import * as snarkjs from 'snarkjs';

import { buildPoseidon, newMemEmptyTrie } from 'circomlibjs';
//import { path } from 'path'

import { WebsiteInputs } from "./models/WebsiteInputs.js";
import { WebsiteCircuit } from "./circuits/website.js"
//import ipfsStorage from './services/ipfsStore.js';



import { RevokedkeysCircuit } from './circuits/revokedkeys.js';

const app = express();


app.use(express.json());
app.use(cors());

const websiteCircuit = new WebsiteCircuit();
const revokedkeysCircuit = new RevokedkeysCircuit();



/*
  async testExclusion(tree: newMemEmptyTrie, _key : number)   {

    const key = tree.F.e(_key);
    const res = await tree.find(key);

    let siblings = res.siblings;
    for (let i=0; i<siblings.length; i++) siblings[i] = tree.F.toObject(siblings[i]);
    while (siblings.length<10) siblings.push(0);


    const w = await circuit.calculateWitness({
        enabled: 1,
        fnc: 1,
        root: tree.F.toObject(tree.root),
        siblings: siblings,
        oldKey: res.isOld0 ? 0 : tree.F.toObject(res.notFoundKey),
        oldValue: res.isOld0 ? 0 : tree.F.toObject(res.notFoundValue),
        isOld0: res.isOld0 ? 1 : 0,
        key: tree.F.toObject(key),
        value: 0
    });

    await circuit.checkConstraints(w);


  }
  */

interface CheckProofRequest extends Request {
  body: {
    verificationKey: any;
    publicSignals: [string]; 
    zkProofJson: any;
  };
}

app.post('/api/proof/checkproof', async (req: CheckProofRequest, res: Response) => {

  try {
    console.info("ok lets do this 2")
    const { verificationKey, publicSignals, zkProofJson } = req.body;
    const valid = await snarkjs.groth16.verify(verificationKey, publicSignals, zkProofJson)
    res.json(valid.toString());
  } catch (error) {
    console.info("..... error: ", error)
    res.status(500).json({ error: (error as Error).message });
  }
})

  interface CommitmentRequest extends Request {
    body: {
      didHash: number;
      issuerDidHash: number;
      vcHash: number;
    };
  }

app.post('/api/proof/commitment', async (req: CommitmentRequest, res: Response) => {

  try {
    console.info("ok lets do this")
    const { didHash, issuerDidHash, vcHash } = req.body;
    const poseidon = await buildPoseidon();
    const leafHash = poseidon.F.toObject(poseidon([didHash, vcHash]));
    const commitmentHash = poseidon.F.toObject(poseidon([issuerDidHash, leafHash]));
    console.info("return hash: ", commitmentHash)
    res.json(commitmentHash.toString());
  } catch (error) {
    console.info("..... error: ", error)
    res.status(500).json({ error: (error as Error).message });
  }
})

interface ProofRequest extends Request {
    body: {
      inputs: { didHash: number; issuerDidHash: number, vcHash: number, commitment: number };
      did: string;
      commitment: string;
    };
  }

  interface ProofRemoveRequest extends Request {
    body: {
      proof: string;
    };
  }

// Create Proof Endpoint
app.post('/api/proof/create', async (req: ProofRequest, res: Response) => {

  const { inputs, did, commitment } = req.body;

  console.info("api inputs: ", did, commitment)
  try {
    const websiteInputs : WebsiteInputs = {
        did: inputs.didHash,
        issuerDID: inputs.issuerDidHash,
        credentialHash: inputs.vcHash, 
        credentialCommitment: inputs.commitment
    }
    
    let result = await websiteCircuit.generateProof(websiteInputs);

    console.info("proof:", result.proof)
    console.info("public signal: ", result.publicSignals)

    // verify proof just created
    let verifyResult = await websiteCircuit.verifyProof(result.proof, result.publicSignals)
    console.info(" --------- verify zkProof: ", verifyResult)
    

    //const proofUrl = await ipfsStorage.storeProof(did, commitment,  {
    //  proof: result.proof,
    //  publicSignals: result.publicSignals,
    //});

    
    function replaceQuotes(obj: any): any {
      if (typeof obj === 'string') {
        // If it's a string, replace single quotes with double quotes
        return obj.replace(/'/g, '"');
      } else if (Array.isArray(obj)) {
        // If it's an array, process each element recursively
        return obj.map(item => replaceQuotes(item));
      } else if (typeof obj === 'object' && obj !== null) {
        // If it's an object, process each property recursively
        const result: { [key: string]: any } = {};
        forInstructions: for (const key in obj) {
          result[key] = replaceQuotes(obj[key]);
        }
        return result;
      }
      return obj; // Return unchanged if not a string, array, or object
    }


    let proofDataUpdated = {
      proof: JSON.stringify(replaceQuotes(result.proof)),
      publicSignals: replaceQuotes(result.publicSignals),
      createdAt: new Date().toISOString(),
      vccomm: commitment,
      orgDid: did
    };

    const proofJson = JSON.stringify(proofDataUpdated)


    console.info("proof json: ", proofJson)
    res.json({...result, proofJson});


  } catch (error) {
    console.info("..... error: ", error)
    res.status(500).json({ error: (error as Error).message });
  }



});

// Delete Revoke Record Endpoint
app.post('/api/proof/removerevoke', async (req: ProofRemoveRequest, res: Response) => {

    const { proof } = req.body;
    
    await ipfsStorage.storeRemoveRevokes(proof);
})
    

// Create Revoke Record Endpoint
app.post('/api/proof/revoke', async (req: ProofRequest, res: Response) => {

    
    const { commitment, did } = req.body;
    //console.info("...... revoke ........")
    //console.info("body: ", req.body)
    //console.info(" commitment: ", commitment)
    //console.info(" did: ", did)
  
    // generate revoke proof
    try {
  
      let tree = await newMemEmptyTrie();
  
  
      let Fr = tree.F;
      await tree.insert(9,77);
      await tree.insert(8,88);
      await tree.insert(32,3232);
  
      
      const key = tree.F.e(commitment);
      const value = tree.F.e(70)
  
      //console.info("old root: ", tree.F.toObject(tree.root),)
  
      const insertRes = await tree.insert(key,value);
      let siblings = insertRes.siblings;
      for (let i=0; i<siblings.length; i++) siblings[i] = tree.F.toObject(siblings[i]);
      while (siblings.length<10) siblings.push(0);
  
      
      //console.info("new root: ", tree.F.toObject(tree.root),)
  
  
      //console.info("------------------------ proof: ", tree.root)
      //console.info("------------------------ siblings: ", siblings)
  
      
      const inputs  = {
          oldRoot: tree.F.toObject(insertRes.oldRoot),
          newRoot: tree.F.toObject(tree.root),
          siblings: siblings,
          oldKey: insertRes.isOld0 ? 0 : tree.F.toObject(insertRes.oldKey),
          oldValue: insertRes.isOld0 ? 0 : tree.F.toObject(insertRes.oldValue),
          isOld0: insertRes.isOld0 ? 1 : 0,
          newKey: tree.F.toObject(key),
          newValue: tree.F.toObject(value)
      }

      //console.info("revokeInputs: ", exclusionInputs)
      let resultProofInfo = await revokedkeysCircuit.generateProof(inputs)
      let verifyResult = await revokedkeysCircuit.verifyProof(resultProofInfo.proof, resultProofInfo.publicSignals)

      const proofUrl = await ipfsStorage.storeRevoke(commitment,  {
          proof: resultProofInfo.proof,
          publicSignals: resultProofInfo.publicSignals,
      });

      console.info("revoke proof url: ", proofUrl)
      res.json({...resultProofInfo, proofUrl});


  
    } catch (error) {
      console.info("..... error: ", error)
      res.status(500).json({ error: (error as Error).message });
    }
  
  
  
  });

export default app;

//app.listen(PORT, () => {
//    console.log(`Server running on port ${PORT}`);
//});
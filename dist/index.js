var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
import cors from 'cors';
import * as snarkjs from 'snarkjs';
import { buildPoseidon, newMemEmptyTrie } from 'circomlibjs';
import { WebsiteCircuit } from "./circuits/website.js";
import ipfsStorage from './services/ipfsStore.js';
import { RevokedkeysCircuit } from './circuits/revokedkeys.js';
const app = express();
app.use(express.json());
app.use(cors());
const websiteCircuit = new WebsiteCircuit();
const revokedkeysCircuit = new RevokedkeysCircuit();
app.post('/api/proof/checkproof', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.info("ok lets do this 2");
        const { verificationKey, publicSignals, zkProofJson } = req.body;
        const valid = yield snarkjs.groth16.verify(verificationKey, publicSignals, zkProofJson);
        res.json(valid.toString());
    }
    catch (error) {
        console.info("..... error: ", error);
        res.status(500).json({ error: error.message });
    }
}));
app.post('/api/proof/commitment', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.info("ok lets do this");
        const { didHash, issuerDidHash, vcHash } = req.body;
        const poseidon = yield buildPoseidon();
        const leafHash = poseidon.F.toObject(poseidon([didHash, vcHash]));
        const commitmentHash = poseidon.F.toObject(poseidon([issuerDidHash, leafHash]));
        console.info("return hash: ", commitmentHash);
        res.json(commitmentHash.toString());
    }
    catch (error) {
        console.info("..... error: ", error);
        res.status(500).json({ error: error.message });
    }
}));
// Create Proof Endpoint
app.post('/api/proof/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { inputs, did, commitment } = req.body;
    console.info("api inputs: ", did, commitment);
    try {
        const websiteInputs = {
            did: inputs.didHash,
            issuerDID: inputs.issuerDidHash,
            credentialHash: inputs.vcHash,
            credentialCommitment: inputs.commitment
        };
        let result = yield websiteCircuit.generateProof(websiteInputs);
        console.info("proof:", result.proof);
        console.info("public signal: ", result.publicSignals);
        // verify proof just created
        let verifyResult = yield websiteCircuit.verifyProof(result.proof, result.publicSignals);
        console.info(" --------- verify zkProof: ", verifyResult);
        //const proofUrl = await ipfsStorage.storeProof(did, commitment,  {
        //  proof: result.proof,
        //  publicSignals: result.publicSignals,
        //});
        const proofJson = yield ipfsStorage.getProofJson(did, commitment, {
            proof: result.proof,
            publicSignals: result.publicSignals,
        });
        console.info("proof json: ", proofJson);
        res.json(Object.assign(Object.assign({}, result), { proofJson }));
    }
    catch (error) {
        console.info("..... error: ", error);
        res.status(500).json({ error: error.message });
    }
}));
// Delete Revoke Record Endpoint
app.post('/api/proof/removerevoke', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { proof } = req.body;
    yield ipfsStorage.storeRemoveRevokes(proof);
}));
// Create Revoke Record Endpoint
app.post('/api/proof/revoke', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { commitment, did } = req.body;
    //console.info("...... revoke ........")
    //console.info("body: ", req.body)
    //console.info(" commitment: ", commitment)
    //console.info(" did: ", did)
    // generate revoke proof
    try {
        let tree = yield newMemEmptyTrie();
        let Fr = tree.F;
        yield tree.insert(9, 77);
        yield tree.insert(8, 88);
        yield tree.insert(32, 3232);
        const key = tree.F.e(commitment);
        const value = tree.F.e(70);
        //console.info("old root: ", tree.F.toObject(tree.root),)
        const insertRes = yield tree.insert(key, value);
        let siblings = insertRes.siblings;
        for (let i = 0; i < siblings.length; i++)
            siblings[i] = tree.F.toObject(siblings[i]);
        while (siblings.length < 10)
            siblings.push(0);
        //console.info("new root: ", tree.F.toObject(tree.root),)
        //console.info("------------------------ proof: ", tree.root)
        //console.info("------------------------ siblings: ", siblings)
        const inputs = {
            oldRoot: tree.F.toObject(insertRes.oldRoot),
            newRoot: tree.F.toObject(tree.root),
            siblings: siblings,
            oldKey: insertRes.isOld0 ? 0 : tree.F.toObject(insertRes.oldKey),
            oldValue: insertRes.isOld0 ? 0 : tree.F.toObject(insertRes.oldValue),
            isOld0: insertRes.isOld0 ? 1 : 0,
            newKey: tree.F.toObject(key),
            newValue: tree.F.toObject(value)
        };
        //console.info("revokeInputs: ", exclusionInputs)
        let resultProofInfo = yield revokedkeysCircuit.generateProof(inputs);
        let verifyResult = yield revokedkeysCircuit.verifyProof(resultProofInfo.proof, resultProofInfo.publicSignals);
        const proofUrl = yield ipfsStorage.storeRevoke(commitment, {
            proof: resultProofInfo.proof,
            publicSignals: resultProofInfo.publicSignals,
        });
        console.info("revoke proof url: ", proofUrl);
        res.json(Object.assign(Object.assign({}, resultProofInfo), { proofUrl }));
    }
    catch (error) {
        console.info("..... error: ", error);
        res.status(500).json({ error: error.message });
    }
}));
export default app;
//app.listen(PORT, () => {
//    console.log(`Server running on port ${PORT}`);
//});
//# sourceMappingURL=index.js.map
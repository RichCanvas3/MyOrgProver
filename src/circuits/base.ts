import * as snarkjs from 'snarkjs';
import path from 'path';
import { ProofResponse } from "../models/ProofResponse.js"

//import vKey from './verification_key.json'; // Adjust path as needed

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFileSync } from 'fs';



const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
//const __dirname = dirname("///");

export abstract class BaseCircuit {

  protected wasmPath: string;
  protected zkeyPath: string;
  protected vkeyPath: string;

  protected revokeWasmPath: string;
  protected revokeZkeyPath: string;
  protected revokeVkeyPath: string;

  constructor(circuitName: string) {
    this.wasmPath = path.join(__dirname, `../../circuits/${circuitName}/build/${circuitName}_js/${circuitName}.wasm`);
    this.zkeyPath = path.join(__dirname, `../../circuits/${circuitName}/build/${circuitName}.zkey`);
    this.vkeyPath = path.join(__dirname, `../../circuits/${circuitName}/build/verification_key.json`);
  }



  async generateProof(inputs: any): Promise<ProofResponse> {

    try {
      console.info("fullProve: inputs: ", inputs)
      console.info("fullProve: wasmPath: ", this.wasmPath)
      console.info("fullProve: zkeyPath: ", this.zkeyPath)

      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        inputs,
        this.wasmPath,
        this.zkeyPath
      );
      console.info("proof: ", proof)
      console.info("publicSignals: ", publicSignals)
      return { proof, publicSignals };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Proof generation failed: ${error.message}`);
      } else {
        throw new Error('Proof generation failed: Unknown error');
      }
    }
  }

  async verifyProof(proof: any, publicSignals: string[]): Promise<boolean> {

    try {

      console.info("vkeyPay: ", this.vkeyPath)

      const verificationKey = JSON.parse(readFileSync(this.vkeyPath, 'utf8'));

      try {
        const isValid: boolean = await snarkjs.groth16.verify(verificationKey, publicSignals, proof);

        if (isValid) {
          console.log('✅ Proof is valid!');
        } else {
          console.log('❌ Proof is invalid!');
        }
        return isValid
      } catch (error) {
        console.error('Error during proof verification:', error);
      }

      


      /*
      const keyJson = (await import(this.vkeyPath, { assert: { type: 'json' } })).default;
      //console.info("vKey: ", keyJson)
      //console.info("signals: ", publicSignals)
      //console.info("proof: ", proof)
      return await snarkjs.groth16.verify(keyJson, publicSignals, proof);
      */
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Proof verification failed: ${error.message}`);
      } else {
        throw new Error('Proof verification failed: Unknown error');
      }
    }
  }
    
}
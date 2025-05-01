var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as snarkjs from 'snarkjs';
import path from 'path';
//import vKey from './verification_key.json'; // Adjust path as needed
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFileSync } from 'fs';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
//const __dirname = dirname("///");
export class BaseCircuit {
    constructor(circuitName) {
        this.wasmPath = path.join(__dirname, `../../circuits/${circuitName}/build/${circuitName}_js/${circuitName}.wasm`);
        this.zkeyPath = path.join(__dirname, `../../circuits/${circuitName}/build/${circuitName}.zkey`);
        this.vkeyPath = path.join(__dirname, `../../circuits/${circuitName}/build/verification_key.json`);
    }
    generateProof(inputs) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.info("fullProve: inputs: ", inputs);
                console.info("fullProve: wasmPath: ", this.wasmPath);
                console.info("fullProve: zkeyPath: ", this.zkeyPath);
                const { proof, publicSignals } = yield snarkjs.groth16.fullProve(inputs, this.wasmPath, this.zkeyPath);
                console.info("proof: ", proof);
                console.info("publicSignals: ", publicSignals);
                return { proof, publicSignals };
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Proof generation failed: ${error.message}`);
                }
                else {
                    throw new Error('Proof generation failed: Unknown error');
                }
            }
        });
    }
    verifyProof(proof, publicSignals) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.info("vkeyPay: ", this.vkeyPath);
                const verificationKey = JSON.parse(readFileSync(this.vkeyPath, 'utf8'));
                try {
                    const isValid = yield snarkjs.groth16.verify(verificationKey, publicSignals, proof);
                    if (isValid) {
                        console.log('✅ Proof is valid!');
                    }
                    else {
                        console.log('❌ Proof is invalid!');
                    }
                    return isValid;
                }
                catch (error) {
                    console.error('Error during proof verification:', error);
                }
                /*
                const keyJson = (await import(this.vkeyPath, { assert: { type: 'json' } })).default;
                //console.info("vKey: ", keyJson)
                //console.info("signals: ", publicSignals)
                //console.info("proof: ", proof)
                return await snarkjs.groth16.verify(keyJson, publicSignals, proof);
                */
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Proof verification failed: ${error.message}`);
                }
                else {
                    throw new Error('Proof verification failed: Unknown error');
                }
            }
        });
    }
}
//# sourceMappingURL=base.js.map
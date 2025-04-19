
// ---- Main App from index
import app from "./index.js";
import * as snarkjs from 'snarkjs';
import { existsSync } from 'fs';
const PORT = process.env.PORT || 3051;


/*
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
//const __dirname = dirname("///");



const wasmPath = path.join(__dirname, `../../circuits/website/build/website_js/website.wasm`);
const zkeyPath = path.join(__dirname, `../../circuits/website/build/website.zkey`);
const vkeyPath = path.join(__dirname, `../../circuits/website/build/verification_key.json`);



async function runProof() {
    const inputs = {
      issuerDID: '1224453257791076475827895998426172334658177512758559725856147671075390499124947329511668545977960536580985529397163924739332344946419093343450679',
      orgDID: '1224453257791076475827895998426172334658177512758602884282160546279588122183248648305948985548103623802293636120584694532771846595462873163904307',
      domain: '2805366061387343351326186622295307877510002214704718770029',
      credentialCommitment: '10313732543737604536364050494069127490539234656341839576713749149427028780920'
    };
  
    console.log(" wasmPath:", wasmPath);
    console.log(" wasmPath Exists:", existsSync(wasmPath));
    console.log(" zkeyPath Exists:", existsSync(zkeyPath));

    try {
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(inputs, wasmPath, zkeyPath);
      console.log("Proof:", proof);
      console.log("Public signals:", publicSignals);
    } catch (error) {
      console.error("Proof generation error:", error);
    }
  }
  
  runProof();
*/


app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});


import { BaseCircuit } from './base.js';
import { WebsiteInputs } from '../models/WebsiteInputs.js';
import { ProofResponse } from '../models/ProofResponse.js';

export class WebsiteCircuit extends BaseCircuit {
  constructor() {
    super('website');
  }


  async generateProof(inputs: WebsiteInputs): Promise<ProofResponse> {
    this.validateInputs(inputs);
    return super.generateProof(inputs);
  }


  private validateInputs(inputs: WebsiteInputs): void {
    console.info("org: ", inputs.orgDID.toString()) 
    console.info("issuer: ", inputs.issuerDID.toString()) 
    console.info("credentialHash: ", inputs.credentialHash.toString()) 
    console.info("credentialCommitment: ", inputs.credentialCommitment.toString()) 

    if (!inputs.issuerDID || !inputs.orgDID || !inputs.credentialHash || !inputs.credentialCommitment) {
      throw new Error('Website circuit requires inputs "orgDidHash" and "credentialHash" and "commitment"');
    }

    
  }
}

import { BaseCircuit } from './base.js';
import { ProofResponse } from '../models/ProofResponse.js';

export class RevokedkeysCircuit extends BaseCircuit {
  constructor() {
    super('revokedkeys');
  }


  async generateProof(inputs: any): Promise<ProofResponse> {
    this.validateInputs(inputs);
    console.info("generate proof")
    return super.generateProof(inputs);
  }


  private validateInputs(inputs: any): void {

  
  }
}
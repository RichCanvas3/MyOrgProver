pragma circom 2.0.0;

include "poseidon.circom";

template WebsiteOwnershipProof() {
    signal input orgDID;
    signal input issuerDID;
    signal input credentialHash;
    signal input credentialCommitment;

    // Compute a hash of the credential's key fields (org DID and credentialHash).
    // This represents the credential's content commitment (or Merkle leaf).
    component hashLeaf = Poseidon(2);
    hashLeaf.inputs[0] <== orgDID;
    hashLeaf.inputs[1] <== credentialHash;
    signal leafHash;
    leafHash <== hashLeaf.out;

    // Include issuer DID in the commitment calculation (to bind the hash to a specific issuer)
    component hashCommit = Poseidon(2);
    hashCommit.inputs[0] <== issuerDID;
    hashCommit.inputs[1] <== leafHash;
    signal calcCommit;
    calcCommit <== hashCommit.out;

    // Ensure the calculated commitment equals the expected commitment provided by issuer
    calcCommit === credentialCommitment;

    // (If a Merkle tree of attributes is used, the circuit would take the leaf hash 
    // and verify it against credentialCommitment as the Merkle root using siblings & path bits.
    // That part is omitted here for brevity, but would involve additional signals and constraints.)
}

component main {public [issuerDID, orgDID, credentialCommitment]} = WebsiteOwnershipProof();


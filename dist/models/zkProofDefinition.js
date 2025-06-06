export const zkProofDefinition = {
    models: {
        zkProof: {
            id: 'placeholder-id', // Replace with actual StreamID after deployment
            interface: false,
            implements: [],
            accountRelation: { type: 'single' }, // One proof per DID
        },
    },
    objects: {
        zkProof: {
            issuer: { type: 'did', required: true }, // Use 'did' type for DID strings
            proof: { type: 'string', required: true }, // JSON stringified proof
            publicSignals: {
                type: 'list',
                item: { type: 'string', required: true },
                required: true
            },
            createdAt: { type: 'datetime', required: true },
        },
    },
    enums: {},
    accountData: {
        zkProof: { type: 'node', name: 'zkProof' }, // Match object type name
    },
};
//# sourceMappingURL=zkProofDefinition.js.map
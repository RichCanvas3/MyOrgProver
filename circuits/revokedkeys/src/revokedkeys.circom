pragma circom 2.0.0;

include "smt/smtprocessor.circom";

template SMTUpdateProcessor(depth) {

    // Public inputs
    signal input oldRoot;
    signal input newRoot;

    // Private inputs
    signal input siblings[depth];
    signal input oldKey;
    signal input oldValue;
    signal input isOld0;
    signal input newKey;
    signal input newValue;

    component processor = SMTProcessor(depth);

    processor.fnc[0] <== 1;
    processor.fnc[1] <== 0;
    processor.oldRoot <== oldRoot;
    processor.siblings <== siblings;
    processor.oldKey <== oldKey;
    processor.oldValue <== oldValue;
    processor.isOld0 <== isOld0;
    processor.newKey <== newKey;
    processor.newValue <== newValue;

    // Public outputs
    signal output outOldRoot;
    signal output outNewRoot;

    outOldRoot <== processor.oldRoot;
    outNewRoot <== processor.newRoot;
}

// Example instantiation for a 10-level SMT
component main = SMTUpdateProcessor(10);
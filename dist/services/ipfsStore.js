// src/ipfsStore.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as Client from '@web3-storage/w3up-client';
import { CID } from 'multiformats/cid';
const uploadJSON = (client, json) => __awaiter(void 0, void 0, void 0, function* () {
    const blob = new Blob([JSON.stringify(json)], { type: 'application/json' });
    const file = new File([blob], 'data.json');
    const cid = yield client.uploadFile(file, {
        shardSize: blob.size * 2,
        concurrentRequests: 1
    });
    return 'https://' + cid + '.ipfs.w3s.link';
});
const revokeCid = (client, url) => __awaiter(void 0, void 0, void 0, function* () {
    const cid = url.replace("https://", "").replace(".ipfs.w3s.link", "");
    console.info("url: ", url);
    console.info("cid: ", cid);
    const rootCID = CID.parse(cid);
    //client.remove(rootCID)
});
const downloadJSON = (url) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield fetch(url);
    return yield res.json();
});
export class IPFSStorage {
    constructor(email, spaceDid) {
        this.client = null;
        this.clientPromise = null;
        this.email = email;
        this.spaceDid = spaceDid;
    }
    // Initialize Web3.Storage client
    initializeClient() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.client)
                return this.client;
            if (this.clientPromise)
                return this.clientPromise;
            this.clientPromise = (() => __awaiter(this, void 0, void 0, function* () {
                try {
                    const client = yield Client.create();
                    // Check for existing session
                    const spaces = yield client.spaces();
                    if (!spaces.find((s) => s.did() === this.spaceDid)) {
                        console.info("********************** login and config space");
                        yield client.login(this.email);
                        yield client.setCurrentSpace(this.spaceDid);
                    }
                    else {
                        console.info("********************** config space");
                        yield client.setCurrentSpace(this.spaceDid);
                    }
                    this.client = client;
                    return client;
                }
                catch (err) {
                    throw new Error(`Failed to initialize Web3.Storage client: ${err.message}`);
                }
            }))();
            return this.clientPromise;
        });
    }
    replaceQuotes(obj) {
        if (typeof obj === 'string') {
            // If it's a string, replace single quotes with double quotes
            return obj.replace(/'/g, '"');
        }
        else if (Array.isArray(obj)) {
            // If it's an array, process each element recursively
            return obj.map(item => this.replaceQuotes(item));
        }
        else if (typeof obj === 'object' && obj !== null) {
            // If it's an object, process each property recursively
            const result = {};
            forInstructions: for (const key in obj) {
                result[key] = this.replaceQuotes(obj[key]);
            }
            return result;
        }
        return obj; // Return unchanged if not a string, array, or object
    }
    // Store data in IPFS and return cid
    storeProof(orgDid, vccomm, proofData) {
        return __awaiter(this, void 0, void 0, function* () {
            console.info("********** store proof *********");
            const client = yield this.initializeClient();
            let proofDataUpdated = {
                proof: JSON.stringify(this.replaceQuotes(proofData.proof)),
                publicSignals: this.replaceQuotes(proofData.publicSignals),
                createdAt: new Date().toISOString(),
                vccomm: vccomm,
                orgDid: orgDid
            };
            const cid = yield uploadJSON(client, proofDataUpdated);
            console.info("*************** done cid: ", cid);
            return cid;
        });
    }
    storeRemoveRevokes(proofUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.initializeClient();
            revokeCid(client, proofUrl);
            return true;
        });
    }
    storeRevoke(vccomm, proofData) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.initializeClient();
            console.info("store revoke");
            let proofDataUpdated = {
                proof: JSON.stringify(this.replaceQuotes(proofData.proof)),
                publicSignals: this.replaceQuotes(proofData.publicSignals),
                createdAt: new Date().toISOString(),
                vccomm: vccomm
            };
            const cid = yield uploadJSON(client, proofDataUpdated);
            console.info("cid: ", cid);
            return cid;
        });
    }
    getDidId() {
        if (this.session) {
            return this.session.did.id;
        }
        return "";
    }
    serializeSession() {
        if (this.session) {
            return this.session.serialize();
        }
        return "";
    }
}
// Singleton instance
const ipfsStorage = new IPFSStorage('richardpedersen3@gmail.com', 'did:key:z6MktB5B23hdMsgxopq8EMgVgVJGmmzSXCmX7PWWhEFaGZMW');
export default ipfsStorage;
//# sourceMappingURL=ipfsStore.js.map
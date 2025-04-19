
rm -rf node_modules package-lock.json dist
npm install
npm run build


ipfs daemon  --enable-pubsub-experiment

ceramic is configured by the config file in ~/.ceramic

need to add "admin-dids": ["did:key:z6MkhRb3g295ix52XneQNETCXMFLTCEF8JmE83gJtXwzSxF6"] to config so that composedb can talk to it

to add a model to composite,  note the private key is the one found in the ceramic config file
you can use composedb to construct the private key and determine the did

composedb composite:create models/zkproof.graphql --output=composites/zkproof-composite.json --did-private-key=00d9293c83a9d3697d62e18575db2e89aa4a206c7139ddadcb83ddde20b68615


composedb did:generate-private-key
private-key: 00d9293c83a9d3697d62e18575db2e89aa4a206c7139ddadcb83ddde20b68615
composedb did:from-private-key your-private-key
did: did:key:z6MkhRb3g295ix52XneQNETCXMFLTCEF8JmE83gJtXwzSxF6



ceramic daemon --network inmemory

ceramic daemon --network=inmemory

// I installed cirom from 
git clone https://github.com/iden3/circom.git
cd circom
cargo build --release
cargo install --path circom
circom --version

this resolved problem with having a really old version installed with node

// need to create pot12_0000.ptau file
snarkjs powersoftau new bn128 12 pot12_0000.ptau -v
snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v
snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v

snarkjs powersoftau new bn128 14 pot14_0000.ptau -v
snarkjs powersoftau prepare phase2 pot14_0000.ptau pot14_final.ptau -v

circom circuits/website/src/website.circom --r1cs --wasm --sym -l node_modules/circomlib/circuits -o circuits/website/build/ 
npx snarkjs groth16 setup circuits/website/build/website.r1cs pot12_final.ptau circuits/website/build/website.zkey
npx snarkjs zkey contribute circuits/website/build/website.zkey circuits/website/build/website.zkey --name="Second contribution" 
npx snarkjs zkey export verificationkey circuits/website/build/website.zkey circuits/website/build/verification_key.json


rm -rf circuits/website/build/website_js/*.dat
rm -rf circuits/website/build/website_js/witness_calculator.js

--- worked
circom circuits/website/src/website.circom --r1cs --wasm --sym -l node_modules/circomlib/circuits  -o circuits/website/build/
snarkjs wtns calculate circuits/website/build/website_js/website.wasm input.json witness.wtns
snarkjs groth16 setup circuits/website/build/website.r1cs pot12_final.ptau circuits/website/build/website.zkey
snarkjs zkey export verificationkey circuits/website/build/website.zkey circuits/website/build/verification_key.json

snarkjs groth16 prove dist/circuits/website/build/website.zkey witness.wtns proof.json public.json
snarkjs groth16 verify dist/circuits/website/build/verification_key.json public.json proof.json


circom circuits/revokedkeys/src/revokedkeys.circom --r1cs --wasm --sym -l node_modules/circomlib/circuits  -o circuits/revokedkeys/build/
snarkjs groth16 setup circuits/revokedkeys/build/revokedkeys.r1cs pot14_final.ptau circuits/revokedkeys/build/revokedkeys.zkey
snarkjs zkey export verificationkey circuits/revokedkeys/build/revokedkeys.zkey circuits/revokedkeys/build/verification_key.json



snarkjs groth16 prove dist/circuits/website/build/website.zkey witness.wtns proof.json public.json
snarkjs groth16 verify dist/circuits/website/build/verification_key.json public.json proof.json



snarkjs zkey contribute circuits/website/build/website.zkey circuits/website/build/website.zkey -e="random entropy"


curl -X POST http://localhost:3051/api/proof/website -H "Content-Type: application/json" -d '{"a": 3, "b": 4}'
curl -X POST http://localhost:3051/api/verify/website -H "Content-Type: application/json"  -d '{"proof":{"pi_a":["17699507826194437790475562670780415602832993547345042523897710000361062341165","16727506141470727458719187337936742769847451392793081366725938621813400472156","1"],"pi_b":[["9205870514363244999294107052774032449484497393588609980170601120708986430580","16496432854481141289630959308806383759023032452540324101328140218956860470238"],["14372599952623296337019807644268724762661017896386928512049031976132441231892","2921520560124987432500295568697035119753985105480536975904902622514413010820"],["1","0"]],"pi_c":["10751125193797806616660749480324396201007200303432686715591316833967717720625","17923415921156881798094814111238494783141552735544792701593449038117989151361","1"],"protocol":"groth16","curve":"bn128"},"publicSignals":["12"]}'

// running as service that myorgwallet can call and pass walletClient
npx ts-node src/index.ts















{
  "anchor": {
    "auth-method": "did"
  },
  "http-api": {
    "cors-allowed-origins": [
      ".*"
    ],
    "admin-dids": ["did:key:z6MkhRb3g295ix52XneQNETCXMFLTCEF8JmE83gJtXwzSxF6"]
  },
  "ipfs": {
    "mode": "remote",
    "host": "http://localhost:5101",
    "disable-peer-data-sync": false
  },
  "logger": {
    "log-level": 2,
    "log-to-files": false
  },
  "metrics": {
    "metrics-exporter-enabled": false,
    "metrics-publisher-enabled": true
  },
  "network": {
    "name": "inmemory"
  },
  "node": {
    "privateSeedUrl": "inplace:ed25519#00d9293c83a9d3697d62e18575db2e89aa4a206c7139ddadcb83ddde20b68615"
  },
  "state-store": {
    "mode": "fs",
    "local-directory": "/home/barb/.ceramic/statestore/"
  },
  "indexing": {
    "db": "sqlite:///home/barb/.ceramic/indexing.sqlite",
    "allow-queries-before-historical-sync": true,
    "disable-composedb": false,
    "enable-historical-sync": false
  }
}



query FilterByVccomm($input: zkRevokeFiltersInput!) {
  zkRevokeIndex(filters: $input, first: 50) {
    edges {
      node {
        vccomm
      }
    }
  }
}

{
  "input": {
    "where": {
      "vccomm": {
        "equalTo": "15115509963679452460572348145536387568972352282604259974269146438414357126227"
      }
    }
  }
}


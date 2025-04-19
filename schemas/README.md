Ceramic configuration is in the ~/.ceramic directory

need to add "admin-dids": ["did:key:z6MkhRb3g295ix52XneQNETCXMFLTCEF8JmE83gJtXwzSxF6"] to config so that composedb can talk to it



PRIVATE KEY
30842639032b4bc67450665c799148c10a28d21156c5a0163375c16e7149f3b6


privateSeedUrl": "inplace:ed25519#e92129866bf2d067a8842934ae9d1ad682d7655d087eba6d751d74ca8b192d66"

DID Key
did:key:z6MkepYyWkz2smqH6Qc4Xu8jWjUxQqw8ZKGi3xcAb4no2wKN


composedb graphql:server --ceramic-url=http://localhost:7007 --did-private-key=aee54228052a73b7b866379b5b8fe5260b7330b2899321596acf4d26f5f50dc5 --port=5005

rm -rf ~/.ceramic/indexing.sqlite
rm -rf ~/.ceramic/statestore
rm -rf ~/.ceramic/pinning.sqlite

Query proofs

query GetAllWebsiteProofs($first: Int = 100, $after: String) {
  zkProofIndex(first: $first, after: $after) {
    edges {
      node {
        id
        issuer {
          id
        }
        publicSignals
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
# Blockchain Technology – Project 4
## Non-Fungible Tokens (NFTs) with Metadata

This project is based on the DecodeLabs Industrial Training Kit, Batch 2026, Blockchain Technology, Project 4.

### PDF requirements implemented
- ERC-721 NFT standard
- `mintNFT()` for creating a unique digital asset
- `ownerOf()` for checking ownership
- Off-chain metadata linked through a simple metadata file path
- Ownership data displayed after a successful transaction
- Local Hardhat blockchain for testing
- Browser frontend using MetaMask and ethers.js

The PDF describes this as an optional mastery project focused on unique assets and off-chain metadata. fileciteturn1file0L8-L20

## Project structure

```text
blockchain-project-4-nft/
├── contracts/
│   └── Project4NFT.sol
├── scripts/
│   └── deploy.js
├── test/
│   └── Project4NFT.test.js
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   └── metadata/
│       └── nft-1.json
├── .gitignore
├── hardhat.config.js
├── package.json
└── README.md
```

## 1. Install Node.js

Install Node.js 18 or newer.

Then open a terminal in this project folder.

## 2. Install dependencies

```bash
npm install
```

## 3. Run the automated tests

```bash
npx hardhat test
```

The tests verify:
- NFT minting
- `ownerOf`
- token URI / metadata path
- unique token IDs
- invalid zero-address mint protection

## 4. Start the local blockchain

Open Terminal 1:

```bash
npx hardhat node
```

Keep this terminal running.

## 5. Deploy the NFT contract

Open Terminal 2 in the same project folder:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

Copy the NFT contract address printed in the terminal.

## 6. Connect MetaMask to Hardhat Local

Use these values:

```text
Network name: Hardhat Local
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency symbol: ETH
```

For local testing only, import one of the private keys printed by `npx hardhat node` into MetaMask.

Do NOT publish Hardhat private keys to GitHub or use them with real funds.

## 7. Start the frontend

Open Terminal 3:

```bash
npx serve frontend
```

Open the local address shown by `serve`.

## 8. Use the NFT application

1. Click **Connect Wallet**.
2. Paste the deployed contract address.
3. Click **Load NFT Contract**.
4. Enter a metadata URI. The default example is:
   `metadata/nft-1.json`
5. Click **Mint NFT**.
6. Confirm the transaction in MetaMask.
7. After confirmation, the page displays:
   - Token ID
   - Owner address
   - Metadata URI
   - Metadata loaded from the JSON file

## 9. What to demonstrate for submission

Take screenshots showing:
1. Hardhat node running.
2. Contract deployment and contract address.
3. MetaMask connected.
4. NFT contract address loaded.
5. Successful NFT mint transaction.
6. Token ID and owner address.
7. Metadata URI and metadata details.
8. Automated test results.

## Notes

The PDF specifically asks for ERC-721 `mint` and `ownerOf`, metadata linkage through a placeholder/simple file path, and clear ownership display after a successful transaction. fileciteturn1file0L22-L38

Optional features mentioned in the PDF are not required for the core submission. The implementation here stays focused on the stated Project 4 requirements.

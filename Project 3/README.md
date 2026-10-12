# Blockchain Technology – Project 3
## ERC-20 Token Wallet & Value Transfer

This project implements the requirements from the DecodeLabs Project 3 brief:

- Standard ERC-20 `transfer` and `balanceOf` functions
- User input for recipient address and token amount
- Validation so a user cannot transfer more tokens than their available balance
- A simple wallet interface for viewing balance and performing an on-chain transfer

> The PDF also mentions optional extensions such as a gas-fee estimator and transaction history. They are not required for the core submission and are therefore not necessary to run this project.

## Project structure

```text
erc20-token-wallet-project3/
├── contracts/
│   └── Project3Token.sol
├── scripts/
│   └── deploy.js
├── test/
│   └── Project3Token.test.js
├── frontend/
│   ├── index.html
│   ├── app.js
│   └── style.css
├── hardhat.config.js
├── package.json
├── .gitignore
└── README.md
```

## 1. Requirements

Install Node.js 18+.

Install MetaMask or another injected EVM wallet if you want to use the browser interface.

## 2. Install dependencies

```bash
npm install
```

## 3. Run the local blockchain

Open a terminal:

```bash
npx hardhat node
```

Keep it running. Hardhat will print test accounts and their private keys.

## 4. Deploy the ERC-20 token

In another terminal:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

Copy the deployed contract address printed in the terminal.

## 5. Run the tests

```bash
npx hardhat test
```

The tests cover:
- initial balance
- `balanceOf`
- successful `transfer`
- insufficient-balance rejection
- invalid zero-address recipient
- transfer event

## 6. Open the frontend

The frontend is a static application. The easiest option is to serve the `frontend` folder:

```bash
npx serve frontend
```

Then open the local address shown by the command.

Paste the deployed token contract address into the frontend and connect your wallet.

### Local MetaMask setup

For a local Hardhat network, add a custom network with:

- Network name: Hardhat Local
- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `31337`
- Currency symbol: ETH

For testing, import one of the private keys printed by `npx hardhat node` into MetaMask. Never use a Hardhat development private key with real funds.

## 7. Using the wallet

1. Connect the wallet.
2. Enter the deployed token contract address.
3. Click **Load Token**.
4. Enter a recipient address.
5. Enter the token amount.
6. Click **Transfer Tokens**.
7. The application reads the current `balanceOf` value before sending.
8. If the amount is greater than the available balance, the transaction is stopped in the frontend.
9. The smart contract also enforces the balance rule, so the transfer cannot succeed on-chain when the sender lacks sufficient tokens.

## Core implementation

The Solidity contract exposes the standard ERC-20-style:

```solidity
function balanceOf(address account) external view returns (uint256);
function transfer(address to, uint256 value) external returns (bool);
```

The contract stores balances as integer token units using 18 decimals. The frontend converts the human-readable amount to the token's smallest unit before sending the transaction.

## Security notes

- Recipient addresses are validated before a transaction is sent.
- Amounts must be positive.
- Frontend balance validation improves user experience.
- The smart contract performs the authoritative balance check.
- Never enter a real wallet private key into the website.
- Do not deploy this educational contract with real funds without a proper security review.

## Submission checklist

- [ ] `contracts/Project3Token.sol`
- [ ] `scripts/deploy.js`
- [ ] `test/Project3Token.test.js`
- [ ] `frontend/`
- [ ] `package.json`
- [ ] `hardhat.config.js`
- [ ] `README.md`
- [ ] Screenshot of successful wallet connection
- [ ] Screenshot of token balance
- [ ] Screenshot of successful transfer
- [ ] Screenshot of insufficient-balance validation

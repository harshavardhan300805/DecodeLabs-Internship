# DecodeLabs Blockchain Technology — Project 2
## Decentralized Voting System with Smart Contracts

This project implements the requirements in the supplied DecodeLabs Project 2 procedure PDF.

The PDF requires:
- a Solidity smart contract for proposal submission and vote casting;
- authorization of specific voters;
- prevention of double voting;
- dynamic winning-proposal calculation using `if/else` or equivalent control logic;
- smart-contract state management and basic access control.

The implementation also follows the procedure's illustrated concepts: a voter mapping, proposal state, `require()`-based security checks, state update before tally interaction, and a dynamic winner scan.

## Technology

- Solidity 0.8.24
- Hardhat
- ethers.js through Hardhat Toolbox
- Mocha/Chai tests
- Local Hardhat EVM

No MetaMask or real network is required to run the automated demonstration.

## Project structure

```text
DecodeLabs_Blockchain_Project_2/
├── contracts/
│   └── VotingProtocol.sol
├── scripts/
│   ├── deploy.js
│   └── demo.js
├── test/
│   └── VotingProtocol.js
├── hardhat.config.js
├── package.json
├── README.md
└── .gitignore
```

## Requirements

Install:
- Node.js 18+ recommended
- npm
- Git (only if uploading to GitHub)

Check:

```powershell
node --version
npm --version
```

## Install dependencies

Open PowerShell in the project folder:

```powershell
npm install
```

## Compile the smart contract

```powershell
npm run compile
```

Successful compilation creates the `artifacts/` directory.

## Run all tests

```powershell
npm test
```

The tests cover:
1. Chairperson creation.
2. Proposal submission.
3. Proposal access control.
4. Voter authorization.
5. Unauthorized vote rejection.
6. Successful vote casting.
7. Double-vote rejection.
8. Invalid proposal rejection.
9. Dynamic winner calculation.
10. Final tally verification.

## Run the complete demonstration

```powershell
npm run demo
```

The demo:
- deploys the contract to Hardhat's local EVM;
- creates three proposals;
- authorizes three voters;
- casts three votes;
- calculates the winner dynamically;
- demonstrates unauthorized voting rejection;
- demonstrates double-voting rejection.

Expected winner in the demo:

```text
Gamma
```

because Gamma receives two votes while Alpha receives one.

## Local deployment

```powershell
npm run deploy:local
```

This deploys the contract to a temporary Hardhat network and prints its address.

## Contract logic

### Chairperson / access control

The account that deploys the contract becomes the immutable `chairperson`.

Only the chairperson can:
- authorize voters;
- submit proposals.

### Voter state

Each voter stores:

```solidity
uint256 weight;
bool voted;
address delegate;
uint256 vote;
```

Authorized voters receive weight `1`.

### Proposal state

Each proposal stores:

```solidity
bytes32 name;
uint256 voteCount;
```

### Voting

`vote(proposalIndex)` checks:

```text
proposal index is valid
        ↓
voter is authorized
        ↓
voter has not already voted
        ↓
voted = true
        ↓
selected proposal stored
        ↓
proposal voteCount increases
```

This prevents the same authorized address from voting twice.

### Dynamic winner

`winningProposal()` scans the proposals and uses conditional logic to retain the proposal with the highest vote count.

The procedure PDF highlights that this loop is linear in the number of proposals, so extremely large proposal sets would increase execution cost. This educational project therefore keeps the implementation simple and transparent.

## Security behavior demonstrated

### Unauthorized voter

An address with zero voter weight receives:

```text
Not an authorized voter
```

### Double voting

After an address votes once, another call from that address receives:

```text
Already voted
```

### Invalid proposal

A proposal index outside the array receives:

```text
Invalid proposal index
```

## Scope

This is an educational local-EVM smart-contract project. It is not intended to be a production election system. The optional ideas in the PDF's conclusion, such as timed voting and weighted voting based on token ownership, are not treated as mandatory requirements.

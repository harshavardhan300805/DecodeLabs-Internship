# DecodeLabs Blockchain Technology — Project 1
## Building a Mini-Blockchain

This project implements the core procedure described in the supplied DecodeLabs Project 1 training PDF.

### Requirements covered

- **Block data structure:** `index`, `timestamp`, `data/transactions`, `previous_hash`, `nonce`, and `hash`.
- **Cryptographic engine:** SHA-256 deterministic hashing.
- **Proof of Work:** nonce starts at `0` and increments until the hash begins with the required number of zeroes.
- **Genesis block:** block `0` has `previous_hash = "0"`.
- **Chain validation:** checks both stored-hash integrity and previous-hash linkage across the entire chain.
- **Execution milestone:** creates the Genesis block, mines **3 subsequent blocks**, validates the chain, and simulates tampering.

The procedure PDF specifies a target of `0000` (four leading zeroes), so the main demonstration uses **difficulty 4**.

## Project structure

```text
mini-blockchain-project-1/
├── blockchain.py
├── main.py
├── test_blockchain.py
├── requirements.txt
└── README.md
```

## How to run

Python 3.9+ is recommended. No external packages are required.

### 1. Open the project folder

```bash
cd mini-blockchain-project-1
```

### 2. Run the demonstration

```bash
python main.py
```

The program prints all four blocks, including their transaction payloads, previous hashes, nonces, and SHA-256 hashes.

It then prints:

```text
Blockchain valid: True
```

After changing Block 1's data without re-mining, it prints:

```text
Blockchain valid after tampering: False
```

### 3. Run the tests

```bash
python -m unittest -v
```

All tests should pass.

## How the blockchain works

For each block, the hash is calculated from:

```text
index + timestamp + data + previous_hash + nonce
```

The SHA-256 result becomes the block's digital fingerprint.

During mining:

```text
nonce = 0
while hash does not start with "0000":
    nonce = nonce + 1
    calculate SHA-256 again
```

When a valid hash is found, the block is appended to the chain.

### Validation

For every block after the Genesis block, validation checks:

1. `calculate_hash()` equals the stored `hash`.
2. `current.previous_hash` equals `previous.hash`.
3. The block hash satisfies the configured Proof-of-Work target.

One failed check makes the complete chain invalid.

## Tampering demonstration

The demo changes a transaction amount in Block 1 without changing its stored hash. Because the block's data no longer produces the stored SHA-256 fingerprint, `is_valid()` returns `False`.

This demonstrates the cascading integrity principle described in the training material: changing an earlier block breaks the cryptographic linkage to later blocks.

## Important learning note

This is an educational single-node blockchain, not a production cryptocurrency or distributed network. It demonstrates the structural and cryptographic foundations requested for Project 1.

"""
Run the DecodeLabs Mini-Blockchain demonstration.

The demo:
1. Creates the Genesis block.
2. Mines three subsequent blocks.
3. Validates the complete chain.
4. Simulates tampering and validates again.
"""

from blockchain import Blockchain


def print_block(block):
    print(f"\nBlock {block.index}")
    print(f"  Timestamp    : {block.timestamp}")
    print(f"  Data         : {block.data}")
    print(f"  Previous Hash: {block.previous_hash}")
    print(f"  Nonce        : {block.nonce}")
    print(f"  Hash         : {block.hash}")


def main():
    blockchain = Blockchain(difficulty=4)

    blockchain.add_block({
        "sender": "Alice",
        "receiver": "Bob",
        "amount": 25,
    })
    blockchain.add_block({
        "sender": "Bob",
        "receiver": "Carol",
        "amount": 10,
    })
    blockchain.add_block({
        "sender": "Carol",
        "receiver": "Dave",
        "amount": 5,
    })

    print("=" * 72)
    print("DECODELABS - PROJECT 1: MINI-BLOCKCHAIN")
    print("=" * 72)
    print(f"Proof-of-Work difficulty: {blockchain.difficulty} leading zeroes")
    print(f"Total blocks: {len(blockchain.chain)}")

    for block in blockchain.chain:
        print_block(block)

    print("\n" + "-" * 72)
    print("VALIDATION BEFORE TAMPERING")
    print("-" * 72)
    print(f"Blockchain valid: {blockchain.is_valid()}")

    print("\n" + "-" * 72)
    print("TAMPERING SIMULATION")
    print("-" * 72)
    print("Changing Block 1 transaction amount from 25 to 999 without re-mining...")
    blockchain.tamper_data(1, {
        "sender": "Alice",
        "receiver": "Bob",
        "amount": 999,
    })
    print(f"Blockchain valid after tampering: {blockchain.is_valid()}")
    print("Expected result: False (stored hash no longer matches block data).")


if __name__ == "__main__":
    main()

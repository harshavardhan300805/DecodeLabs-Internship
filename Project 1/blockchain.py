"""
DecodeLabs - Blockchain Technology Project 1
Mini-Blockchain implementation based on the supplied procedure PDF.

Core requirements:
- Block class with index, timestamp, payload, previous hash, nonce, hash
- SHA-256 deterministic hashing
- Proof-of-Work mining loop
- Blockchain validation with hash-integrity and previous-hash linkage checks
"""

from __future__ import annotations

from dataclasses import dataclass, asdict
from datetime import datetime, timezone
import hashlib
import json
from typing import Any, List


@dataclass
class Block:
    index: int
    timestamp: str
    data: Any
    previous_hash: str
    nonce: int = 0
    hash: str = ""

    def calculate_hash(self) -> str:
        """Create the block's SHA-256 fingerprint from all required fields."""
        payload = {
            "index": self.index,
            "timestamp": self.timestamp,
            "data": self.data,
            "previous_hash": self.previous_hash,
            "nonce": self.nonce,
        }
        encoded = json.dumps(
            payload,
            sort_keys=True,
            separators=(",", ":"),
            ensure_ascii=False,
        ).encode("utf-8")
        return hashlib.sha256(encoded).hexdigest()

    def mine(self, difficulty: int = 4) -> int:
        """Run Proof of Work until the hash starts with difficulty zeroes."""
        if difficulty < 1:
            raise ValueError("Difficulty must be at least 1.")

        target = "0" * difficulty
        self.nonce = 0

        while True:
            candidate = self.calculate_hash()
            if candidate.startswith(target):
                self.hash = candidate
                return self.nonce
            self.nonce += 1

    def to_dict(self) -> dict:
        return asdict(self)


class Blockchain:
    """A simple single-node blockchain for learning purposes."""

    def __init__(self, difficulty: int = 4):
        if difficulty < 1:
            raise ValueError("Difficulty must be at least 1.")

        self.difficulty = difficulty
        self.chain: List[Block] = [self.create_genesis_block()]

    @staticmethod
    def now_iso() -> str:
        return datetime.now(timezone.utc).isoformat()

    def create_genesis_block(self) -> Block:
        """Block 0 has no parent; its previous_hash is hardcoded to '0'."""
        block = Block(
            index=0,
            timestamp=self.now_iso(),
            data={"message": "Genesis Block"},
            previous_hash="0",
        )
        block.mine(self.difficulty)
        return block

    def get_latest_block(self) -> Block:
        return self.chain[-1]

    def add_block(self, data: Any) -> Block:
        """Create, mine, and append a new block."""
        previous = self.get_latest_block()
        block = Block(
            index=len(self.chain),
            timestamp=self.now_iso(),
            data=data,
            previous_hash=previous.hash,
        )
        block.mine(self.difficulty)
        self.chain.append(block)
        return block

    def is_valid(self) -> bool:
        """
        Validate the entire chain using the two checks from the procedure:
        1. Stored hash must equal a freshly calculated hash.
        2. Current block's previous_hash must equal previous block's hash.
        """
        target = "0" * self.difficulty

        # Genesis block integrity and special parent rule.
        genesis = self.chain[0]
        if genesis.previous_hash != "0":
            return False
        if genesis.hash != genesis.calculate_hash():
            return False
        if not genesis.hash.startswith(target):
            return False

        # Blocks 1..N: hash integrity + previous-hash linkage.
        for current, previous in zip(self.chain[1:], self.chain[:-1]):
            if current.hash != current.calculate_hash():
                return False
            if not current.hash.startswith(target):
                return False
            if current.previous_hash != previous.hash:
                return False

        return True

    def tamper_data(self, index: int, new_data: Any) -> None:
        """Change data without re-mining, intentionally breaking integrity."""
        if index < 0 or index >= len(self.chain):
            raise IndexError("Block index is out of range.")
        if index == 0:
            raise ValueError("Genesis block should not be tampered with in this demo.")
        self.chain[index].data = new_data

    def to_dict(self) -> dict:
        return {
            "difficulty": self.difficulty,
            "chain": [block.to_dict() for block in self.chain],
        }

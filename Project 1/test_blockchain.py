import unittest

from blockchain import Blockchain


class MiniBlockchainTests(unittest.TestCase):
    def setUp(self):
        # Difficulty 2 keeps tests fast while preserving the same PoW logic.
        self.blockchain = Blockchain(difficulty=2)
        self.blockchain.add_block({"sender": "A", "receiver": "B", "amount": 10})
        self.blockchain.add_block({"sender": "B", "receiver": "C", "amount": 5})
        self.blockchain.add_block({"sender": "C", "receiver": "D", "amount": 2})

    def test_genesis_block(self):
        genesis = self.blockchain.chain[0]
        self.assertEqual(genesis.index, 0)
        self.assertEqual(genesis.previous_hash, "0")
        self.assertTrue(genesis.hash.startswith("00"))

    def test_three_subsequent_blocks_exist(self):
        self.assertEqual(len(self.blockchain.chain), 4)

    def test_chain_is_valid(self):
        self.assertTrue(self.blockchain.is_valid())

    def test_previous_hash_linkage(self):
        for current, previous in zip(
            self.blockchain.chain[1:], self.blockchain.chain[:-1]
        ):
            self.assertEqual(current.previous_hash, previous.hash)

    def test_tampering_is_detected(self):
        self.blockchain.tamper_data(1, {"sender": "A", "receiver": "B", "amount": 9999})
        self.assertFalse(self.blockchain.is_valid())


if __name__ == "__main__":
    unittest.main()

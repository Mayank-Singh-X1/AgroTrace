import hashlib
import json
import time

class Blockchain:
    def __init__(self):
        self.chain = []
        self.pending_transactions = []
        self.create_block(previous_hash='0', proof=100)

    def create_block(self, proof, previous_hash):
        block = {
            'index': len(self.chain) + 1,
            'timestamp': time.time(),
            'transactions': self.pending_transactions,
            'proof': proof,
            'previous_hash': previous_hash or self.hash(self.chain[-1])
        }
        self.pending_transactions = []
        self.chain.append(block)
        return block

    def get_last_block(self):
        return self.chain[-1]

    def add_transaction(self, sender, receiver, amount, product_id, transaction_type):
        self.pending_transactions.append({
            'sender': sender,
            'receiver': receiver,
            'amount': amount,
            'product_id': product_id,
            'type': transaction_type
        })
        return self.get_last_block()['index'] + 1

    def proof_of_work(self, last_proof):
        proof = 0
        while self.valid_proof(last_proof, proof) is False:
            proof += 1
        return proof

    @staticmethod
    def valid_proof(last_proof, proof):
        guess = f'{last_proof}{proof}'.encode()
        guess_hash = hashlib.sha256(guess).hexdigest()
        return guess_hash[:4] == "0000"

    @staticmethod
    def hash(block):
        encoded_block = json.dumps(block, sort_keys=True).encode()
        return hashlib.sha256(encoded_block).hexdigest()

    def is_chain_valid(self, chain):
        previous_block = chain[0]
        block_index = 1
        while block_index < len(chain):
            block = chain[block_index]
            if block['previous_hash'] != self.hash(previous_block):
                return False
            if not self.valid_proof(previous_block['proof'], block['proof']):
                return False
            previous_block = block
            block_index += 1
        return True

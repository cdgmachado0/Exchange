const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042; //3042

const SHA256 = require('crypto-js/sha256');
const { signTx, verifyTx, addBlockToChain, mineRopsteinBlock } = require('./scripts/handleTx');

const { blockchain, merkleTree } = require('./db');

app.use(cors());
app.use(express.json());

const { addressesAndKeys, addresses } = require('./keys');

//Set up initial addresses with their balances
const balances = {};
const initialBalances = [100, 50, 75];
initialBalances.forEach((balance, i) => balances[addresses[i]] = balance);

//Start getting hashes from Ropstein
setInterval(() => {
  mineRopsteinBlock();
}, 15000);

//Routes
app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post('/send', async (req, res) => {
  const { sender, recipient, amount, transaction, inputted_privateKey } = req.body;
  const hashedTx = SHA256(transaction + Date.now());
  //Sign tx
  const signature = signTx(inputted_privateKey, hashedTx);
  //Verify signature
  const publicKey = addressesAndKeys.map(x => {
    if (sender === x.address) return x.publicKey
  });

  if (!verifyTx(hashedTx, signature, publicKey[0])) {
    res.send({
      message: "You're not authorized to make this transaction",
      authorized: false
    }).end();
    return;
  }
  //Adds to blockchain and Merkle Tree
  let lastBlock; //make the has from ropstein an object and add the previousHash
  for (let i = 0; i < blockchain.chain.length; i++) {
    if (typeof blockchain.chain[i] !== 'string') {
      lastBlock = blockchain.chain[i];
      break;
    }
  }
  console.log('lasBlock: ', lastBlock);
  await addBlockToChain(lastBlock, hashedTx, blockchain);
  
  const isValidChain = blockchain.isValid();

  balances[sender] -= amount;
  balances[recipient] = (balances[recipient] || 0) + +amount;
  res.send({
    balance: balances[sender],
    authorized: true,
    isValidChain,
    blockchain
  });
});


//****** */
// app.set('port', process.env.PORT || 5000);

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
  console.log(addressesAndKeys);
});



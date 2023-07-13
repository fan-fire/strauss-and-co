const ethers = require("ethers");
const fs = require("fs");

const wallet = ethers.Wallet.createRandom();
const wallet2 = ethers.Wallet.createRandom();
const wallet3 = ethers.Wallet.createRandom();
const wallet4 = ethers.Wallet.createRandom();
const wallet5 = ethers.Wallet.createRandom();
const wallet6 = ethers.Wallet.createRandom();

const wallets = [wallet, wallet2, wallet3, wallet4, wallet5, wallet6];
const walletNames = [
  "screaming-eagle",
  "yquem",
  "penfolds",
  "harlan",
  "romanee",
  "mouton",
];
const privateKeys = wallets.map((wallet) => wallet.privateKey);
const addresses = wallets.map((wallet) => wallet.address);

const output = {};

for (let i in walletNames) {
  output[walletNames[i]] = {
    privateKey: privateKeys[i],
    address: addresses[i],
  };
}

fs.writeFileSync("private-keys.json", JSON.stringify(output, null, 2));

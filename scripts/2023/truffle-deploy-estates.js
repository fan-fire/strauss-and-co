const FF721Harlan = artifacts.require("FF721Harlan");
const FF721Romanee = artifacts.require("FF721Romanee");
const FF721Penfolds = artifacts.require("FF721Penfolds");
const FF721ScreamingEagle = artifacts.require("FF721ScreamingEagle");
const FF721Mouton = artifacts.require("FF721Mouton");
const FF721Yquem = artifacts.require("FF721Yquem");

const contracts = {
  "screaming-eagle": {
    contract: FF721ScreamingEagle,
  },
  yquem: {
    contract: FF721Yquem,
  },
  penfolds: {
    contract: FF721Penfolds,
  },
  harlan: {
    contract: FF721Harlan,
  },
  romanee: {
    contract: FF721Romanee,
  },
  mouton: {
    contract: FF721Mouton,
  },
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const config = require("./config.json");

async function main() {
  for (let i in contracts) {
    console.log(`\n\nDeploying ${i}...`);
    let contract = contracts[i]["contract"];
    let instance = await contract.new();
    console.log(`${i} address: ${instance.address}`);
    await sleep(3000);
    const MINTER_ROLE = await instance.MINTER_ROLE();
    await instance.grantRole(MINTER_ROLE, config[i].address);
    await sleep(3000);
    console.log(`Minter role granted to ${config[i].address}`);
  }
}

module.exports = async (callback) => {
  try {
    await main();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }

  callback();
};

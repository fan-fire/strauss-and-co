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
    console.log(`\n\nConnecting ${i}...`);
    let contract = contracts[i]["contract"];
    let address = config[i]["deployedAddress"];
    let instance = await contract.at(address);
    console.log(`Connected to ${i} at ${instance.address}`);

    const MINTER_ROLE = await instance.MINTER_ROLE();

    const minter = config[i]["address"];
    console.log(`Revoking MINTER_ROLE from ${minter}...`);
    await instance.revokeRole(MINTER_ROLE, minter);
    await sleep(2000);

    console.log(`\n\nDone with ${i}...`);
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

const BasketStrauss2022 = artifacts.require("BasketStrauss2022");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const config = require("./config.json");

async function main() {
  const straussWallet = "0x25375E1DaFa37a31069d323a37A6f93eaF356123";

  // let basket = await BasketStrauss2022.at("0x2802551F79279079C8F65767862D58ca5609D33f");
  console.log("Deploying basket");
  let basket = await BasketStrauss2022.new();
  console.log(`Basket address: ${basket.address}`);
  await sleep(3000);

  const adders = [
    "0x94813E2a30871ad0D954C9f45eaE1b8a923Ed11e",
    "0x011c2a4457A1F262481E10534B5130104622fc10",
    "0xBE9cE10942D0648b56722e0a0D8ecc933d123563",
    "0x4f2d3fF9b1f42401b72Bb4378b2513447d150956",
    "0x797D27c6767221E71590D0692ce9b9096bdd3C65",
  ];

  for (let i = 0; i < adders.length; i++) {
    console.log(`Granting ADDER_ROLE to ${adders[i]}`);
    await basket.grantRole(await basket.ADDER_ROLE(), adders[i]);
    await sleep(3000);
  }

  console.log(`Granting MINTER_ROLE to ${straussWallet}`);
  const MINTER_ROLE = await basket.MINTER_ROLE();
  await basket.grantRole(MINTER_ROLE, straussWallet);
  console.log(`Minter role granted to ${straussWallet}`);
  await sleep(10000);

  const total = 5;
  console.log(`Minting ${total} tokens...`);

  for (let i = 0; i < total; i++) {
    console.log(`Minting ${i}.json`);
    await basket.mint(straussWallet, `${i}.json`);
    await sleep(4000);
  }

  console.log(`Revoking MINTER_ROLE from ${straussWallet}`);
  await basket.revokeRole(MINTER_ROLE, straussWallet);
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

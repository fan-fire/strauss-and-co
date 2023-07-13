import { ethers } from "hardhat";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const SLEEP_TIME = 5000;

const openSeaLinks = {
    'mumbai': 'https://testnets.opensea.io/assets/mumbai',
    'polygon': 'https://opensea.io/assets/polygon',
}
const estate = 'screaming-eagle'
// const estate = 'yquem'
// const estate = 'penfolds'
// const estate = 'harlan'
// const estate = 'romanee'
// const estate = 'mouton'
const config = require('./config.json');
console.log(config[estate]);

async function main() {
    if (!config[estate]) {
        throw new Error(`Estate ${estate} not found in config`);
    }

    console.log(`Minting ${config[estate].tokens} tokens for ${estate}...`);

    const privateKey = config[estate].privateKey;
    const minter = new ethers.Wallet(privateKey, ethers.provider);
    console.log(`Minting using account: ${minter.address}`);

    console.log("Account balance:", (ethers.utils.formatEther(await minter.getBalance())).toString());
    const deployedAddress = config[estate].deployedAddress;
    const ff721 = await ethers.getContractAt("FF721ScreamingEagle", deployedAddress);
    console.log("FF721 connect @ address:", ff721.address);

    const total = config[estate].tokens;
    for (let i = 0; i < total; i++) {
        console.log(`${estate}: Minting token ${i} of ${total}...`);
        await ff721.connect(minter).mint(minter.address, `${i}.json`, { gasPrice: 400e9 });
        await sleep(SLEEP_TIME);
    }

    const network = await ethers.provider.getNetwork();
    const networkName = network.name === 'polygon' ? 'polygon' : 'mumbai';
    console.log(`View on OpenSea: ${openSeaLinks[networkName]}/${ff721.address}/0`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

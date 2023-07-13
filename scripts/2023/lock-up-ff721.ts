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

    const basketAddress = "0x2802551f79279079c8f65767862d58ca5609d33f";
    const basketId = config[estate].basketId;

    const privateKey = config[estate].privateKey;
    const minter = new ethers.Wallet(privateKey, ethers.provider);
    console.log(`Using account: ${minter.address}`);

    
    const deployedAddress = config[estate].deployedAddress;
    const ff721 = await ethers.getContractAt("FF721ScreamingEagle", deployedAddress);
    console.log("FF721 connect @ address:", ff721.address);
    const basket = await ethers.getContractAt("BasketStrauss2023", basketAddress);
    console.log("Set approval for basket...");
    await ff721.connect(minter).setApprovalForAll(basket.address, true, {gasPrice: 400e9});
    await sleep(SLEEP_TIME);

    const total = config[estate].tokens;
    for (let i = 0; i < total; i++) {
        console.log("Account balance:", (ethers.utils.formatEther(await minter.getBalance())).toString());
        console.log(`${estate}: Adding token ${i} of ${total} to basket ${basketId}...`);
        await basket.connect(minter).add(basketId, ff721.address, i, {gasPrice: 400e9});
        await sleep(SLEEP_TIME);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

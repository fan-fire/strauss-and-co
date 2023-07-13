import { ethers } from "hardhat";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const SLEEP_TIME = 5000;
const privateKeys = require('./private-keys.json');

const estate = 'screaming-eagle'
// const estate = 'yquem'
// const estate = 'penfolds'
// const estate = 'harlan'
// const estate = 'romanee'
// const estate = 'mouton'
const config = {
    'screaming-eagle': {
        'contractName': 'FF721ScreamingEagle',
        'tokens': 19
    },
    'yquem': {
        'contractName': 'FF721Yquem',
        'tokens': 184
    },
    'penfolds': {
        'contractName': 'FF721Penfolds',
        'tokens': 232
    },
    'harlan': {
        'contractName': 'FF721Harlan',
        'tokens': 40
    },
    'romanee': {
        'contractName': 'FF721Romanee',
        'tokens': 80
    },
    'mouton': {
        'contractName': 'FF721Mouton',
        'tokens': 176
    },
}

async function main() {
    if (!config[estate]) {
        throw new Error(`Estate ${estate} not found in config`);
    }

    const privateKey = privateKeys[estate].privateKey;
    const deployer = new ethers.Wallet(privateKey, ethers.provider);
    console.log(`Deploying contracts with the account: ${deployer.address}`);

    console.log("Account balance:", (ethers.utils.formatEther(await deployer.getBalance())).toString());

    console.log(`Deploying ${config[estate].contractName}...`);
    const FF721ScreamingEagle = await ethers.getContractFactory(config[estate].contractName);
    const ff721 = await FF721ScreamingEagle.connect(deployer).deploy();
    await ff721.deployed();

    console.log("FF721 deployed to address:", ff721.address);

    console.log("Granting MINTER_ROLE to deployer...");
    await ff721.connect(deployer).grantRole(await ff721.MINTER_ROLE(), deployer.address);
    await sleep(SLEEP_TIME);
    console.log("Granted MINTER_ROLE to deployer...");

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

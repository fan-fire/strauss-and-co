import { ethers } from "hardhat";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const SLEEP_TIME = 5000;

async function main() {
        const gasPrice = 300e9;
        const [signer] = await ethers.getSigners();
        console.log("Deploying contracts with the account:", signer.address);

        const FF721 = await ethers.getContractFactory("FF721");
        const ff721 = await FF721.attach("0xa4a50F0B23C4503a26238DEffE5f8180738BcF61");

        const name = await ff721.name();
        console.log({name});

        const baseURI = await ff721.baseTokenURI();
        console.log({baseURI});

        
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

import { ethers } from "hardhat";

async function main() {

    const accounts = await ethers.getSigners();
    const deployer = accounts[0];
    console.log(`Deploying contracts with the account: ${deployer.address}`);

    console.log("Account balance:", (ethers.utils.formatEther(await deployer.getBalance())).toString());

    console.log("Deploying Basket...");
    const Basket = await ethers.getContractFactory("Basket");
    const basket = await Basket.deploy();
    await basket.deployed();

    console.log("Basket address:", basket.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

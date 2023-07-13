import { ethers } from "hardhat";
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
async function main() {

    const accounts = await ethers.getSigners();
    const deployer = accounts[0];
    console.log(`Deploying contracts with the account: ${deployer.address}`);

    console.log("Account balance:", (ethers.utils.formatEther(await deployer.getBalance())).toString());

    console.log("Deploying Basket...");
    const Basket = await ethers.getContractFactory("BasketStrauss2022");
    const basket = await Basket.deploy();
    await basket.deployed();

    console.log("Basket address:", basket.address);

    console.log("Granting minter role to deployer...");
    await basket.grantRole(await basket.MINTER_ROLE(), deployer.address);
    await sleep(6000);

    const total = 5;
    console.log(`Minting ${total} tokens...`);

    for (let i = 0; i < total; i++) {
        console.log(`Minting ${i}.json`);
        await basket.mint(deployer.address, `${i}.json`);
        await sleep(2000);
    }
    console.log(`Waiting for cooldown...`);
    await sleep(70000);

    for (let i = 0; i < total; i++) {
        console.log(`Closing ${i}.json`);
        await basket.close(i);
        await sleep(2000);
    }

    console.log("Done!");

    // const basket = await Basket.attach("0x5cc280b71e4e54529308ac2b567674a1ba1ab558");

    // await basket.close(0);
    // console.log("Done!");

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

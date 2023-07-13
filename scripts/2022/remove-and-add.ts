import { ethers } from "hardhat";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const SLEEP_TIME = 5000;

const estates = [
    'meerlust',
    // 'vilafonte',
    // 'kleinconstantia',
    // 'kanonkop',
    // 'mullineux'
];
const config = require('./config.json');
// console.log(config[estate]);

async function main() {
    for (const estate of estates) {
        console.log(`Estate: ${estate}`);
        const privateKey = config[estate].privateKey;
        const signer = new ethers.Wallet(privateKey, ethers.provider);
        const gasPrice = 300e9;

        console.log(`Account balance: ${(ethers.utils.formatEther(await signer.getBalance())).toString()}`);

        const vaultAbi = [
            "function royaltyInfo(uint256 _tokenId, uint256 _salePrice) external view returns (address receiver, uint256 royaltyAmount)",
            "function open(uint256 _vaultId) public",
            "function remove(uint256 _vaultId, address _erc721Address, uint256 _tokenId) public",
            "function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes _data) public",
            "function tokenURI(uint256 _tokenId) external view returns (string)",
        ];

        const erc721Abi = [
            "function setApprovalForAll(address _operator, bool _approved) external",
        ];

        const vaultAddress = "0xc053eb2c0d59cdb2b8686d414c636b72fefc40a3";
        const basketAddress = "0x131454c43a8D52FA5af91526dc14825d159ac137";

        const vault = new ethers.Contract(vaultAddress, vaultAbi, signer);
        const basketId = config[estate].basketId;
        const vaultId = basketId;
        const total = config[estate].tokens;

        // console.log(`Opening vault ${basketId}...`);
        // await vault.open(basketId, { gasPrice: gasPrice });
        // await sleep(SLEEP_TIME);
        // console.log(`Vault ${basketId} opened`);

        const Basket = await ethers.getContractFactory("BasketStrauss2022");
        const basket = await Basket.attach(basketAddress);
        console.log(`Basket connected @ address: ${basket.address}`);

        const erc721Address = config[estate].deployedAddress;
        const ff721 = new ethers.Contract(erc721Address, erc721Abi, signer);

        // console.log("Set approval for basket...");
        // await ff721.setApprovalForAll(basket.address, true, { gasPrice: gasPrice });
        // await sleep(SLEEP_TIME);

        for (let i = 1; i < total; i++) {
            console.log("Account balance:", (ethers.utils.formatEther(await signer.getBalance())).toString());
            console.log(`${estate}: Removing ${i}/${total} from vault ${vaultId}...`);
            await vault.connect(signer).remove(vaultId, erc721Address, i, { gasPrice: gasPrice });
            console.log(`${estate}: Removed  ${i}/${total} from vault ${vaultId}`);
            await sleep(SLEEP_TIME);
            console.log(`${estate}: Adding   ${i}/${total} to basket ${basketId}...`);
            await basket.connect(signer).add(basketId, ff721.address, i, { gasPrice: gasPrice });
            console.log(`${estate}: Added    ${i}/${total} to basket ${basketId}`);
            await sleep(SLEEP_TIME);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

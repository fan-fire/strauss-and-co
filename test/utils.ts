import {IBasket} from "../typechain-types/contracts/Basket";
import { ethers } from "hardhat";

const BASE_TOKEN_URI = "https://temp/";
const CONTRACT_URI = "https://temp/collection.json";


const BASKET_STATE = {
  OPEN: 0,
  CLOSED: 1,
  BURNED: 2,
};


const cleanToken = (token: IBasket.TokenStructOutput) => {
  return {
    erc721: token.erc721,
    tokenId: token.tokenId.toNumber(),
    listPtr: token.listPtr.toNumber(),
  };
};

async function basketFixture() {
  const [deployer, owner, receiver] = await ethers.getSigners();

  const Basket = await ethers.getContractFactory("Basket");
  const Test721 = await ethers.getContractFactory("Test721");

  const basket = await Basket.deploy();
  const erc721 = await Test721.deploy();

  return { deployer, owner, receiver, basket, erc721 };
}

export {BASE_TOKEN_URI, CONTRACT_URI, BASKET_STATE, cleanToken, basketFixture};
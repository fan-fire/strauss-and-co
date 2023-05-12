import { IBasket } from "../typechain-types/contracts/Basket";
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
  const Not721 = await ethers.getContractFactory("Not721");

  const basket = await Basket.deploy();
  const erc721 = await Test721.deploy();
  const not721 = await Not721.deploy();

  return { deployer, owner, receiver, basket, erc721, not721 };
}

const REVERT_MESSAGES = {
  ERC721_INVALID_TOKEN_ID: "ERC721: invalid token ID",

  BASKET_ERC721_NOT_APPROVED: "Basket: erc721 not approved for basket",
  BASKET_ERC721_NOT_OWNER: "Basket: caller not token owner",
  BASKET_ERC721_NOT_IERC721: "Basket: erc721 not IERC721",
  BASKET_ERC721_0_OR_THIS: "Basket: erc721 0 or this contract",

  BASKET_DOES_NOT_EXIST: "Basket: does not exist",
  BASKET_NOT_OWNER: "Basket: caller is not the basket owner",
  BASKET_NOT_OPEN: "Basket: is not open",
  BASKET_NOT_CLOSED: "Basket: is not closed",
};

const INTERFACE_IDS = {
  IERC721: "0x80ac58cd",
  IERC721Metadata: "0x5b5e139f",
  IERC165: "0x01ffc9a7",
  IBasket: "0xced56fdb",
  IERC721Receiver: "0x150b7a02",
};

export {
  BASE_TOKEN_URI,
  CONTRACT_URI,
  BASKET_STATE,
  cleanToken,
  basketFixture,
  REVERT_MESSAGES,
  // getInterfaceID,
  INTERFACE_IDS,
};
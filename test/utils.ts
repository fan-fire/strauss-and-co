import {IBasket} from "../typechain-types/contracts/Basket";

const BASE_TOKEN_URI = "https://temp/";
const CONTRACT_URI = "https://temp/collection.json";


const BASKET_STATE = {
  OPEN: 0,
  CLOSED: 1,
  BURNED: 2,
};


const cleanToken = (token: IBasket.TokenStructOutput) => {
  return {
    tokenAddress: token.tokenAddress,
    tokenId: token.tokenId.toNumber(),
    listPtr: token.listPtr.toNumber(),
  };
};

export {BASE_TOKEN_URI, CONTRACT_URI, BASKET_STATE, cleanToken};
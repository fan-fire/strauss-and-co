import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-contract-sizer";
import 'solidity-coverage';

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
    only: ['Basket'],
    outputFile: 'contractSizes.json',
  },
};

export default config;

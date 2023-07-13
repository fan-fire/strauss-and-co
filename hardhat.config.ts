import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-contract-sizer";
import 'solidity-coverage';
import 'hardhat-test-utils';

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.18',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ]
  },
  gasReporter: {
    enabled: (process.env.REPORT_GAS) ? true : false,
    excludeContracts: ["Test721.sol", "IBasket.sol", "Not721.sol"],
    gasPriceApi: `https://api.polygonscan.com/api?module=proxy&action=eth_gasPrice`,
    currency: 'USD',
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    token: 'MATIC',
  },
  networks: {
    mumbai: {
      url: process.env.MUMBAI_NODE,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY ?? ''],
      gasPrice: 2e9,
      chainId: 80001,
    },
    polygon: {
      url: process.env.POLYGON_NODE,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY ?? ''],
      gasPrice: 400e9,
      chainId: 137,
    },
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
    only: ['Basket'],
  },
};

export default config;

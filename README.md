# Strauss And Co

<div style="display: flex; align-items: center;">
  <div style="width: 30%; margin-right: 20px;">
    <img src="strauss-logo.jpg"  />
  </div>
  <div style="width: 70%;">
    For the Strauss & Co collections, Fanfire has created a token that provides a highly efficient way to package a collection of wines for long-term aging or trading. Each individual bottle has its own token on the Polygon blockchain, and this NFT includes critical information about the transaction, such as provenance, barcode, pictures, pricing, as well as sensorial and aging information. Fanfire has also created a special "basket" NFT into which each collection's constituent bottles are packaged. This allows for the bulk trading of the entire collection's ownership. The owner of such a collection can remove the individual bottle NFTs to trade them or to redeem the physical bottle of wine. <a href="https://fanfire.medium.com/strauss-co-2023-nft-wine-auction-1f75b055e471">[1]</a>
  </div>
</div>

## Background

Fine wine is a unique asset class that has been around for centuries and has a proven track record of delivering consistent returns. However, the fine wine market suffers from fragmentation, lack of transparency, and liquidity. This is where NFTs can make a significant impact. By tokenizing fine wine, we can bring transparency and liquidity to the market, enabling anyone to invest in fine wine and benefit from its consistent returns. [[2]](https://louwjlabuschagne.medium.com/non-fungible-basket-nfb-aa505e4c262a)

[Strauss & Co](https://www.straussart.co.za/) has partnered with [Fanfire](https://www.fanfire.ai/), a web3 development company, to develop and launch the blockchain technology and smart contracts to tokenize various wine collections. In 2022, Strauss & Co successfully launched [Africa's first NFT auction](https://www.straussart.co.za/auctions/results/25-apr-2022-wine) in collaboration with South Africa's leading fine wine producers. This auction featured five NFT collections, with a total auction value of approximately $180,000.

Building upon this success, Strauss & Co is organizing [another auction in 2023](https://www.straussart.co.za/auctions/details/25-apr-2022-wine), featuring six truly rare world-leading fine wine collections. The anticipated auction value for these collections is expected to surpass $1.5 million. Each collection consists of approximately 250 bottles, and to facilitate trading and the transfer of ownership, Fanfire has developed the NFB to group these NFTs within a collection.

### Basket NFT

The concept of "basketing" NFTs introduces an innovative approach that allows for the grouping and bundling of various assets together. [This blog](https://louwjlabuschagne.medium.com/non-fungible-basket-nfb-aa505e4c262a) explores the potential of NFTs beyond simple pictures of dragons and apes and introduces a new type of NFT called an NFB (Non-Fungible Basket). NFBs enable NFT owners to utilize them as containers to lock up multiple other NFTs, providing similar functionalities to container ships and index funds. These NFBs can be created, traded, transported, and the locked-up NFTs within them are owned by the holder of the basket.

The Basket NFT is an ERC721 NFT that contains multiple ERC721 NFTs. The Basket NFT can be used to store and trade multiple NFTs at once. [ERC-6551](https://eips.ethereum.org/EIPS/eip-6551) attempts to standardize something like the Basket NFT, but currently, it is still in draft state. Moreover, within the FanFire ecosystem, we have a need for a Basket NFT that is compatible with the [Multiplace](https://github.com/fan-fire/multiplace) contract. As such, we have created our own Basket NFT that is compatible with the Multiplace contract.

More often than not, there are a few tokens that a buyer or seller would like to package together. Instead of having to list each token individually, the seller can lock these tokens in a basket and list the basket for sale. The buyer can then purchase the basket and receive all the tokens in the basket and take out any tokens out of the basket if they so wish.

The basket supports all the standard ERC721 functions, including transfer, approve, and safeTransferFrom, and adds the following:

- Minting a basket using the `mint` function
- Burning a basket using the `burn` function
- Closing a basket using the `close` function
- Opening a basket using the `open` function
- Adding to a basket using the `add` function
- Removing from a basket using the `remove` function

To open, remove, and close the baskets, we advise using a Web3 wallet like Metamask and interfacing with the smart contracts using the Contract interface on Polygonscan:

- [2022 Basket](https://polygonscan.com/address/0x131454c43a8D52FA5af91526dc14825d159ac137#readContract)
- [2023 Basket](https://polygonscan.com/address/0x2802551f79279079c8f65767862d58ca5609d33f#readContract)

## Deployments

The Basket NFT ([NFB](https://github.com/fan-fire/NFB/)) allows users to create an NFT Basket that contains multiple ERC721 NFTs. The Basket N

FT can be used to trade multiple NFTs at once. An audit for the NFB contract is available [here](https://solidity.finance/audits/FanFireBasket/).

All contracts have been deployed with a Hardware wallet to ensure that the private key is not compromised. The address of the trusted deployer is `0x25375E1DaFa37a31069d323a37A6f93eaF356123`.

### 2022

The 2022 auction captured past, present, and future vintages. These unique digital contracts encompass vertical collections of Klein Constantia Vin de Constance, Kanonkop Paul Sauer, Meerlust Rubicon, Mullineux Olerasay, and Vilafonté Series C. Each NFT holds between 20 and 50 vintages, with collections from 66 to 288 bottles. [[3]](https://www.straussart.co.za/2022/strauss-co-launches-africas-first-nft-auction-with-sas-leading-fine-wine-producers)

The metadata for the various estates can be found [here](metadata/output/2022).

The 2022 contracts have been deployed to the Polygon mainnet and can be found at the following addresses:

- [2022 Basket](https://opensea.io/collection/131454c43a8d52fa5af91526dc14825d159ac137): `0x131454c43a8D52FA5af91526dc14825d159ac137`
- [Meerlust Rubicon 1980 - 2034](https://opensea.io/collection/a4a50f0b23c4503a26238deffe5f8180738bcf61): `0xa4a50F0B23C4503a26238DEffE5f8180738BcF61`
- [Vilafonte Series C 2003 - 2027](https://opensea.io/collection/4337f8ff74ed281ee350b0769b12161cc3b58509): `0x4337f8fF74ed281EE350B0769B12161CC3b58509`
- [Klein Constantia Vin de Constance 1986 - 2027](https://opensea.io/collection/4f12b90f9ea07a5df9d95317469eb5b496f34661): `0x4f12b90F9EA07A5df9d95317469EB5B496f34661`
- [Kanonkop Paul Sauer 2000 - 2025](https://opensea.io/collection/2d8cf072051786c173af865ef64913a3a2241821): `0x2D8CF072051786c173af865Ef64913a3a2241821`
- [Mullineux Olerasay 2001-2020](https://opensea.io/collection/2760bae2587e07834a8c819daf0153820a01160a): `0x2760bae2587E07834A8c819Daf0153820a01160A`

The basket smart contract code can be found [here](contracts/y2022/BasketStrauss2022.sol), and the customer 721 smart contract code for the various estates can be found [here](contracts/y2022/FF721.sol).

### 2023

The 2023 collection was curated from the prestigious Coats Family Cellar - arguably the most prestigious fine wine collection ever offered in South Africa. It contains an expansive range of the world's finest and most sought-after wines spanning over 150 years. Collected over many decades by the Coats family, as part of an extensive cellar, the wines were imported from Ireland into South Africa via a refrigerated container and have been cellared professionally since. Each bottle is in top condition. 'Mr. Coats had a clear passion for Penfolds Grange and Mouton-Rothschild, but there are few great wines from the 20th century that weren't in the cellar. The d'Yquem lot is also expansive and very special!' continues Roland. Leading International fine wine expert, Michal Egan, has scrutinized and authenticated every bottle, and over 100 bottles have been tasted. [[1]](https://fanfire.medium.com/strauss-co-2023-nft-wine-auction-1f75b055e471)

The metadata for the various estates can be found [here](metadata/output/2023).

The 2023 contracts have been deployed to the Polygon mainnet and can be found at the following addresses:

- [2023 Basket](https://opensea.io/collection/2802551f79279079c8f65767862d58ca5609d33f): `0x2802551F79279079C8F65767862D58ca5609D33f`
- [Screaming Eagle](https://opensea.io/collection/0f580daf909e1dc0892301222ed60f59ee6f3770): `0x0F580daF909e1Dc0892301222eD60F59eE6f3770`
- [Chateau d'Yquem](https://opensea.io/collection/6058ee21b093ee36333aee29996ae9f967bc52eb): `0x6058ee21b093EE36333Aee29996aE9f967bc52Eb`
- [Penfolds Grange](https://opensea.io/collection/0d246974176dc089d131040166c8ef617ccad578): `0x0d246974176dc089d131040166c8Ef617CcAd578`
- [Harlan Estate](https://opensea.io/collection/a44ca542eec0f8f91d2cbc63230b1b9f9816f9f9): `0xa44Ca542EEc0f8F91D2cBc63230B1b9f9816F9F9`
- [Domaine de la Romanée Conti](https://opensea.io/collection/ede4662aeab7fb9ac316476643cc836a171a12b0): `0xedE4662aEAB7FB9aC316476643cc836A171A12B0`
- [Chateau Mouton Rothschild](https://opensea.io/collection/038c0998f580798f849ee8841a7e5dd5040f8df8): `0x038C0998f580798F849Ee8841a7E5dD5040F8dF8`

## Repo Code

There are several scripts in the scripts folder that can be used to interact with the contracts. We use a combination of Hardhat and Truffle to interact with the contracts since we need the capability to interact with the contracts using a hardware wallet, which is not yet supported by Hardhat. Generally, the TypeScript scripts are used to interact with the contracts using Hardhat, while the JavaScript scripts are used to interact with the contracts using Truffle.

Another common practice we follow is to assign the different roles to software wallets and then utilize those software wallets to interact with the contracts. This approach enables us to automate more of the interactions through scripting.

### Scripts

| Script                                                                                  | Description                                                                   | Purpose                                                                                                                                                                                                                                      |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a href="scripts/public-external-methods.js">public-external-methods.js</a>             | This script prints all the public and external methods of a contract.         | It is not always clear which methods are inherited from a parent contract. This script prints all the public and external methods of a contract to ensure there are no dangling methods that can be called.                                  |
| <a href="scripts/private-keys.js">private-keys.js</a>                                   | This script creates a private key for each of the estates.                    | Used to create private keys for each of the estates.                                                                                                                                                                                         |
| <a href="scripts/2022/update-tokenURI.ts">2022/update-tokenURI.ts</a>                   | This script updates the tokenURI of the 2022 estates.                         | There are a few estates that have created tokens for unbottled wine. Each year, the tokenURI needs to be updated to reflect the seal codes of the new bottles.                                                                               |
| <a href="scripts/2022/remove-and-add.ts">2022/remove-and-add.ts</a>                     | This script removes the 2022 estates from the 2022 vault contract.            | Before we standardized the interface for the NFB, we used a "vault" contract to bundle the NFTs. Since then, we've audited the NFB and created a new basket for 2022. This script moves the tokens in the 2022 vault to the new 2022 basket. |
| <a href="scripts/2023/mint-ff721.ts">2023/mint-ff721.ts</a>                             | This script mints each bottle for each of the 2023 estates using Hardhat.     | Used to automate the token minting for each bottle for each estate.                                                                                                                                                                          |
| <a href="scripts/2023/lock-up-ff721.ts">2023/lock-up-ff721.ts</a>                       | This script locks up each bottle for each of the 2023 estates using Hardhat.  | Used to automate the locking up of each bottle for each estate using the `add` method on the basket.                                                                                                                                         |
| <a href="scripts/2023/deploy-ff721s.ts">2023/deploy-ff721s.ts</a>                       | This script deploys the 2023 estates using Hardhat.                           | Used for testnet deployments.                                                                                                                                                                                                                |
| <a href="scripts/2023/deploy-basket.ts">2023/deploy-basket.ts</a>                       | This script deploys the 2023 basket using Hardhat.                            | Used for testnet deployments.                                                                                                                                                                                                                |
| <a href="scripts/2023/truffle-deploy-basket.js">2023/truffle-deploy-basket.js</a>       | This script deploys the 2023 basket using Truffle.                            | Used for mainnet deployments using a Trezor HW wallet and the <a href="https://www.npmjs.com/package/@rarible/trezor-provider">@rarible/trezor-provider</a> package.                                                                         |
| <a href="scripts/2023/truffle-deploy-estates.js">2023/truffle-deploy-estates.js</a>     | This script deploys the ERC721 smart contracts for each estate using Truffle. | Used for mainnet deployments using a Trezor HW wallet and to grant the MINTER_ROLE to software wallets.                                                                                                                                      |
| <a href="scripts/2023/truffle-remove-minting.js">2023/truffle-remove-minting.js</a>     | This script removes the MINTER_ROLE from the software wallets.                | Used for mainnet deployments using a Trezor HW wallet.                                                                                                                                                                                       |
| <a href="scripts/2023/truffle-update-royalties.js">2023/truffle-update-royalties.js</a> | This script updates the royalties for each estate.                            | The initial deployment of the 2023 basket had the wrong royalties. This script was used to update the royalties.                                                                                                                             |

### Miscellaneous

To get the gas prices for the various networks, we use the following bash function:

```bash
function gas() {
    echo "Fast Mumbai"
    curl -s https://gasstation-mumbai.matic.today/v2 | jq '.fast'
    echo "Fast Polygon"
    curl -s https://gasstation-mainnet.matic.network/v2 | jq '.fast'
}
```

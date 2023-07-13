# Strauss And Co

<div style="display: flex; align-items: center;">
  <div style="width: 30%; margin-right: 20px;">
    <img src="strauss-logo.jpg"  />
  </div>
  <div style="width: 70%;">
    For the Strauss & Co collections, Fanfire created a token that provides a highly efficient way to package a collection of wines for long term aging or trading. Each individual bottle has its own token on the Polygon blockchain and this NFT includes the critical information of the transaction in provenance, barcode, pictures, pricing, along with sensorial and aging information. Fanfire then created a special “basket” NFT into which each collection’s constituent bottles are packaged. This allows an entire collection’s ownership to be traded in bulk. The owner of such a collection can remove the individual bottle NFTs to trade them or to redeem the physical bottle of wine <a href="https://fanfire.medium.com/strauss-co-2023-nft-wine-auction-1f75b055e471">[1]</a>.
  </div>
</div>

## Background

Fine wine is a unique asset class that has been around for centuries and has a proven track record of delivering consistent returns. However, the fine wine market suffers from fragmentation, lack of transparency, and liquidity. This is where NFTs can make a significant impact. By tokenizing fine wine, we can bring transparency and liquidity to the market, enabling anyone to invest in fine wine and benefit from its consistent returns<a href="https://louwjlabuschagne.medium.com/non-fungible-basket-nfb-aa505e4c262a">[2]</a>.

<a href="https://www.straussart.co.za/">Strauss & Co</a> has partnered with <a href="https://www.fanfire.ai/">Fanfire</a>, a web3 development company, to develop and launch the blockchain techonlogy and smart contracts to tokenize various wine collections. In 2022, Strauss & Co successfully launched <a href="https://www.straussart.co.za/auctions/results/25-apr-2022-wine">Africa’s first NFT auction</a> in collaboration with South Africa’s leading fine wine producers. This auction featured five NFT collections, with a total auction value of approximately $180,000.

Building upon this success, Strauss & Co is organizing <a href="https://www.straussart.co.za/auctions/details/25-apr-2022-wine">another auction in 2023</a>, featuring six truly rare world-leading fine wine collections. The anticipated auction value for these collections is expected to surpass $1.5 million. Each collection consists of approximately 250 bottles, and to facilitate trading and the transfer of ownership, Fanfire has developed the NFB to group these NFTs within a collection.

### Basket NFT

The concept of “basketing” NFTs introduces an innovative approach that allows for the grouping and bundling of various assets together. <a href="https://louwjlabuschagne.medium.com/non-fungible-basket-nfb-aa505e4c262a">This blog</a> explores the potential of NFTs beyond simple pictures of dragons and apes and introduce a new type of NFT called an NFB (Non-Fungible Basket). NFBs enable NFT owners to utilize them as containers to lock up multiple other NFTs, providing similar functionalities to container ships and index funds. These NFBs can be created, traded, transported, and the locked-up NFTs within them are owned by the holder of the basket

The Basket NFT is a ERC721 NFT that contains multiple ERC721 NFTs. The Basket NFT can be used to store and trade multiple NFTs at once. [ERC-6551](https://eips.ethereum.org/EIPS/eip-6551) attempts to standardize something like the Basket NFT, but currenlty it is still in draft state. Moreover, within the FanFire ecosystem, we have a need for a Basket NFT that is compatible with the [Multiplace](https://github.com/fan-fire/multiplace) contract. As such, we have created our own Basket NFT that is compatible with the Multiplace contract.

More often then not there are a few tokens that a buyer or seller would like to package together. Instead of having to list each token individually, the seller can lock these tokens in a basket and list the basket for sale. The buyer can then purchase the basket and receive all the tokens in the basket and take out any tokens out of the basket if they so wish.

The basket supports all the standard ERC721 functions, including transfer, approve, and safeTransferFrom, and adds the following

- minting a basket using the `mint` function
- burning a basket using the `burn` function
- closing a basket using the `close` function
- opening a basket using the `open` function
- adding to a basket using the `add` function
- removing from a basket using the `remove` function

To open, remove and close the baskets, we advise using a web3 wallet like metamask and inneteracing with the smart conntacts using the Contract interface on Polygonscan:

- <a href="https://polygonscan.com/address/0x131454c43a8D52FA5af91526dc14825d159ac137#readContract">2022 Basket</a>
- <a href="https://polygonscan.com/address/0x2802551f79279079c8f65767862d58ca5609d33f#readContract">2023 Basket</a>

## Deployments

The basket NFT (<a href="https://github.com/fan-fire/NFB/">NFB</a>)allows users to create a NFT Basket that contains multiple ERC721 NFTs. The basket NFT can be used to trade multiple NFTs at once. An audit for the NFB contract is available [here](https://solidity.finance/audits/FanFireBasket/).

All contracts have been deployed with a Hardware wallet to ensure that the private key is not compromised. The address of the trusted deployer is `0x25375E1DaFa37a31069d323a37A6f93eaF356123`.

### 2022

The 2022 auction captured past, present and future vintages, these unique digital contracts encompass vertical collections of Klein Constantia Vin de Constance, Kanonkop Paul Sauer, Meerlust Rubicon, Mullineux Olerasay and Vilafonté Series C. Each NFT holds between 20 and 50 vintages, with collections from 66 to 288 bottles <a href="https://www.straussart.co.za/2022/strauss-co-launches-africas-first-nft-auction-with-sas-leading-fine-wine-producers">[3]</a>.

The metadata for the various estates can be found <a href="metadata/output/2022">here</a>.

The 2022 contracts have been deployed to the Polygon mainnet and can be found at the following addresses:

- <a href="https://opensea.io/collection/131454c43a8d52fa5af91526dc14825d159ac137">2022 Basket</a>: `0x131454c43a8D52FA5af91526dc14825d159ac137`
- <a href="https://opensea.io/collection/a4a50f0b23c4503a26238deffe5f8180738bcf61">Meerlust Rubicon 1980 - 2034</a>: `0xa4a50F0B23C4503a26238DEffE5f8180738BcF61`
- <a href="https://opensea.io/collection/4337f8ff74ed281ee350b0769b12161cc3b58509">Vilafonte Series C 2003 - 2027</a>: `0x4337f8fF74ed281EE350B0769B12161CC3b58509`
- <a href="https://opensea.io/collection/4f12b90f9ea07a5df9d95317469eb5b496f34661">Klein Constantia Vin de Constance 1986 - 2027</a>: `0x4f12b90F9EA07A5df9d95317469EB5B496f34661`
- <a href="https://opensea.io/collection/2d8cf072051786c173af865ef64913a3a2241821">Kanonkop Paul Sauer 2000 - 2025</a>: `0x2D8CF072051786c173af865Ef64913a3a2241821`
- <a href="https://opensea.io/collection/2760bae2587e07834a8c819daf0153820a01160a">Mullineux Olerasay 2001-2020</a>: `0x2760bae2587E07834A8c819Daf0153820a01160A`

The basket smart contract code can be found <a href="contracts/y2022/BasketStrauss2022.sol">here</a> and the customer 721 smart contract code for the various estates can be found <a href="contracts/y2022/FF721.sol">here</a>.

### 2023

The 2023 collection was curated from the prestigious Coats Family Cellar - arguably the most prestigious fine wine collection ever offered in South Africa. It contains an expansive range of the world’s finest and most sought-after wines spanning over 150 years. Collected over many decades by the Coats family, as part of an extensive cellar, the wines were imported from Ireland into South Africa via refrigerated container and have been cellared professionally since. Each bottle is in top condition. ‘Mr Coats had a clear passion for Penfolds Grange and Mouton-Rothschild, but there are few great wines from the 20th century that weren’t in the cellar. The d’Yquem lot is also expansive and very special!’ continues Roland. Leading International fine wine expert, Michal Egan, has scrutinized and authenticated every bottle, and over 100 bottles have been tasted<a href="https://fanfire.medium.com/strauss-co-2023-nft-wine-auction-1f75b055e471">[1]</a>.

The metadata for the various estates can be found <a href="metadata/output/2023">here</a>.

The 2023 contracts have been deployed to the Polygon mainnet and can be found at the following addresses:

- <a href="https://opensea.io/collection/2802551f79279079c8f65767862d58ca5609d33f">2023 Basket</a>: `0x2802551F79279079C8F65767862D58ca5609D33f`
- <a href="https://opensea.io/collection/0f580daf909e1dc0892301222ed60f59ee6f3770">Screaming Eagle</a>: `0x0F580daF909e1Dc0892301222eD60F59eE6f3770`
- <a href="https://opensea.io/collection/6058ee21b093ee36333aee29996ae9f967bc52eb">Chateau d’Yquem</a>: `0x6058ee21b093EE36333Aee29996aE9f967bc52Eb`
- <a href="https://opensea.io/collection/0d246974176dc089d131040166c8ef617ccad578">Penfolds Grange</a>: `0x0d246974176dc089d131040166c8Ef617CcAd578`
- <a href="https://opensea.io/collection/a44ca542eec0f8f91d2cbc63230b1b9f9816f9f9">Harlan Estate</a>: `0xa44Ca542EEc0f8F91D2cBc63230B1b9f9816F9F9`
- <a href="https://opensea.io/collection/ede4662aeab7fb9ac316476643cc836a171a12b0">Domaine de la Romanée Conti</a>: `0xedE4662aEAB7FB9aC316476643cc836A171A12B0`
- <a href="https://opensea.io/collection/038c0998f580798f849ee8841a7e5dd5040f8df8">Chateau Mouton Rothschild</a>: `0x038C0998f580798F849Ee8841a7E5dD5040F8dF8`

## Miscellanous

```bash
function gas() {
    echo "Fast Mumbai"
    curl -s https://gasstation-mumbai.matic.today/v2 | jq '.fast'
    echo "Fast Polygon"
    curl -s https://gasstation-mainnet.matic.network/v2 | jq '.fast'
}
```

# Basket NFT

The basket NFT allows users to create a NFT Basket that contains multiple ERC721 NFTs. The basket NFT can be used to trade multiple NFTs at once.

> ⚠️ Note: This is a generic basket. Depending on the use case, the basket NFT can be wrapped using OpenZeppelin's Access Control to restrict spesific functions to only authorized users or roles.

## Introduction

The Basket NFT is a ERC721 NFT that contains multiple ERC721 NFTs. The Basket NFT can be used to store and trade multiple NFTs at once. [ERC-6551](https://eips.ethereum.org/EIPS/eip-6551) attempts to standardize something like the Basket NFT, but currenlty it is still in draft state. Moreover, within the FanFire ecosystem, we have a need for a Basket NFT that is compatible with the [Multiplace](https://github.com/fan-fire/multiplace) contract. As such, we have created our own Basket NFT that is compatible with the Multiplace contract. 

More often then not there are a few tokens that a buyer or seller would like to package together. Instead of having to list each token individually, the seller can lock these tokens in a basket and list the basket for sale. The buyer can then purchase the basket and receive all the tokens in the basket and take out any tokens out of the basket if they so wish.

The basket supports all the standard ERC721 functions, including transfer, approve, and safeTransferFrom, and adds the following

-   minting a basket using the `mint` function
-   burning a basket using the `burn` function
-   closing a basket using the `close` function
-   opening a basket using the `open` function
-   adding to a basket using the `add` function
-   removing from a basket using the `remove` function

## Usage
Ensure you have the latest version of [Hardhat](https://hardhat.org) installed.

You can install the dependencies using npm and run the tests as follows:

```bash
npm i
npm test
```

Other commands include:

```bash
npm run coverage
npm run gas # requires COINMARKETCAP_API_KEY for gas prices in USD 
```

To deploy the contract to a local hardhat network, run:

```bash
npx hardhat run scripts/deploy.ts --network <network>
```

> Note that the deployment script relies on the following environment variables: MUMBAI_NODE, POLYGON_NODE and DEPLOYER_PRIVATE_KEY - see hardhat.config.ts. Where MUMBAI_NODE and POLYGON_NODE are the RPC endpoints for the Mumbai and Polygon networks respectively, and DEPLOYER_PRIVATE_KEY is the private key of the deployer account.

## Design Decisions

+ We had to support the `setApprovalForAll` method for the basket NFT to be able to transfer baskets and this interface needs to be compatible with <a href='https://github.com/fan-fire/multiplace'>Fanfire's Multiplace</a> contract which checks if the sender is approved for all tokens owned by the owner before listing the tokens for sale. As such we had to impose the restriction that all baskets for the sender must be closed before the sender can approve an operator for all tokens owned by the sender, and subsequently all baskets needs to be closed before the sender can transfer a basket.
+ The usage of `OPEN_COOL_DOWN_S` is set to 60 seconds by default. This means that a basket can only be closed 60 seconds after it has been opened. This is to prevent a malicious actor from opening and closing a basket within 1 block to prevent removing tokens from the basket before a transfer transaction is mined within the same block. See the test in `can't open and remove tokens and close from a basket in the same block as transfer` in `test/transfer.ts` for more details.
+ Set approve to ZERO_ADDRESS for a specific token if the basket is open. 

## Basket API

The data structures used are: 

```solidity
enum BasketState {
    OPENED,
    CLOSED,
    BURNED
}

struct Token {
    address erc721;
    uint256 tokenId;
    uint256 listPtr;
}
```

The methods in the Basket smart contract are:

+ `mint(address _to, string memory _uri) public`: Mints a new basket in an open state.
   - `_to`: The address of the basket owner.
   - `_uri`: The URI of the basket.
   - Emits a `Mint` event.

+ `add(uint256 _basketId, address _erc721, uint256 _tokenId) public`: Add a token to a basket.
   - `_basketId`: The id of the basket.
   - `_erc721`: The address of the ERC721 contract.
   - `_tokenId`: The id of the token.
   - Emits an `Add` event.

+ `remove(uint256 _basketId, address _erc721, uint256 _tokenId) public onlyBasketOwner(_basketId)`: Remove a token from a basket.
   - `_basketId`: The id of the basket.
   - `_erc721`: The address of the ERC721 contract.
   - `_tokenId`: The id of the token.
   - Emits a `Remove` event.

+ `burn(uint256 _basketId) public override(IBasket, ERC721Burnable) onlyBasketOwner(_basketId)`: Burn a basket.
   - `_basketId`: The id of the basket.
   - Emits a `Burn` event.

+ `close(uint256 _basketId) public onlyBasketOwner(_basketId)`: Close a basket.
   - `_basketId`: The id of the basket.
   - Emits a `Close` event.

+ `open(uint256 _basketId) public onlyBasketOwner(_basketId)`: Open a basket.
   - `_basketId`: The id of the basket.
   - Emits an `Open` event.

+ `_transfer(address from, address to, uint256 tokenId) internal override(ERC721) allBasketsClosed(tokenId)`: Transfer a basket.
   - `from`: The address of the basket owner.
   - `to`: The address of the new basket owner.
   - `tokenId`: The id of the basket.
   - Checks that all baskets for the sender are closed.

+ `isTokenInBasket(uint256 _basketId, address _erc721, uint256 _tokenId) public view returns (bool)`: Checks if a token is in a basket.
   - `_basketId`: The id of the basket.
   - `_erc721`: The address of the token contract.
   - `_tokenId`: The id of the token.
   - Returns true if the token is in the basket, false otherwise.

+ `isAllBasketsClosed(address _owner) public view returns (bool)`: Checks if all baskets for an owner are closed.
   - `_owner`: The address of the basket owner.
   - Returns true if all baskets are closed, false otherwise.

+  `safeMint(address to, string memory uri) internal`: Safely mints a new basket by automatically incrementing the token id.
   - `to`: The address of the basket owner.
   - `uri`: The URI of the basket.

+ `approve(address to, uint256 tokenId) public override(IERC721, ERC721) allBasketsClosed(tokenId)`: Overrides the ERC721 `approve` function and checks that all baskets for the sender are closed.
    - `to`: The address of the approved account.
    - `tokenId`: The id of the basket.

+ `setApprovalForAll(address operator, bool approved) public override(IERC721, ERC721)`: Overrides the ERC721 `setApprovalForAll` function and checks that all baskets for the sender are closed.
    - `operator`: The address of the operator.
    - `approved`: The approval status.

+ `isApprovedForAll(address owner, address operator) public view override(IERC721, ERC721) returns (bool)`: Overrides the ERC721 `isApprovedForAll` function and checks that all baskets for the sender are closed.
    - `owner`: The address of the owner of the basket.
    - `operator`: The address of the operator.

+ `basketsOf(address _owner) public view returns (uint256[])`: Returns the ids of the baskets is owned by an address.
    - `_owner`: The address of the basket owner.
    - Returns an array of basket ids.

+ `stateOf(uint256 _basketId) public view returns (BasketState)`: Returns the state of a basket.
    - `_basketId`: The id of the basket.
    - Returns the state of the basket.

+ `tokensIn(uint256 _basketId) public view returns (Token[] memory)`: Returns the tokens in a basket.
    - `_basketId`: The id of the basket.
    - Returns an array of tokens.

+ `curBasketId() public view returns (uint256)`: Returns the current basket id which is incremented every time a basket is minted.
    - Returns the current basket id.
  
+ `baseTokenURI() public view returns (string memory)`: Returns the base token URI as required by opensea according to https://docs.opensea.io/docs/1-structuring-your-smart-contract
    - Returns the base token URI.

+ `contractURI() public view returns (string memory)`: Returns the contract URI as required by opensea according to https://docs.opensea.io/docs/1-structuring-your-smart-contract
    - Returns the contract URI.

+ `supportsInterface(bytes4 interfaceId) public pure override(ERC721, IERC165) returns (bool)`: Overrides the ERC721 `supportsInterface` function and checks that all baskets for the sender are closed. Currently supports ERC721, ERC165, IERC721Metadata, IERC721Receiver, and IBasket.
    - `interfaceId`: The interface id.
    - Returns true if the interface is supported, false otherwise.

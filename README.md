# Basket NFT

The basket NFT allows users to create a NFT Basket that contains multiple ERC721 NFTs. The basket NFT can be used to trade multiple NFTs at once.

> ⚠️ Note: This is a generic basket. Depending on the use case, the basket NFT can be wrapped using OpenZeppelin's Access Control to restrict spesific functions to only authorized users or roles.

## Introduction

The Basket NFT is a ERC721 NFT that contains multiple ERC721 NFTs. The Basket NFT can be used to store and trade multiple NFTs at once. 

More often then not there are a few tokens that a buyer or seller would like to package together. Instead of having to list each token individually, the seller can lock these tokens in a basket and list the basket for sale. The buyer can then purchase the basket and receive all the tokens in the basket and take out any tokens out of the basket if they so wish.

The basket supports all the standard ERC721 functions, including transfer, approve, and safeTransferFrom, and adds the following

-   minting a basket using the `mint` function
-   burning a basket using the `burn` function
-   closing a basket using the `close` function
-   opening a basket using the `open` function
-   adding to a basket using the `add` function
-   removing from a basket using the `remove` function

## Design Decisions

+ We had to support the `setApprovalForAll` method for the basket NFT to be able to transfer baskets and this interface needs to be compatible with <a href='https://github.com/fan-fire/multiplace'>Fanfire's Multiplace</a> contract which checks if the sender is approved for all tokens owned by the owner before listing the tokens for sale. As such we had to impose the restriction that all baskets for the sender must be closed before the sender can approve an operator for all tokens owned by the sender, and subsequently all baskets needs to be closed before the sender can transfer a basket.
+ The usage of `OPEN_COOL_DOWN_S` is set to 60 seconds by default. This means that a basket can only be closed 60 seconds after it has been opened. This is to prevent a malicious actor from opening and closing a basket within 1 block to prevent removing tokens from the basket before a transfer transaction is mined within the same block.
+ Set approve to ZERO_ADDRESS for a specific token if the basket is oppend. 

## Basket API

The data structures used are: 

```solidity
enum BasketState {
    OPEN,
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



## Chat GPTs concerns

The provided Solidity smart contract appears to be an implementation of an ERC721 token contract with additional functionality for managing baskets of ERC721 tokens. While I cannot guarantee that the code is free from all vulnerabilities without conducting a thorough security audit, I can identify potential issues and best practices that should be considered.

Here are some potential vulnerabilities and suggestions for improvement:

1. Lack of Access Control: The contract does not implement any access control mechanism for critical functions like minting, adding tokens, removing tokens, closing baskets, or burning baskets. It is important to restrict these functions to only authorized users or roles to prevent unauthorized actions. Consider implementing access control using a role-based access control (RBAC) or other suitable mechanism.

2. Lack of Input Validation: The contract does not perform extensive input validation on parameters passed to functions. Ensure that appropriate checks are in place to validate inputs such as addresses, token IDs, and other relevant parameters. For example, the `add` function should validate that the `_tokenId` exists in the `_erc721` contract and that the sender is the owner of the token.

3. Potential Reentrancy Attacks: The contract uses external calls to transfer tokens (`safeTransferFrom`) during the `add` and `remove` functions. Be cautious when interacting with external contracts, as they can execute arbitrary code. Consider using the "checks-effects-interactions" pattern to mitigate potential reentrancy attacks. Ensure that external contract calls are the last actions performed within a function.

4. Lack of Event Data Validation: The contract emits events (`Mint`, `Add`, `Remove`, `Burn`, `Close`, `Open`) to notify external systems about state changes. Ensure that the event data is appropriately validated in the consuming applications to prevent potential issues or misinterpretation.

5. Potential Denial-of-Service (DoS) Attacks: The contract uses an array to store the IDs of tokens within a basket (`_tokens` mapping). If a basket contains a large number of tokens, operations on the array, such as removal or iteration, may become inefficient and result in high gas costs or potential DoS attacks. Consider using alternative data structures or strategies, such as mapping or pagination, to handle large numbers of tokens more efficiently.

6. Lack of Comprehensive Error Messages: The contract uses `require` statements to check conditions and revert the transaction if the conditions are not met. However, the error messages provided are generic and may not provide enough information for users to understand why their transaction failed. Consider providing more descriptive error messages to help users diagnose and resolve issues.

7. Potential Gas Limit Issues: The contract may encounter gas limit issues if the `_baskets` array grows too large. When an array becomes too large, operations like pushing, popping, or iterating over it can consume excessive gas and potentially cause transactions to fail. Consider implementing pagination or other strategies to mitigate this issue.

8. Lack of Function Documentation: The contract lacks comprehensive documentation for its functions. It is important to provide detailed documentation, including explanations of input parameters, return values, and potential side effects, to improve the contract's usability and facilitate its integration with external systems.

Remember that these suggestions are not exhaustive, and it is always recommended to conduct a thorough security audit of the contract by an expert in smart contract security to identify and address any vulnerabilities specific to your use case.
# Basket NFT

The basket NFT allows users to create a NFT Basket that contains multiple ERC721 NFTs. The basket NFT can be used to trade multiple NFTs at once.

## Introduction

## Royalties

The ability to set royalties can be set on a basket NFT.

```
 // EIP2981 standard royalties return.
    function royaltyInfo(
        uint256 _tokenId,
        uint256 _salePrice
    ) external view returns (address receiver, uint256 royaltyAmount) {
        uint256 basicPoints = _royaltyBasisPoints[_tokenId];
        receiver = _royaltyReceivers[_tokenId];
        royaltyAmount = (_salePrice * basicPoints) / 10000;
        return (receiver, royaltyAmount);
    }

    function setRoyalties(
        uint256 _basketId,
        address _newRecipient,
        uint256 _newBasisPoints
    ) public {
        // checks
        require(_exists(_basketId), "Basket: does not exist");
        require(
            _newRecipient != address(0) && _newBasisPoints > 0,
            "Basket: invalid royalty receiver or basis points"
        );
        // effects
        _royaltyReceivers[_basketId] = _newRecipient;
        _royaltyBasisPoints[_basketId] = _newBasisPoints;
    }

```
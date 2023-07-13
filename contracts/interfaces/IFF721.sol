// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/access/IAccessControl.sol";

interface IFF721 is IERC165, IERC721, IERC2981, IERC721Metadata {
    event RoyaltiesSet(
        address indexed newRecipient,
        uint256 indexed newBasisPoints
    );

    event BaseTokenURIChanged(string newBaseTokenURI);

    event ContractURIChanged(string newContractURI);

    event TokenURIChanged(uint256 indexed tokenId, string newTokenURI);

    // ERC-4906 events to update OpenSea when updating baseTokenURI
    event BatchMetadataUpdate(uint256 _fromTokenId, uint256 _toTokenId);

    /**
     * Minting method for the FanFire 721 contract.
     *
     * It automatically increments the token ID counter and sets the token URI.
     *
     * @param to - The address to mint the token to
     * @param uri - The token URI in the format of "{tokenId}.json". For example "0.json"
     *
     * Emits a {IERC721-Transfer} event.
     */
    function mint(address to, string memory uri) external;

    /**
     * Burning method for the FanFire 721 contract.
     *
     * @param tokenId - The token ID to burn
     *
     * Emits a {IERC721-Transfer} event.
     */
    function burn(uint256 tokenId) external;

    /**
     * Set the ERC2981 royalties for the FanFire 721 contract.
     *
     * @param newRecipient - The address to receive the royalties
     * @param newBasisPoints - The basis points to receive as royalties
     */
    function setRoyalties(
        address newRecipient,
        uint256 newBasisPoints
    ) external;

    /**
     * Set the base token URI for the FanFire 721 contract. This is the hosted directory
     * where the token URIs are stored and looked up using the uri set per token.
     *
     * @param uri - The base token URI. Example "https://raw.githubusercontent.com/fan-fire/ff721/main/assets/jsons/"
     */
    function setBaseTokenURI(string memory uri) external;

    /**
     * Set the contract URI for the FanFire 721 contract. This is the hosted directory
     * where the contract URI is stored and looked up.
     *
     * @param uri - The contract URI. Example "https://raw.githubusercontent.com/fan-fire/ff721/main/assets/jsons/collection.json"
     */
    function setContractURI(string memory uri) external;

    /**
     * Set the token URI for the FanFire 721 contract. This is the name
     * of the file in the base token URI directory where the token metadata is stored.
     *
     * @param tokenId - The token ID to set the URI for
     * @param uri - The token URI. Example "0.json"
     */
    function setTokenURI(uint256 tokenId, string memory uri) external;

    /**
     * Required by opensea according to https://docs.opensea.io/docs/1-structuring-your-smart-contract
     */
    function baseTokenURI() external view returns (string memory);

    /**
     * Required by opensea for storefront metadata https://docs.opensea.io/docs/contract-level-metadata
     */
    function contractURI() external view returns (string memory);

    /**
     * Returns the current token ID counter. It is incremented after each mint.
     * I.e. the next token ID to be minted is equal to this value.
     */
    function currentTokenId() external view returns (uint256);
}

// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {ERC721Burnable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";
import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC721Metadata} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import {IERC2981} from "@openzeppelin/contracts/interfaces/IERC2981.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IFF721} from "../interfaces/IFF721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract FF721Penfolds is
    IFF721,
    ERC721,
    ERC721URIStorage,
    ERC721Burnable,
    AccessControl,
    Ownable
{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant SETTER_ROLE = keccak256("SETTER_ROLE");

    string private constant _name = "Penfolds Grange 1951-2008 Collection";
    string private constant _symbol = "FF721PGs";
    string private _baseTokenURI =
        "https://ipfs.fanfire.ai/ipfs/QmerFYYdJG1QhvG2MTkU5WNRwWppY5oDRB6qJTpakija7C/Penfolds/";
    string private _contractURI =
        "https://ipfs.fanfire.ai/ipfs/QmerFYYdJG1QhvG2MTkU5WNRwWppY5oDRB6qJTpakija7C/Penfolds/collection.json";
    address private _royaltyReceiver =
        0xFdD72142CA8cE7dC492cDe17557c16d8cbc17c1B;
    uint256 private _royaltyBasisPoint = 800;


    constructor() ERC721(_name, _symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev See {IFF721-mint}.
     */
    function mint(address to, string memory uri) public onlyRole(MINTER_ROLE) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    /**
     * @dev See {IFF721-burn}.
     */
    function burn(
        uint256 tokenId
    ) public override(ERC721Burnable, IFF721) onlyRole(BURNER_ROLE) {
        _burn(tokenId);
    }

    /**
     * @dev See {IFF721-setRoyalties}.
     */
    function setRoyalties(
        address newRecipient,
        uint256 newBasisPoints
    ) external onlyRole(SETTER_ROLE) {
        _setRoyalties(newRecipient, newBasisPoints);
    }

    /**
     * @dev See {IFF721-setBaseTokenURI}.
     *
     * emits {IFF721-BaseTokenURIChanged} event
     */
    function setBaseTokenURI(string memory uri) public onlyRole(SETTER_ROLE) {
        _baseTokenURI = uri;

        emit BaseTokenURIChanged(uri);
        // from ERC-4906
        emit BatchMetadataUpdate(0, type(uint256).max);
    }

    /**
     * @dev See {IFF721-setContractURI}.
     *
     * emits {IFF721-ContractURIChanged} event
     */
    function setContractURI(string memory uri) public onlyRole(SETTER_ROLE) {
        _contractURI = uri;
        emit ContractURIChanged(uri);
    }

    /**
     * @dev See {IFF721-setTokenURI}.
     *
     * emits {IFF721-TokenURIChanged} event
     */
    function setTokenURI(
        uint256 tokenId,
        string memory uri
    ) public onlyRole(SETTER_ROLE) {
        _setTokenURI(tokenId, uri);
        emit TokenURIChanged(tokenId, uri);
    }

    /**
     * @dev See {IFF721-setTokenURI}.
     */
    function tokenURI(
        uint256 tokenId
    )
        public
        view
        override(ERC721, ERC721URIStorage, IERC721Metadata)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    /**
     * Override ERC721URIStorage._baseURI() to return the base token URI
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * Required by opensea according to https://docs.opensea.io/docs/1-structuring-your-smart-contract
     */
    function baseTokenURI() public view returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * Required by opensea for storefront metadata https://docs.opensea.io/docs/contract-level-metadata
     */
    function contractURI() public view returns (string memory) {
        return _contractURI;
    }

    /**
     *
     * @dev EIP2981 royalty standard
     *
     * Currently we are not setting royalties to on a per tokenId basis, but
     * rather on a per contract basis.
     *
     * @param _tokenId - token id of which to get royalty info
     * @param _salePrice - sale price that the royalty is being calculated for
     * @return receiver - address of the royalty receiver for this token
     * @return royaltyAmount - amount of royalty to be paid
     */
    function royaltyInfo(
        uint256 _tokenId,
        uint256 _salePrice
    ) external view override returns (address receiver, uint256 royaltyAmount) {
        return (
            _royaltyReceiver,
            (_salePrice * _royaltyBasisPoint) / 10000 + _tokenId * 0
        );
    }

    /**
     * @dev Returns the current token id counter. I.e. the next token id minted
     */
    function currentTokenId() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(ERC721, IERC165, AccessControl)
        returns (bool)
    {
        return (interfaceId == type(IERC2981).interfaceId ||
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC165).interfaceId ||
            interfaceId == type(IAccessControl).interfaceId ||
            interfaceId == type(IFF721).interfaceId ||
            super.supportsInterface(interfaceId));
    }

    // The following functions are overrides required by Solidity.
    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    /**
     * @dev Internal function to set the royalties for this contract
     *
     * @param newRecipient - address of the new royalty receiver
     * @param newBasisPoints - basis points of the new royalty amount
     *
     * Emits a {RoyaltiesSet} event.
     */
    function _setRoyalties(
        address newRecipient,
        uint256 newBasisPoints
    ) internal {
        require(
            newRecipient != address(0),
            "Royalties: new recipient is the zero address"
        );
        _royaltyReceiver = newRecipient;
        _royaltyBasisPoint = newBasisPoints;
        emit RoyaltiesSet(newRecipient, newBasisPoints);
    }
}

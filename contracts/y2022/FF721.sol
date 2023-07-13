// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract FF721 is
    ERC721,
    ERC721URIStorage,
    ERC721Burnable,
    Ownable,
    IERC2981,
    AccessControl
{
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant UPDATER_ROLE = keccak256("UPDATER_ROLE");

    using Counters for Counters.Counter;
    using Strings for uint256;

    string private constant _name = "<ESTATE NAME>";
    string private constant _symbol = "<ESTATE SYMBOL>";
    string private _baseTokenURI = "https://ipfs.fanfire.ai/ipfs/";
    string private _contractURI =
        "https://ipfs.fanfire.ai/ipfs/collection.json";
    address private _royaltyReceiver =
        0xFdD72142CA8cE7dC492cDe17557c16d8cbc17c1B;
    uint256 private _royaltyBasisPoint = 1000;

    Counters.Counter private _tokenIdCounter;

    constructor() ERC721(_name, _symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
        _grantRole(UPDATER_ROLE, msg.sender);
    }

    function getTokenIdCounter() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    function selfDestruct(address adr) public onlyOwner {
        selfdestruct(payable(adr));
    }

    function safeMint(address to, string memory uri)
        public
        onlyRole(MINTER_ROLE)
    {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function burn(uint256 tokenId)
        public
        override(ERC721Burnable)
        onlyRole(BURNER_ROLE)
    {
        // require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721Burnable: caller is not owner nor approved");
        _burn(tokenId);
    }

    // The following function overrides required by Solidity.
    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function updateBaseTokenURI(string memory uri)
        public
        onlyRole(UPDATER_ROLE)
    {
        _baseTokenURI = uri;
    }

    function updateContractURI(string memory uri)
        public
        onlyRole(UPDATER_ROLE)
    {
        _contractURI = uri;
    }

    function updateTokenURI(uint256 tokenId, string memory _tokenURI)
        public
        onlyRole(UPDATER_ROLE)
    {
        _setTokenURI(tokenId, _tokenURI);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    // Required by opensea according to https://docs.opensea.io/docs/1-structuring-your-smart-contract
    function baseTokenURI() public view returns (string memory) {
        return _baseTokenURI;
    }

    // Required by opensea for storefront metadata https://docs.opensea.io/docs/contract-level-metadata
    function contractURI() public view returns (string memory) {
        return _contractURI;
    }

    // EIP2981 standard royalties return.
    function royaltyInfo(uint256 _tokenId, uint256 _salePrice)
        external
        view
        override
        returns (address receiver, uint256 royaltyAmount)
    {
        return (
            _royaltyReceiver,
            (_salePrice * _royaltyBasisPoint) / 10000 + _tokenId * 0
        );
    }

    // Maintain flexibility to modify royalties recipient (could also add basis points).
    function _setRoyalties(address newRecipient, uint256 newBasisPoints)
        internal
    {
        require(
            newRecipient != address(0),
            "Royalties: new recipient is the zero address"
        );
        _royaltyReceiver = newRecipient;
        _royaltyBasisPoint = newBasisPoints;
    }

    function setRoyalties(address newRecipient, uint256 newBasisPoints)
        external
        onlyOwner
    {
        _setRoyalties(newRecipient, newBasisPoints);
    }

    // EIP2981 standard Interface return.
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, IERC165, AccessControl)
        returns (bool)
    {
        return (interfaceId == type(IERC2981).interfaceId ||
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC165).interfaceId ||
            interfaceId == 0x000ff721 ||
            interfaceId == type(IAccessControl).interfaceId ||
            super.supportsInterface(interfaceId));
    }
}

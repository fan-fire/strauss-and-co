// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.5.0) (token/ERC721/ERC721.sol)

pragma solidity 0.8.18;
import "../interfaces/IBasket.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract BasketStrauss2022 is
    IBasket,
    ERC721,
    ERC721URIStorage,
    ERC721Burnable,
    ReentrancyGuard,
    AccessControl
{
    using Counters for Counters.Counter;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant SETTER_ROLE = keccak256("SETTER_ROLE");
    bytes32 public constant ADDER_ROLE = keccak256("ADDER_ROLE");

    address private _royaltyReceiver =
        0x25375E1DaFa37a31069d323a37A6f93eaF356123;
    uint256 private _royaltyBasisPoint = 1000;

    string internal _contractURI = "https://ipfs.fanfire.ai/ipfs/QmYo25Z5mWw4casmgwTAUAG7BJmP9tWx3YKdHRdVD8g6oV/collection.json";
    string internal _baseTokenURI = "https://ipfs.fanfire.ai/ipfs/QmYo25Z5mWw4casmgwTAUAG7BJmP9tWx3YKdHRdVD8g6oV/";
    uint256 public constant OPEN_COOL_DOWN_S = 60;
    Counters.Counter internal _tokenIdCounter;

    mapping(uint256 => BasketState) internal _state; // basketId -> BasketState
    mapping(uint256 => Token[]) internal _tokens; // basketId -> Token
    mapping(uint256 => mapping(address => mapping(uint256 => uint256)))
        internal _listPtr; // basketId -> contract -> tokenId -> listPtr
    mapping(address => uint256[]) internal _baskets; // basketOwners owner -> basketIds
    mapping(uint256 => uint256) internal _basketOpenCoolDown; // vaultId -> openCoolDown

    event RoyaltiesSet(
        address indexed newRecipient,
        uint256 indexed newBasisPoints
    );
    event BaseTokenURIChanged(string newBaseTokenURI);
    // ERC-4906 events to update OpenSea when updating baseTokenURI
    event BatchMetadataUpdate(uint256 _fromTokenId, uint256 _toTokenId);
    
    constructor() ERC721("Basket Strauss 2022", "BS2022") {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    modifier onlyBasketOwner(uint256 _basketId) {
        require(ownerOf(_basketId) == _msgSender(), "Basket: not owner");
        _;
    }

    /**
     * @dev Modifier that checks that all other baskets for the owner of basketId are closed
     *
     * @param _basketId: The id of the basket
     */
    modifier allOtherBasketsClosed(uint256 _basketId) {
        require(
            isAllBasketsClosed(ownerOf(_basketId)),
            "Basket: not all baskets owned by owner closed"
        );
        _;
    }

    /**
     * @dev Allows anyone to Mint a new basket in an open state
     *
     * @param _to The address of the basket owner
     * @param _uri The URI of the basket - this is the metadata for the basket and will be appended to the baseTokenURI. Usually a JSON file called {tokenId}.json
     *
     * Emits a Mint event
     */
    function mint(
        address _to,
        string memory _uri
    ) public onlyRole(MINTER_ROLE) {
        // effects
        uint256 basketId = curBasketId();
        _state[basketId] = BasketState.OPENED;
        _baskets[_to].push(basketId);
        _basketOpenCoolDown[basketId] = block.timestamp + OPEN_COOL_DOWN_S;

        // integrations
        safeMint(_to, _uri);

        emit Mint(basketId, _to, _uri);
    }

    /**
     * @dev Allows anyone to add a erc721 token to a basket
     *
     * The basket MUST exist
     * The basket MUST be open
     * The caller MUST be the owner of the token to be added
     * The token being added MUST have the basket contract approved to spend all tokens
     * The token being added MUST be owned by the caller
     * The token being added MUST be a IERC721
     * The token being added MUST not be the ZERO address or the address of this contract
     * The token being added MUST not already be in the basket
     *
     * @param _basketId The id of the basket
     * @param _erc721 The address of the ERC721 contract
     * @param _tokenId The id of the token
     *
     * Emits a Add event
     */
    function add(
        uint256 _basketId,
        address _erc721,
        uint256 _tokenId
    ) public onlyRole(ADDER_ROLE) {
        // Checks
        require(_exists(_basketId), "Basket: does not exist");
        require(_state[_basketId] == BasketState.OPENED, "Basket: is not open");

        require(
            _erc721 != address(0) && _erc721 != address(this),
            "Basket: erc721 0 or this contract"
        );
        require(
            IERC165(_erc721).supportsInterface(type(IERC721).interfaceId),
            "Basket: erc721 not IERC721"
        );

        IERC721 erc721 = IERC721(_erc721);
        address tokenOwner = erc721.ownerOf(_tokenId);
        require(tokenOwner == _msgSender(), "Basket: caller not token owner");
        require(
            erc721.isApprovedForAll(tokenOwner, address(this)),
            "Basket: erc721 not approved for basket"
        );

        // Effects
        uint256 listPtr = _tokens[_basketId].length;
        Token memory token = Token(_erc721, _tokenId, listPtr);
        _tokens[_basketId].push(token);
        _listPtr[_basketId][_erc721][_tokenId] = listPtr;

        // Integrations
        erc721.safeTransferFrom(tokenOwner, address(this), _tokenId);

        emit Add(_basketId, _erc721, _tokenId, tokenOwner);
    }

    /**
     * @dev Remove a token from a basket and into the basket owners wallet
     *
     * The basket MUST exist
     * The basket MUST be open
     * The token MUST be in the basket
     * The caller MUST be the owner of the basket
     *
     * @param _basketId The id of the basket
     * @param _erc721 The address of the ERC721 contract
     * @param _tokenId The id of the token
     *
     * Emits a Remove event
     */

    function remove(
        uint256 _basketId,
        address _erc721,
        uint256 _tokenId
    ) public onlyBasketOwner(_basketId) nonReentrant {
        // Checks
        require(_state[_basketId] == BasketState.OPENED, "Basket: is not open");
        require(_tokens[_basketId].length > 0, "Basket: is empty");
        require(
            isTokenInBasket(_basketId, _erc721, _tokenId),
            "Basket: token not in basket"
        );

        uint256 listPtr = _listPtr[_basketId][_erc721][_tokenId];
        Token memory token = _tokens[_basketId][listPtr];

        // Effects
        if (_tokens[_basketId].length == 1) {
            _tokens[_basketId].pop();
        } else {
            uint256 nrTokens = _tokens[_basketId].length;
            Token memory lastToken = _tokens[_basketId][nrTokens - 1];
            lastToken.listPtr = listPtr;
            _tokens[_basketId][listPtr] = lastToken;
            _tokens[_basketId].pop();
            _listPtr[_basketId][lastToken.erc721][lastToken.tokenId] = listPtr;
        }

        // Integrations
        IERC721(token.erc721).safeTransferFrom(
            address(this),
            _msgSender(),
            token.tokenId
        );

        emit Remove(_basketId, _erc721, _tokenId, _msgSender());
    }

    /**
     * @dev Burn a basket
     *
     * The basket MUST exist
     * The basket MUST be closed and empty
     * The basket owner MUST be the caller
     *
     * @param _basketId The id of the basket
     *
     * Emits a Burn event
     */
    function burn(
        uint256 _basketId
    )
        public
        override(IBasket, ERC721Burnable)
        onlyRole(BURNER_ROLE)
    {
        // Checks
        require(
            _state[_basketId] == BasketState.CLOSED,
            "Basket: is not closed"
        );
        address _basketOwner = ownerOf(_basketId);
        // require all tokens to have been taken out of basket
        require(_tokens[_basketId].length == 0, "Basket: is not empty");

        // Effects
        _state[_basketId] = BasketState.BURNED;

        // remove basket from basket owners list
        bool found = false;
        uint256 indx;

        for (uint256 i = 0; i < _baskets[_basketOwner].length; i++) {
            if (_baskets[_basketOwner][i] == _basketId) {
                found = true;
                indx = i;
                break;
            }
        }

        assert(found);

        if (_baskets[_basketOwner].length == 1) {
            _baskets[_basketOwner].pop();
        } else {
            _baskets[_basketOwner][indx] = _baskets[_basketOwner][
                _baskets[_basketOwner].length - 1
            ];
            _baskets[_basketOwner].pop();
        }

        // Integrations
        _burn(_basketId);

        emit Burn(_basketId, _basketOwner);
    }

    /**
     * @dev Close a basket
     *
     * The basket MUST exist
     * The basket MUST be open
     * The basket owner MUST be the caller
     * The basket MUST be open for at least OPEN_COOL_DOWN_S seconds
     *
     * @param _basketId The id of the basket
     *
     * Emits a Close event
     */
    function close(uint256 _basketId) public onlyBasketOwner(_basketId) {
        // Checks
        require(_state[_basketId] == BasketState.OPENED, "Basket: is not open");
        require(
            basketOpenCoolDown(_basketId) < block.timestamp,
            "Basket: open cooldown not passed"
        );

        // Effects
        _state[_basketId] = BasketState.CLOSED;

        // Integrations
        emit Close(_basketId, _msgSender());
        emit Unlocked(_basketId);
    }

    /**
     * @dev Open a basket
     *
     * The basket MUST exist
     * The basket MUST be closed
     * The basket owner MUST be the caller
     *
     * @param _basketId The id of the basket
     *
     * Emits a Open event
     */
    function open(uint256 _basketId) public onlyBasketOwner(_basketId) {
        // Checks
        require(
            _state[_basketId] == BasketState.CLOSED,
            "Basket: is not closed"
        );

        // Effects
        _state[_basketId] = BasketState.OPENED;
        _basketOpenCoolDown[_basketId] = block.timestamp + OPEN_COOL_DOWN_S;
        // set approve to ZERO address to ensure that when you open the vault wallet that was allowed to spend is revoked
        _approve(address(0), _basketId);

        // Integrations
        emit Open(_basketId, _msgSender());
        emit Locked(_basketId);
    }

    /**
     * @dev Transfer a basket
     *
     * Overrides ERC721 _transfer function to add basket transfer logic
     *
     * This will be called by safeTransferFrom and transferFrom
     *
     * The basket MUST exist
     * The basket MUST be closed
     * All other baskets for the sender MUST be closed
     *
     * @param from The address of the basket owner
     * @param to The address of the new basket owner
     * @param tokenId The id of the baskets
     *
     * Checks that all baskets for the sender is closed
     *
     */
    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721) allOtherBasketsClosed(tokenId) {
        bool found = false;
        uint256 indx;

        for (uint256 i = 0; i < _baskets[from].length; i++) {
            if (_baskets[from][i] == tokenId) {
                found = true;
                indx = i;
                break;
            }
        }

        assert(found);

        if (_baskets[from].length == 1) {
            _baskets[from].pop();
        } else {
            _baskets[from][indx] = _baskets[from][_baskets[from].length - 1];
            _baskets[from].pop();
        }

        // add basket to basket owners list
        _baskets[to].push(tokenId);

        super._transfer(from, to, tokenId);
    }

    /**
     * @dev isTokenInBasket
     *
     * @param _basketId The id of the basket
     * @param _erc721 The address of the token contract
     * @param _tokenId The id of the token
     *
     * Checks if a token is in a basket
     *
     * Returns true if the token is in the basket
     * Returns false if the token is not in the basket
     *
     */
    function isTokenInBasket(
        uint256 _basketId,
        address _erc721,
        uint256 _tokenId
    ) public view returns (bool) {
        uint256 listPtr = _listPtr[_basketId][_erc721][_tokenId];
        if (listPtr < _tokens[_basketId].length) {
            Token memory token = _tokens[_basketId][listPtr];
            return ((token.erc721 == _erc721) && (token.tokenId == _tokenId));
        } else {
            return false;
        }
    }

    /**
     * @dev isAllBasketsClosed
     *
     * @param _owner The address of the basket owner
     *
     * Checks if all baskets for an owner is closed
     *
     * Returns true if all baskets are closed
     * Returns false if not all baskets are closed
     *
     */
    function isAllBasketsClosed(address _owner) public view returns (bool) {
        uint256[] memory ownedBaskets = _baskets[_owner];
        for (uint256 i = 0; i < ownedBaskets.length; i++) {
            uint256 basketId = ownedBaskets[i];
            if (_state[basketId] == BasketState.OPENED) {
                return false;
            }
        }
        return true;
    }

    /**
     * @dev safeMint - automatically increments the token id
     *
     * @param to The address of the basket owner
     * @param uri The uri of the basket
     *
     */
    function safeMint(address to, string memory uri) internal {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        emit Locked(tokenId);
    }

    /**
     * @dev approve - override ERC721 approve function
     *
     * Checks that all baskets for the sender are closed, if so then approves the spender
     *
     */
    function approve(
        address to,
        uint256 tokenId
    ) public override(IERC721, ERC721) allOtherBasketsClosed(tokenId) {
        super.approve(to, tokenId);
    }

    /**
     * @dev setApprovalForAll - override ERC721 setApprovalForAll function
     *
     * Checks that all baskets for the sender is closed
     *
     */
    function setApprovalForAll(
        address operator,
        bool approved
    ) public override(IERC721, ERC721) {
        require(
            isAllBasketsClosed(_msgSender()),
            "Basket: not all baskets owned by owner closed"
        );
        _setApprovalForAll(_msgSender(), operator, approved);
    }

    /**
     * @dev isApprovedForAll - override ERC721 isApprovedForAll function
     *
     * Checks that all baskets for the sender is closed
     *
     */
    function isApprovedForAll(
        address owner,
        address operator
    ) public view override(IERC721, ERC721) returns (bool) {
        if (isAllBasketsClosed(owner)) {
            return super.isApprovedForAll(owner, operator);
        }

        return false;
    }

    function basketsOf(
        address _owner
    ) external view returns (uint256[] memory) {
        return _baskets[_owner];
    }

    function stateOf(
        uint256 _basketId
    ) external view returns (BasketState basketState) {
        return _state[_basketId];
    }

    function tokensIn(
        uint256 _basketId
    ) external view returns (Token[] memory) {
        return _tokens[_basketId];
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    // The following functions are overrides required by Solidity.
    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function basketOpenCoolDown(
        uint256 _basketId
    ) public view returns (uint256) {
        return _basketOpenCoolDown[_basketId];
    }

    function curBasketId() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    // Required by opensea according to https://docs.opensea.io/docs/1-structuring-your-smart-contract
    function baseTokenURI() public view returns (string memory) {
        return _baseTokenURI;
    }

    // Required by opensea for storefront metadata https://docs.opensea.io/docs/contract-level-metadata
    function contractURI() public view returns (string memory) {
        return _contractURI;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public pure override(AccessControl, ERC721, IERC165) returns (bool) {
        return (interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC165).interfaceId ||
            interfaceId == type(IERC721Metadata).interfaceId ||
            interfaceId == type(IERC721Receiver).interfaceId ||
            interfaceId == type(IAccessControl).interfaceId ||
            interfaceId == type(IERC2981).interfaceId ||
            interfaceId == type(IBasket).interfaceId);
    }

    function onERC721Received(
        address _operator,
        address _from,
        uint256 _tokenId,
        bytes calldata _data
    ) external override returns (bytes4) {
        _operator;
        _from;
        _tokenId;
        _data;
        emit Received(_operator, _from, _tokenId);
        return this.onERC721Received.selector;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
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
    ) external view returns (address receiver, uint256 royaltyAmount) {
        return (
            _royaltyReceiver,
            (_salePrice * _royaltyBasisPoint) / 10000 + _tokenId * 0
        );
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
}

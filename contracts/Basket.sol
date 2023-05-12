// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.5.0) (token/ERC721/ERC721.sol)

pragma solidity 0.8.18;
import "./IBasket.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

contract Basket is IBasket, ERC721, ERC721URIStorage, ERC721Burnable {
    using Counters for Counters.Counter;

    string internal _contractURI = "<ADD CONTRACT URI HERE>";
    string internal _baseTokenURI = "<ADD BASE URI HERE>";
    Counters.Counter internal _tokenIdCounter;

    mapping(uint256 => BasketState) internal _state; // basketId -> BasketState
    mapping(uint256 => Token[]) internal _tokens; // basketId -> Token
    mapping(uint256 => mapping(address => mapping(uint256 => uint256)))
        internal _listPtr; // basketId -> contract -> tokenId -> listPtr
    mapping(address => uint256[]) internal _baskets; // basketOwners owner -> basketIds

    constructor() ERC721("Fanfire Basket", "FFB") {}

    modifier onlyBasketOwner(uint256 _basketId) {
        require(ownerOf(_basketId) == _msgSender(), "Basket: not owner");
        _;
    }

    modifier allBasketsClosed(uint256 _basketId) {
        require(
            isAllBasketsClosed(ownerOf(_basketId)),
            "Basket: not all closed"
        );
        _;
    }

    /**
     * @dev Mints a new basket in an open state
     *
     * @param _to The address of the basket owner
     * @param _uri The URI of the basket
     *
     * Emits a Mint event
     */
    function mint(address _to, string memory _uri) public {
        // effects
        uint256 basketId = curBasketId();
        _state[basketId] = BasketState.OPEN;
        _baskets[_to].push(basketId);

        // integrations
        safeMint(_to, _uri);

        emit Mint(basketId, _to, _uri);
    }

    /**
     * @dev Add a token to a basket
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
    ) public {
        // Checks

        require(_exists(_basketId), "Basket: does not exist");
        require(_state[_basketId] == BasketState.OPEN, "Basket: is not open");

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

        emit Add(_basketId, _erc721, _tokenId);
    }

    /**
     * @dev Remove a token from a basket
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
    ) public onlyBasketOwner(_basketId) {
        // Checks
        require(_state[_basketId] == BasketState.OPEN, "Basket: not open");
        require(_tokens[_basketId].length > 0, "Basket: not empty");
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
            _listPtr[_basketId][lastToken.erc721][
                lastToken.tokenId
            ] = listPtr;
        }

        // Integrations
        IERC721(token.erc721).safeTransferFrom(
            address(this),
            _msgSender(),
            token.tokenId
        );

        emit Remove(_basketId, _erc721, _tokenId);
    }

    /**
     * @dev Burn a basket
     *
     * @param _basketId The id of the basket
     *
     * Emits a Burn event
     */
    function burn(
        uint256 _basketId
    ) public override(IBasket, ERC721Burnable) onlyBasketOwner(_basketId) {
        // Checks
        require(_state[_basketId] == BasketState.CLOSED, "Basket: not closed");
        address _basketOwner = ownerOf(_basketId);
        // require all tokens to have been taken out of basket
        require(_tokens[_basketId].length == 0, "Basket: not empty");

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

        require(found, "Basket: not found for basket owner");

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

        emit Burn(_basketId);
    }

    /**
     * @dev Close a basket
     *
     * @param _basketId The id of the basket
     *
     * Emits a Close event
     */
    function close(uint256 _basketId) public onlyBasketOwner(_basketId) {
        // Checks
        require(_exists(_basketId), "Basket: does not exist");
        require(_state[_basketId] == BasketState.OPEN, "Basket: not open");

        // Effects
        _state[_basketId] = BasketState.CLOSED;

        // Integrations
        emit Close(_basketId);
    }

    /**
     * @dev Open a basket
     *
     * @param _basketId The id of the basket
     *
     * Emits a Open event
     */
    function open(uint256 _basketId) public onlyBasketOwner(_basketId) {
        // Checks
        require(_exists(_basketId), "Basket: does not exist");
        require(_state[_basketId] == BasketState.CLOSED, "Basket: not closed");

        // Effects
        _state[_basketId] = BasketState.OPEN;

        // Integrations
        emit Open(_basketId);
    }

    /**
     * @dev Transfer a basket
     *
     * @param from The address of the basket owner
     * @param to The address of the new basket owner
     * @param tokenId The id of the basket
     *
     * Checks that all baskets for the sender is closed
     *
     */
    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721) allBasketsClosed(tokenId) {
        bool found = false;
        uint256 indx;

        for (uint256 i = 0; i < _baskets[from].length; i++) {
            if (_baskets[from][i] == tokenId) {
                found = true;
                indx = i;
                break;
            }
        }

        require(found, "Basket: not found");

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
            return ((token.erc721 == _erc721) &&
                (token.tokenId == _tokenId));
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
            if (_state[basketId] == BasketState.OPEN) {
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
    }

    /**
     * @dev approve - override ERC721 approve function
     *
     * Checks that all baskets for the sender is closed
     *
     */
    function approve(
        address to,
        uint256 tokenId
    ) public override(IERC721, ERC721) allBasketsClosed(tokenId) {
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
            "Basket: all baskets not closed"
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
        require(isAllBasketsClosed(owner), "Basket: all baskets not closed");
        return super.isApprovedForAll(owner, operator);
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
    ) public pure override(ERC721, IERC165) returns (bool) {
        return (interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC165).interfaceId ||
            interfaceId == type(IERC721Metadata).interfaceId ||
            interfaceId == type(IERC721Receiver).interfaceId ||
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

}

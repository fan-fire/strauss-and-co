// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts/access/IAccessControl.sol";
import "@openzeppelin/contracts/interfaces/IERC165.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC721Receiver.sol";

/**
 * @dev Required interface of an IBasket compliant contract.
 */
interface IBasket is IERC721, IERC721Receiver {
    enum BasketState {
        OPEN,
        CLOSED,
        BURNED
    }

    struct Token {
        address tokenAddress;
        uint256 tokenId;
        uint256 listPtr;
    }

    event Burn(uint256 indexed basketId);
    event Mint(uint256 indexed basketId, address indexed owner, string uri);
    
    event Close(uint256 indexed basketId);
    event Open(uint256 indexed basketId);
    event Add(
        uint256 indexed basketId,
        address indexed tokenAddress,
        uint256 indexed tokenId
    );
    event Remove(
        uint256 indexed basketId,
        address indexed tokenAddress,
        uint256 indexed tokenId
    );
    
    event Received(
        address indexed operator,
        address indexed from,
        uint256 indexed tokenId
    );
    function mint(address _to, string memory _uri) external;
    function burn(uint256 _basketId) external;

    function add(
        uint256 _basketId,
        address _contract,
        uint256 _tokenId
    ) external;

    function remove(
        uint256 _basketId,
        address _contract,
        uint256 _tokenId
    ) external;


    function close(uint256 _basketId) external;

    function open(uint256 _basketId) external;

    function basketsOf(
        address _owner
    ) external view returns (uint256[] memory baskets);

    function stateOf(
        uint256 _basketId
    ) external view returns (BasketState basketState);

    function tokensIn(
        uint256 _basketId
    ) external view returns (Token[] memory tokens);

    function isTokenInBasket(
        uint256 _basketId,
        address _contract,
        uint256 _tokenId
    ) external view returns (bool isTokenInBasket);

    function isAllBasketsClosed(address _owner) external view returns (bool isAllBasketsClosed);

    function curBasketId() external view returns (uint256 basketId);

    function baseTokenURI() external view returns (string memory);

    function contractURI() external view returns (string memory);
}

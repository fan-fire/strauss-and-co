import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { AddressZero } from "@ethersproject/constants";
import { expect } from "chai";
import { BASKET_STATE, INTERFACE_IDS, OPEN_COOL_DOWN_S, REVERT_MESSAGES, basketFixture, cleanToken } from "./utils";
const { testUtils } = require('hardhat');
const { time } = testUtils;
describe("Add", function () {

    it("can't add token of 721 if it has not yet been minted", async () => {
        const { deployer, owner, basket, erc721 } = await loadFixture(basketFixture);
        const uri = 'uri';
        let basketId;
        basketId = 0;
        await basket.connect(deployer).mint(owner.address, uri);

        await expect(basket.connect(owner)
            .add(basketId, erc721.address, 0))
            .to.be.revertedWith(REVERT_MESSAGES.ERC721_INVALID_TOKEN_ID);
    });

    it("can't add token of 721 if it has been burned", async () => {
        const { deployer, owner, basket, erc721 } = await loadFixture(basketFixture);
        const uri = 'uri';

        let basketId;
        basketId = 0;

        await basket.connect(deployer).mint(owner.address, uri);
        await erc721.connect(deployer).safeMint(owner.address, 0);
        await erc721.connect(owner).burn(0);

        await expect(basket.connect(owner)
            .add(basketId, erc721.address, 0))
            .to.be.revertedWith(REVERT_MESSAGES.ERC721_INVALID_TOKEN_ID);
    });

    it("can't add token of 721 if it has been transferred to another address", async () => {
        const { deployer, owner, basket, erc721 } = await loadFixture(basketFixture);
        const uri = 'uri';

        let basketId;
        basketId = 0;

        await basket.connect(deployer).mint(owner.address, uri);
        await erc721.connect(deployer).safeMint(owner.address, 0);
        await erc721.connect(owner).transferFrom(owner.address, deployer.address, 0);

        await expect(basket.connect(owner)
            .add(basketId, erc721.address, 0))
            .to.be.revertedWith(REVERT_MESSAGES.BASKET_ERC721_NOT_OWNER);
    });

    it("can't add token of 721 if the basket has not been approved for transfer", async () => {
        const { deployer, owner, basket, erc721 } = await loadFixture(basketFixture);
        const uri = 'uri';

        let basketId;
        basketId = 0;

        await basket.connect(deployer).mint(owner.address, uri);
        await erc721.connect(deployer).safeMint(owner.address, 0);

        await expect(basket.connect(owner)
            .add(basketId, erc721.address, 0))
            .to.be.revertedWith(REVERT_MESSAGES.BASKET_ERC721_NOT_APPROVED);
    });

    it("can't add erc721 if zero address", async () => {
        const { deployer, owner, basket } = await loadFixture(basketFixture);
        const uri = 'uri';
        const basketId = 0;

        await basket.connect(deployer).mint(owner.address, uri);

        await expect(basket.connect(owner).add(basketId, AddressZero, 0))
        .to.be.revertedWith(REVERT_MESSAGES.BASKET_ERC721_0_OR_THIS);
    });

    it("can't add erc721 if it is the basket", async () => {
        const { deployer, owner, basket } = await loadFixture(basketFixture);
        const uri = 'uri';
        const basketId = 0;


        await basket.connect(deployer).mint(owner.address, uri);

        await expect(basket.connect(owner).add(basketId, basket.address, 0))
        .to.be.revertedWith(REVERT_MESSAGES.BASKET_ERC721_0_OR_THIS);
    });

    it("can't if erc721 does not support IERC721", async () => {
        const { deployer, owner, basket, not721 } = await loadFixture(basketFixture);

        const uri = 'uri';
        const basketId = 0;

        await basket.connect(deployer).mint(owner.address, uri);
        await not721.connect(deployer).safeMint(owner.address, 0);

        expect(await not721.supportsInterface(INTERFACE_IDS.IERC721)).to.be.false;

        await not721.connect(owner).setApprovalForAll(basket.address, true);

        await expect(basket.connect(owner).add(basketId, not721.address, 0))
        .to.be.revertedWith(REVERT_MESSAGES.BASKET_ERC721_NOT_IERC721);
    });


    it("can't add to non-existant basket", async () => {
        const { deployer, owner, basket, erc721 } = await loadFixture(basketFixture);
        const uri = 'uri';
        const basketId = 0;

        await basket.connect(deployer).mint(owner.address, uri);
        await erc721.connect(deployer).safeMint(owner.address, 0);
        await erc721.connect(owner).setApprovalForAll(basket.address, true);

        await expect(basket.connect(owner).add(basketId + 1, erc721.address, 0))
        .to.be.revertedWith(REVERT_MESSAGES.BASKET_DOES_NOT_EXIST);
    });
    it("can't add if basket is not open", async () => {
        const { deployer, owner, basket, erc721 } = await loadFixture(basketFixture);
        const uri = 'uri';
        const basketId = 0;

        await basket.connect(deployer).mint(owner.address, uri);
        await erc721.connect(deployer).safeMint(owner.address, 0);
        await erc721.connect(owner).setApprovalForAll(basket.address, true);

        await time.increase(OPEN_COOL_DOWN_S + 1);

        await basket.connect(owner).close(basketId);

        expect(await basket.connect(owner).stateOf(basketId)).to.be.equal(BASKET_STATE.CLOSED);

        await expect(basket.connect(owner).add(basketId, erc721.address, 0))
        .to.be.revertedWith(REVERT_MESSAGES.BASKET_NOT_OPEN);

        expect(await basket.connect(owner).tokensIn(basketId)).to.have.lengthOf(0);
        expect(await erc721.ownerOf(0)).to.be.equal(owner.address);

    });
    it("owner of basket can add 1 token to basket", async () => {
        const { deployer, owner, basket, erc721 } = await loadFixture(basketFixture);
        const uri = 'uri';
        const basketId = 0;
        const tokenId = 0;

        await basket.connect(deployer).mint(owner.address, uri);
        await erc721.connect(deployer).safeMint(owner.address, tokenId);
        await erc721.connect(owner).setApprovalForAll(basket.address, true);

        expect(await basket.connect(owner).tokensIn(basketId)).to.have.lengthOf(0);
        expect(await erc721.ownerOf(0)).to.be.equal(owner.address);
        expect(await basket.connect(owner).stateOf(basketId)).to.be.equal(BASKET_STATE.OPEN);

        await basket.connect(owner).add(basketId, erc721.address, tokenId);
        const tokens = await basket.connect(owner).tokensIn(basketId);
        expect(tokens).to.have.lengthOf(1);
        expect(tokens.map(t => cleanToken(t))).to.deep.equal([{
            erc721: erc721.address,
            tokenId: tokenId,
            listPtr: 0
        }]);
        expect(await erc721.ownerOf(tokenId)).to.be.equal(basket.address);

    });
    it("not owner of basket can't add a token owned by owner to basket", async () => {
        const { deployer, owner, basket, erc721 } = await loadFixture(basketFixture);
        const uri = 'uri';
        const basketId = 0;
        const tokenId = 0;

        await basket.connect(deployer).mint(owner.address, uri);
        await erc721.connect(deployer).safeMint(owner.address, tokenId);
        await erc721.connect(owner).setApprovalForAll(basket.address, true);

        expect(await basket.connect(owner).tokensIn(basketId)).to.have.lengthOf(0);
        expect(await erc721.ownerOf(0)).to.be.equal(owner.address);
        expect(await basket.connect(owner).stateOf(basketId)).to.be.equal(BASKET_STATE.OPEN);

        // non owner of basket can add 1 token to basket
        await expect(basket.connect(deployer).add(basketId, erc721.address, tokenId))
        .to.be.revertedWith(REVERT_MESSAGES.BASKET_ERC721_NOT_OWNER);
      

    });
    it("tokens updated correctly when 3 different erc721's are added to 1 basket", async () => {
        const { deployer, owner, basket, erc721 } = await loadFixture(basketFixture);
        const uri = 'uri';
        const basketId = 0;
        const tokenId0 = 0;
        const tokenId1 = 1;
        const tokenId2 = 2;

        await basket.connect(deployer).mint(owner.address, uri);
        await erc721.connect(deployer).safeMint(owner.address, tokenId0);
        await erc721.connect(deployer).safeMint(owner.address, tokenId1);
        await erc721.connect(deployer).safeMint(owner.address, tokenId2);
        await erc721.connect(owner).setApprovalForAll(basket.address, true);

        expect(await basket.connect(owner).tokensIn(basketId)).to.have.lengthOf(0);
        expect(await erc721.ownerOf(tokenId0)).to.be.equal(owner.address);
        expect(await erc721.ownerOf(tokenId1)).to.be.equal(owner.address);
        expect(await erc721.ownerOf(tokenId2)).to.be.equal(owner.address);
        expect(await basket.connect(owner).stateOf(basketId)).to.be.equal(BASKET_STATE.OPEN);

        // non owner of basket can add 1 token to basket
        await basket.connect(owner).add(basketId, erc721.address, tokenId0);
        await basket.connect(owner).add(basketId, erc721.address, tokenId1);
        await basket.connect(owner).add(basketId, erc721.address, tokenId2);

        const tokens = await basket.connect(owner).tokensIn(basketId);
        expect(tokens).to.have.lengthOf(3);
        expect(tokens.map(t => cleanToken(t))).to.deep.equal([
            {
                erc721: erc721.address,
                tokenId: tokenId0,
                listPtr: 0
            },
            {
                erc721: erc721.address,
                tokenId: tokenId1,
                listPtr: 1
            },
            {
                erc721: erc721.address,
                tokenId: tokenId2,
                listPtr: 2
            }
        ]);
    });
    it("basket is the owner of NFT after adding 3 tokens", async () => {
        const { deployer, owner, basket, erc721 } = await loadFixture(basketFixture);
        const uri = 'uri';
        const basketId = 0;
        const tokenId0 = 0;
        const tokenId1 = 1;
        const tokenId2 = 2;

        await basket.connect(deployer).mint(owner.address, uri);
        await erc721.connect(deployer).safeMint(owner.address, tokenId0);
        await erc721.connect(deployer).safeMint(owner.address, tokenId1);
        await erc721.connect(deployer).safeMint(owner.address, tokenId2);
        await erc721.connect(owner).setApprovalForAll(basket.address, true);

        expect(await basket.connect(owner).tokensIn(basketId)).to.have.lengthOf(0);
        expect(await erc721.ownerOf(tokenId0)).to.be.equal(owner.address);
        expect(await erc721.ownerOf(tokenId1)).to.be.equal(owner.address);
        expect(await erc721.ownerOf(tokenId2)).to.be.equal(owner.address);
        expect(await basket.connect(owner).stateOf(basketId)).to.be.equal(BASKET_STATE.OPEN);

        // non owner of basket can add 1 token to basket
        await basket.connect(owner).add(basketId, erc721.address, tokenId0);
        await basket.connect(owner).add(basketId, erc721.address, tokenId1);
        await basket.connect(owner).add(basketId, erc721.address, tokenId2);

        const tokens = await basket.connect(owner).tokensIn(basketId);
        expect(tokens).to.have.lengthOf(3);
        expect(tokens.map(t => cleanToken(t))).to.deep.equal([
            {
                erc721: erc721.address,
                tokenId: tokenId0,
                listPtr: 0
            },
            {
                erc721: erc721.address,
                tokenId: tokenId1,
                listPtr: 1
            },
            {
                erc721: erc721.address,
                tokenId: tokenId2,
                listPtr: 2
            }
        ]);
        expect(await erc721.ownerOf(tokenId0)).to.be.equal(basket.address);
        expect(await erc721.ownerOf(tokenId1)).to.be.equal(basket.address);
        expect(await erc721.ownerOf(tokenId2)).to.be.equal(basket.address);

    });
    it("can add N tokens ", async () => {
        const N = 100

        const { deployer, owner, basket, erc721 } = await loadFixture(basketFixture);
        const uri = 'uri';
        const basketId = 0;
        const tokenId0 = 0;

        await basket.connect(deployer).mint(owner.address, uri);
        for (let i = 0; i < N; i++) {
            await erc721.connect(deployer).safeMint(owner.address, i);
        }
        await erc721.connect(owner).setApprovalForAll(basket.address, true);

        expect(await erc721.balanceOf(owner.address)).to.be.equal(N);
        expect(await basket.connect(owner).tokensIn(basketId)).to.have.lengthOf(0);
        expect(await erc721.ownerOf(tokenId0)).to.be.equal(owner.address);
        expect(await basket.connect(owner).stateOf(basketId)).to.be.equal(BASKET_STATE.OPEN);

        for (let i = 0; i < N; i++) {
            await basket.connect(owner).add(basketId, erc721.address, i);
        }

        const tokens = await basket.connect(owner).tokensIn(basketId);
        expect(tokens).to.have.lengthOf(N);
        expect(tokens.map(t => cleanToken(t))).to.deep.equal(
            Array.from(Array(N).keys()).map(i => ({
                erc721: erc721.address,
                tokenId: i,
                listPtr: i
        })));
    });
    it("isTokenInBasket works as expected", async () => {
        const { deployer, owner, basket, erc721 } = await loadFixture(basketFixture);
        const uri = 'uri';
        const basketId = 0;
        const tokenId0 = 0;
        const tokenId1 = 1;

        await basket.connect(deployer).mint(owner.address, uri);
        await erc721.connect(deployer).safeMint(owner.address, tokenId0);
        await erc721.connect(deployer).safeMint(owner.address, tokenId1);
        await erc721.connect(owner).setApprovalForAll(basket.address, true);

        expect(await basket.connect(owner).tokensIn(basketId)).to.have.lengthOf(0);
        expect(await erc721.ownerOf(tokenId0)).to.be.equal(owner.address);
        expect(await erc721.ownerOf(tokenId1)).to.be.equal(owner.address);
        expect(await basket.connect(owner).stateOf(basketId)).to.be.equal(BASKET_STATE.OPEN);

        await basket.connect(owner).add(basketId, erc721.address, tokenId0);

        const tokens = await basket.connect(owner).tokensIn(basketId);
        expect(tokens).to.have.lengthOf(1);
        expect(tokens.map(t => cleanToken(t))).to.deep.equal([
            {
                erc721: erc721.address,
                tokenId: tokenId0,
                listPtr: 0
            },
          
        ]);
        expect(await erc721.ownerOf(tokenId0)).to.be.equal(basket.address);
        expect(await erc721.ownerOf(tokenId1)).to.be.equal(owner.address);

        expect(await basket.connect(owner).isTokenInBasket(basketId, erc721.address, tokenId0)).to.be.equal(true);
        expect(await basket.connect(owner).isTokenInBasket(basketId, erc721.address, tokenId1)).to.be.equal(false);
    });

    it("isTokenInBasket works when there are no tokens in basket", async () => {
        const { deployer, owner, basket, erc721 } = await loadFixture(basketFixture);
        const uri = 'uri';
        const basketId = 0;
        const tokenId0 = 0;
        const tokenId1 = 1;

        await basket.connect(deployer).mint(owner.address, uri);
        await erc721.connect(deployer).safeMint(owner.address, tokenId0);
        await erc721.connect(deployer).safeMint(owner.address, tokenId1);
        await erc721.connect(owner).setApprovalForAll(basket.address, true);

        expect(await basket.connect(owner).tokensIn(basketId)).to.have.lengthOf(0);
        expect(await erc721.ownerOf(tokenId0)).to.be.equal(owner.address);
        expect(await erc721.ownerOf(tokenId1)).to.be.equal(owner.address);
        expect(await basket.connect(owner).stateOf(basketId)).to.be.equal(BASKET_STATE.OPEN);

        expect(await basket.connect(owner).isTokenInBasket(basketId, erc721.address, tokenId0)).to.be.equal(false);
        expect(await basket.connect(owner).isTokenInBasket(basketId, erc721.address, tokenId1)).to.be.equal(false);
    });


});
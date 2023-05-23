import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import {
    BASKET_STATE,
    REVERT_MESSAGES,
    OPEN_COOL_DOWN_S,
    basketFixture,
} from "./utils";
const { testUtils } = require('hardhat');
const { time } = testUtils;

describe("Burn", function () {

    it("can't burn non-existent basket", async () => {
        const { owner, basket } = await loadFixture(basketFixture);
        let basketId = 0;

        expect(await basket.balanceOf(owner.address)).to.equal(0);

        await expect(basket.connect(owner).burn(basketId))
            .to.be.revertedWith(REVERT_MESSAGES.ERC721_INVALID_TOKEN_ID);
    });

    it("only owner can burn basket", async () => {
        const { owner, receiver, basket } = await loadFixture(basketFixture);
        const uri = 'uri';
        let basketId = 0;

        await basket.connect(owner).mint(owner.address, uri);
        await time.increase(OPEN_COOL_DOWN_S + 1);
        await basket.connect(owner).close(basketId);
        expect(await basket.balanceOf(owner.address)).to.equal(1);
        await expect(basket.connect(receiver).burn(basketId))
            .to.be.revertedWith(REVERT_MESSAGES.BASKET_NOT_OWNER);

        await basket.connect(owner).burn(basketId);
        expect(await basket.balanceOf(owner.address)).to.equal(0);
    });

    it("basket needs to be closed to be burned", async () => {
        const { owner, basket } = await loadFixture(basketFixture);
        const uri = 'uri';
        let basketId = 0;

        await basket.connect(owner).mint(owner.address, uri);
        await time.increase(OPEN_COOL_DOWN_S + 1);
        await expect(basket.connect(owner).burn(basketId))
            .to.be.revertedWith(REVERT_MESSAGES.BASKET_NOT_CLOSED);

    });

    it("basket can't be burned if not empty", async () => {
        const { owner, deployer, basket, erc721 } = await loadFixture(basketFixture);
        const uri = 'uri';
        let basketId = 0;
        let tokenId = 0;

        await basket.connect(owner).mint(owner.address, uri);
        await time.increase(OPEN_COOL_DOWN_S + 1);
        await erc721.connect(deployer).safeMint(owner.address, tokenId);
        await erc721.connect(owner).setApprovalForAll(basket.address, true);
        await basket.connect(owner).add(basketId, erc721.address, tokenId);
        await basket.connect(owner).close(basketId);
        await expect(basket.connect(owner).burn(basketId))
            .to.be.revertedWith(REVERT_MESSAGES.BASKET_NOT_EMPTY);
    });
    it("state of basket is set to BURNED", async () => {
        const { owner, basket } = await loadFixture(basketFixture);
        const uri = 'uri';
        let basketId = 0;

        await basket.connect(owner).mint(owner.address, uri);
        await time.increase(OPEN_COOL_DOWN_S + 1);
        await basket.connect(owner).close(basketId);
        await basket.connect(owner).burn(basketId);
        expect(await basket.stateOf(basketId)).to.equal(BASKET_STATE.BURNED);
    });


    it("owners' baskets updated correctly", async () => {
        const { owner, basket } = await loadFixture(basketFixture);
        const uri = 'uri';
        let basketId0 = 0;
        let basketId1 = 1;
        let basketId2 = 2;
        let basketId3 = 3;

        await basket.connect(owner).mint(owner.address, uri);
        await basket.connect(owner).mint(owner.address, uri);
        await basket.connect(owner).mint(owner.address, uri);
        await basket.connect(owner).mint(owner.address, uri);

        await time.increase(OPEN_COOL_DOWN_S + 1);

        await basket.connect(owner).close(basketId0);
        await basket.connect(owner).close(basketId1);
        await basket.connect(owner).close(basketId2);
        await basket.connect(owner).close(basketId3);

        const expectedBaksetsOf0 = [
            basketId0,
            basketId1,
            basketId2,
            basketId3
        ];
        const basketsOf0 = await basket.basketsOf(owner.address);
        expect(basketsOf0).to.deep.equal(expectedBaksetsOf0);

        await basket.connect(owner).burn(basketId1);
        const basketsOf1 = (await basket.basketsOf(owner.address)).map(v => v.toNumber())
        const expectedBaksetsOf1 = [
            basketId0,
            basketId3,
            basketId2
        ];
        expect(basketsOf1).to.deep.equal(expectedBaksetsOf1);

        await basket.connect(owner).burn(basketId0);
        const basketsOf2 = (await basket.basketsOf(owner.address)).map(v => v.toNumber())
        const expectedBaksetsOf2 = [
            basketId2,
            basketId3
        ];

        expect(basketsOf2).to.deep.equal(expectedBaksetsOf2);

        await basket.connect(owner).burn(basketId2);
        const basketsOf3 = (await basket.basketsOf(owner.address)).map(v => v.toNumber())
        const expectedBaksetsOf3 = [
            basketId3
        ];

        expect(basketsOf3).to.deep.equal(expectedBaksetsOf3);

        await basket.connect(owner).burn(basketId3);
        const basketsOf4 = (await basket.basketsOf(owner.address)).map(v => v.toNumber())
        const expectedBaksetsOf4: any = [];

        expect(basketsOf4).to.deep.equal(expectedBaksetsOf4);
    });

});
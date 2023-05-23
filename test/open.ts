import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BASKET_STATE, REVERT_MESSAGES, OPEN_COOL_DOWN_S, basketFixture } from "./utils";
const { testUtils } = require('hardhat');
const { time } = testUtils;

describe("Open", function () {

    it("can't open non-existent basket", async () => {
        const { owner, basket } = await loadFixture(basketFixture);
        let basketId = 0;

        expect(await basket.balanceOf(owner.address)).to.equal(0);

        await expect(basket.connect(owner).close(basketId))
            .to.be.revertedWith(REVERT_MESSAGES.ERC721_INVALID_TOKEN_ID);
    });

    it("can only open if basket was closed", async () => {
        const { owner, basket } = await loadFixture(basketFixture);
        const uri = 'uri';
        let basketId = 0;

        await basket.connect(owner).mint(owner.address, uri);
        expect(await basket.balanceOf(owner.address)).to.equal(1);
        expect(await basket.ownerOf(basketId)).to.equal(owner.address);
        expect(await basket.stateOf(basketId)).to.equal(BASKET_STATE.OPEN);

        await expect(basket.connect(owner).open(basketId))
            .to.be.revertedWith(REVERT_MESSAGES.BASKET_NOT_CLOSED);
    });
    it("only owner can open basket", async () => {
        const { owner, receiver, basket } = await loadFixture(basketFixture);
        const uri = 'uri';
        let basketId = 0;

        await basket.connect(owner).mint(owner.address, uri);
        expect(await basket.balanceOf(owner.address)).to.equal(1);
        expect(await basket.ownerOf(basketId)).to.equal(owner.address);
        expect(await basket.stateOf(basketId)).to.equal(BASKET_STATE.OPEN);

        await time.increase(OPEN_COOL_DOWN_S + 1);
        await basket.connect(owner).close(basketId);

        expect(await basket.stateOf(basketId)).to.equal(BASKET_STATE.CLOSED);

        await expect(basket.connect(receiver).close(basketId))
            .to.be.revertedWith(REVERT_MESSAGES.BASKET_NOT_OWNER);
    });

});
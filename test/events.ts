import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import {
    BASKET_STATE,
    OPEN_COOL_DOWN_S,
    basketFixture,
} from "./utils";
const { testUtils } = require('hardhat');
const { time } = testUtils;

describe("Events", function () {
    it("Mint event emmited", async () => {
        const { deployer, owner, basket } = await loadFixture(basketFixture);
        const uri = 'uri';
        let basketId = 0;

        await expect(basket.connect(deployer).mint(owner.address, uri))
            .to.emit(basket, 'Mint')
            .withArgs(basketId, owner.address, uri);
    });
    it("Open event emmited", async () => {
        const { deployer, owner, basket } = await loadFixture(basketFixture);
        const uri = 'uri';
        let basketId = 0;

        await basket.connect(deployer).mint(owner.address, uri);
        await time.increase(OPEN_COOL_DOWN_S + 1);

        await basket.connect(owner).close(basketId);

        await expect(basket.connect(owner).open(basketId))
            .to.emit(basket, 'Open')
            .withArgs(basketId, owner.address);
    });
    it("Add event emmited", async () => {
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

        await expect(basket.connect(owner).add(basketId, erc721.address, tokenId))
            .to.emit(basket, 'Add')
            .withArgs(basketId, erc721.address, tokenId, owner.address);
    });

    it("Received event emmited", async () => {
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

        await expect(basket.connect(owner).add(basketId, erc721.address, tokenId))
            .to.emit(basket, 'Received')
            .withArgs(basket.address, owner.address, tokenId);
    });

    it("Remove event emmited", async () => {
        const { deployer, owner, basket, erc721 } = await loadFixture(basketFixture);
        const uri = 'uri';
        const basketId = 0;
        const tokenId = 0;

        await basket.connect(deployer).mint(owner.address, uri);
        await erc721.connect(deployer).safeMint(owner.address, tokenId);
        await erc721.connect(owner).setApprovalForAll(basket.address, true);
        await basket.connect(owner).add(basketId, erc721.address, tokenId);
        await expect(basket.connect(owner).remove(basketId, erc721.address, tokenId))
            .to.emit(basket, 'Remove')
            .withArgs(basketId, erc721.address, tokenId, owner.address);
    });

    it("Close event emmited", async () => {
        const { deployer, owner, basket } = await loadFixture(basketFixture);
        const uri = 'uri';
        const basketId = 0;

        await basket.connect(deployer).mint(owner.address, uri);
        await time.increase(OPEN_COOL_DOWN_S + 1);
        expect(await basket.connect(owner).close(basketId))
            .to.emit(basket, 'Close')
            .withArgs(basketId, owner.address);
    });
    it("Burn event emmited", async () => {
        const { deployer, owner, basket } = await loadFixture(basketFixture);
        const uri = 'uri';
        const basketId = 0;

        await basket.connect(deployer).mint(owner.address, uri);
        await time.increase(OPEN_COOL_DOWN_S + 1);
        await basket.connect(owner).close(basketId);
        expect(await basket.connect(owner).burn(basketId))
            .to.emit(basket, 'Burn')
            .withArgs(basketId, owner.address);
    });

    it("Transfer event emmited", async () => {
        const { deployer, receiver, owner, basket } = await loadFixture(basketFixture);
        const uri = 'uri';
        const basketId = 0;

        await basket.connect(deployer).mint(owner.address, uri);
        await time.increase(OPEN_COOL_DOWN_S + 1);
        await basket.connect(owner).close(basketId);
        expect(await basket.connect(owner).transferFrom(owner.address, receiver.address, basketId))
            .to.emit(basket, 'Transfer')
            .withArgs(owner.address, receiver.address, basketId);
    });

    it("Approval event emmited", async () => {
        const { deployer, receiver, owner, basket } = await loadFixture(basketFixture);
        const uri = 'uri';
        const basketId = 0;

        await basket.connect(deployer).mint(owner.address, uri);
        await time.increase(OPEN_COOL_DOWN_S + 1);
        await basket.connect(owner).close(basketId);
        expect(await basket.connect(owner).approve(receiver.address, basketId))
            .to.emit(basket, 'Approval')
            .withArgs(owner.address, receiver.address, basketId);
    });
    it("ApprovalForAll event emmited", async () => {
        const { deployer, receiver, owner, basket } = await loadFixture(basketFixture);
        const uri = 'uri';
        const basketId = 0;

        await basket.connect(deployer).mint(owner.address, uri);
        await time.increase(OPEN_COOL_DOWN_S + 1);
        await basket.connect(owner).close(basketId);
        expect(await basket.connect(owner).setApprovalForAll(receiver.address, true))
            .to.emit(basket, 'ApprovalForAll')
            .withArgs(owner.address, receiver.address, true);
    });
});
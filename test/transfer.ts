import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import {
    BASKET_STATE,
    REVERT_MESSAGES,
    OPEN_COOL_DOWN_S,
    basketFixture,
    ZERO_ADDRESS,
    cleanToken,
    TX_RECEIPT_STATUS
} from "./utils";
import { ethers } from "hardhat";
const { testUtils } = require('hardhat');
const { time, block } = testUtils;

describe("Transfer", function () {
    it("can't transfer non-existent basket", async () => {
        const { owner, basket } = await loadFixture(basketFixture);
        let basketId = 0;

        expect(await basket.balanceOf(owner.address)).to.equal(0);

        await expect(basket.connect(owner)["safeTransferFrom(address,address,uint256)"](owner.address, owner.address, basketId))
            .to.be.revertedWith(REVERT_MESSAGES.ERC721_INVALID_TOKEN_ID);

        await expect(basket.connect(owner)["safeTransferFrom(address,address,uint256,bytes)"](owner.address, owner.address, basketId, '0x'))
            .to.be.revertedWith(REVERT_MESSAGES.ERC721_INVALID_TOKEN_ID);
    });

    it("can't transfer if basket is not closed", async () => {
        const { owner, basket } = await loadFixture(basketFixture);
        let basketId = 0;
        let uri = 'uri';

        await basket.connect(owner).mint(owner.address, uri);
        expect(await basket.balanceOf(owner.address)).to.equal(1);

        expect(await basket.stateOf(basketId)).to.equal(BASKET_STATE.OPEN);

        await expect(basket.connect(owner)["safeTransferFrom(address,address,uint256)"](owner.address, owner.address, basketId))
            .to.be.revertedWith(REVERT_MESSAGES.BASKET_NOT_ALL_CLOSED);

        await expect(basket.connect(owner)["safeTransferFrom(address,address,uint256,bytes)"](owner.address, owner.address, basketId, '0x'))
            .to.be.revertedWith(REVERT_MESSAGES.BASKET_NOT_ALL_CLOSED);
    });

    it("can't transfer if basket is not owned by owner", async () => {
        const { owner, receiver, basket } = await loadFixture(basketFixture);
        let basketId = 0;
        let uri = 'uri';

        await basket.connect(owner).mint(owner.address, uri);
        expect(await basket.balanceOf(owner.address)).to.equal(1);

        await time.increase(OPEN_COOL_DOWN_S + 1);
        await basket.connect(owner).close(basketId);

        expect(await basket.stateOf(basketId)).to.equal(BASKET_STATE.CLOSED);

        await expect(basket.connect(receiver).transferFrom(owner.address, receiver.address, basketId))
            .to.be.revertedWith(REVERT_MESSAGES.ERC721_NOT_OWNER_OR_APPROVED);
    });

    it("can't transfer more than 1 basket owned by owner if not all are closed", async () => {
        const { owner, receiver, basket } = await loadFixture(basketFixture);
        let basketId0 = 0;
        let basketId1 = 1;
        let uri = 'uri';

        await basket.connect(owner).mint(owner.address, uri);
        await basket.connect(owner).mint(owner.address, uri);
        await time.increase(OPEN_COOL_DOWN_S + 1);
        expect(await basket.balanceOf(owner.address)).to.equal(2);

        expect(await basket.stateOf(basketId0)).to.equal(BASKET_STATE.OPEN);
        expect(await basket.stateOf(basketId1)).to.equal(BASKET_STATE.OPEN);

        await expect(basket.connect(owner)["safeTransferFrom(address,address,uint256)"](owner.address, receiver.address, basketId0))
            .to.be.revertedWith(REVERT_MESSAGES.BASKET_NOT_ALL_CLOSED);
        await expect(basket.connect(owner)["safeTransferFrom(address,address,uint256,bytes)"](owner.address, receiver.address, basketId0, '0x'))
            .to.be.revertedWith(REVERT_MESSAGES.BASKET_NOT_ALL_CLOSED);

        await basket.connect(owner).close(basketId0);
        expect(await basket.stateOf(basketId0)).to.equal(BASKET_STATE.CLOSED);

        await expect(basket.connect(owner)["safeTransferFrom(address,address,uint256)"](owner.address, receiver.address, basketId0))
            .to.be.revertedWith(REVERT_MESSAGES.BASKET_NOT_ALL_CLOSED);
        await expect(basket.connect(owner)["safeTransferFrom(address,address,uint256,bytes)"](owner.address, receiver.address, basketId0, '0x'))
            .to.be.revertedWith(REVERT_MESSAGES.BASKET_NOT_ALL_CLOSED);

        await basket.connect(owner).close(basketId1);
        expect(await basket.stateOf(basketId0)).to.equal(BASKET_STATE.CLOSED);
        expect(await basket.stateOf(basketId1)).to.equal(BASKET_STATE.CLOSED);

        await basket.connect(owner)["safeTransferFrom(address,address,uint256)"](owner.address, receiver.address, basketId0)
        await basket.connect(owner)["safeTransferFrom(address,address,uint256,bytes)"](owner.address, receiver.address, basketId1, '0x')

        expect(await basket.ownerOf(basketId0)).to.equal(receiver.address);
        expect(await basket.ownerOf(basketId1)).to.equal(receiver.address);

        expect(await basket.balanceOf(owner.address)).to.equal(0);
        expect(await basket.balanceOf(receiver.address)).to.equal(2);

        expect(await basket.stateOf(basketId0)).to.equal(BASKET_STATE.CLOSED);
        expect(await basket.stateOf(basketId1)).to.equal(BASKET_STATE.CLOSED);
    });

    it("can't approve if all baskets owned by owner are not closed", async () => {
        const { owner, receiver, basket } = await loadFixture(basketFixture);
        let basketId0 = 0;
        let basketId1 = 1;
        let uri = 'uri';

        await basket.connect(owner).mint(owner.address, uri);
        await basket.connect(owner).mint(owner.address, uri);
        await time.increase(OPEN_COOL_DOWN_S + 1);
        expect(await basket.balanceOf(owner.address)).to.equal(2);

        expect(await basket.stateOf(basketId0)).to.equal(BASKET_STATE.OPEN);
        expect(await basket.stateOf(basketId1)).to.equal(BASKET_STATE.OPEN);

        await expect(basket.connect(owner).approve(receiver.address, basketId0))
            .to.be.revertedWith(REVERT_MESSAGES.BASKET_NOT_ALL_CLOSED);

        await basket.connect(owner).close(basketId0);
        expect(await basket.stateOf(basketId0)).to.equal(BASKET_STATE.CLOSED);

        await expect(basket.connect(owner).approve(receiver.address, basketId0))
            .to.be.revertedWith(REVERT_MESSAGES.BASKET_NOT_ALL_CLOSED);

        await basket.connect(owner).close(basketId1);
        expect(await basket.stateOf(basketId0)).to.equal(BASKET_STATE.CLOSED);
        expect(await basket.stateOf(basketId1)).to.equal(BASKET_STATE.CLOSED);

        await basket.connect(owner).approve(receiver.address, basketId0);
        expect(await basket.getApproved(basketId0)).to.equal(receiver.address);
    });

    it("can transfer if approved for single token", async () => {
        const { owner, receiver, basket } = await loadFixture(basketFixture);
        let basketId0 = 0;
        let basketId1 = 1;
        let uri = 'uri';

        await basket.connect(owner).mint(owner.address, uri);
        await basket.connect(owner).mint(owner.address, uri);
        await time.increase(OPEN_COOL_DOWN_S + 1);
        expect(await basket.balanceOf(owner.address)).to.equal(2);
        await basket.connect(owner).close(basketId0);
        await basket.connect(owner).close(basketId1);

        await basket.connect(owner).approve(receiver.address, basketId0);

        await basket.connect(receiver)["safeTransferFrom(address,address,uint256)"](owner.address, receiver.address, basketId0)
        await expect(basket.connect(receiver)["safeTransferFrom(address,address,uint256,bytes)"](owner.address, receiver.address, basketId1, '0x')).to.be.revertedWith(REVERT_MESSAGES.ERC721_NOT_OWNER_OR_APPROVED);

        expect(await basket.ownerOf(basketId0)).to.equal(receiver.address);
        expect(await basket.ownerOf(basketId1)).to.equal(owner.address);

        expect(await basket.balanceOf(owner.address)).to.equal(1);
        expect(await basket.balanceOf(receiver.address)).to.equal(1);
    });


    it("can't setApprovalForAll if all baskets are not closed", async () => {
        const { owner, receiver, basket } = await loadFixture(basketFixture);
        let basketId0 = 0;
        let basketId1 = 1;
        let uri = 'uri';

        await basket.connect(owner).mint(owner.address, uri);
        await basket.connect(owner).mint(owner.address, uri);
        await time.increase(OPEN_COOL_DOWN_S + 1);
        expect(await basket.balanceOf(owner.address)).to.equal(2);

        expect(await basket.stateOf(basketId0)).to.equal(BASKET_STATE.OPEN);
        expect(await basket.stateOf(basketId1)).to.equal(BASKET_STATE.OPEN);

        await expect(basket.connect(owner).setApprovalForAll(receiver.address, true))
            .to.be.revertedWith(REVERT_MESSAGES.BASKET_NOT_ALL_CLOSED);

        await basket.connect(owner).close(basketId0);
        expect(await basket.stateOf(basketId0)).to.equal(BASKET_STATE.CLOSED);

        await expect(basket.connect(owner).setApprovalForAll(receiver.address, true))
            .to.be.revertedWith(REVERT_MESSAGES.BASKET_NOT_ALL_CLOSED);

        await basket.connect(owner).close(basketId1);
        expect(await basket.stateOf(basketId0)).to.equal(BASKET_STATE.CLOSED);
        expect(await basket.stateOf(basketId1)).to.equal(BASKET_STATE.CLOSED);

        await basket.connect(owner).setApprovalForAll(receiver.address, true);
        expect(await basket.isApprovedForAll(owner.address, receiver.address)).to.equal(true);

    });

    it("can transfer if approved for all", async () => {
        const { owner, receiver, basket } = await loadFixture(basketFixture);
        let basketId0 = 0;
        let basketId1 = 1;
        let uri = 'uri';

        await basket.connect(owner).mint(owner.address, uri);
        await basket.connect(owner).mint(owner.address, uri);
        await time.increase(OPEN_COOL_DOWN_S + 1);
        expect(await basket.balanceOf(owner.address)).to.equal(2);
        await basket.connect(owner).close(basketId0);
        await basket.connect(owner).close(basketId1);

        await basket.connect(owner).setApprovalForAll(receiver.address, true);

        await basket.connect(receiver)["safeTransferFrom(address,address,uint256)"](owner.address, receiver.address, basketId0)
        await basket.connect(receiver)["safeTransferFrom(address,address,uint256,bytes)"](owner.address, receiver.address, basketId1, '0x')

        expect(await basket.ownerOf(basketId0)).to.equal(receiver.address);
        expect(await basket.ownerOf(basketId1)).to.equal(receiver.address);

        expect(await basket.balanceOf(owner.address)).to.equal(0);
        expect(await basket.balanceOf(receiver.address)).to.equal(2);
    });

    it("getApprove is ZERO_ADDRESS if basket is open", async () => {
        const { owner, receiver, basket } = await loadFixture(basketFixture);
        let basketId0 = 0;
        let uri = 'uri';

        await basket.connect(owner).mint(owner.address, uri);
        await time.increase(OPEN_COOL_DOWN_S + 1);
        expect(await basket.balanceOf(owner.address)).to.equal(1);
        await basket.connect(owner).close(basketId0);

        expect(await basket.getApproved(basketId0)).to.equal(ZERO_ADDRESS);

        await basket.connect(owner).approve(receiver.address, basketId0);
        expect(await basket.getApproved(basketId0)).to.equal(receiver.address);

        await basket.connect(owner).open(basketId0);
        await time.increase(OPEN_COOL_DOWN_S + 1);
        expect(await basket.getApproved(basketId0)).to.equal(ZERO_ADDRESS);
    });
    it("isApprovedForAll is false if all baskets not closed", async () => {
        const { owner, receiver, basket } = await loadFixture(basketFixture);
        let basketId0 = 0;
        let uri = 'uri';

        await basket.connect(owner).mint(owner.address, uri);
        await time.increase(OPEN_COOL_DOWN_S + 1);
        expect(await basket.balanceOf(owner.address)).to.equal(1);
        await basket.connect(owner).close(basketId0);

        expect(await basket.isApprovedForAll(owner.address, receiver.address)).to.equal(false);

        await basket.connect(owner).setApprovalForAll(receiver.address, true);
        expect(await basket.isApprovedForAll(owner.address, receiver.address)).to.equal(true);

        await basket.connect(owner).open(basketId0);
        await time.increase(OPEN_COOL_DOWN_S + 1);
        expect(await basket.isApprovedForAll(owner.address, receiver.address)).to.equal(false);
    });

    it("basket owner updated correctly after transfer", async () => {
        const { owner, receiver, basket } = await loadFixture(basketFixture);
        let basketId0 = 0;
        let uri = 'uri';

        await basket.connect(owner).mint(owner.address, uri);
        await time.increase(OPEN_COOL_DOWN_S + 1);
        expect(await basket.balanceOf(owner.address)).to.equal(1);
        await basket.connect(owner).close(basketId0);

        expect(await basket.ownerOf(basketId0)).to.equal(owner.address);

        await basket.connect(owner).approve(receiver.address, basketId0);
        await basket.connect(receiver)["safeTransferFrom(address,address,uint256)"](owner.address, receiver.address, basketId0)

        expect(await basket.ownerOf(basketId0)).to.equal(receiver.address);
    });

    it("can't open and remove tokens and close from a basket in the same block as transfer", async () => {
        const { owner, receiver, deployer, basket, erc721 } = await loadFixture(basketFixture);
        let basketId0 = 0;
        let uri = 'uri';
        let token0 = 0;
        let token1 = 1;
        let token2 = 2;

        await basket.connect(owner).mint(owner.address, uri);
        await time.increase(OPEN_COOL_DOWN_S + 1);
        expect(await basket.balanceOf(owner.address)).to.equal(1);

        // mint 3 tokens to be added to basket
        await erc721.connect(deployer).safeMint(owner.address, token0);
        await erc721.connect(deployer).safeMint(owner.address, token1);
        await erc721.connect(deployer).safeMint(owner.address, token2);

        await erc721.connect(owner).setApprovalForAll(basket.address, true);

        // add tokens to basket
        await basket.connect(owner).add(basketId0, erc721.address, token0);
        await basket.connect(owner).add(basketId0, erc721.address, token1);
        await basket.connect(owner).add(basketId0, erc721.address, token2);

        // close basket
        await basket.connect(owner).close(basketId0);
        await time.increase(OPEN_COOL_DOWN_S + 1);

        // check number of tokens in basket
        expect(await basket.balanceOf(owner.address)).to.equal(1);
        expect(await basket.balanceOf(receiver.address)).to.equal(0);
        const tokensBefore = (await basket.tokensIn(basketId0)).map((t: any) => cleanToken(t));
        expect(tokensBefore).to.have.lengthOf(3);

        await block.setAutomine(false);
        // transfer basket, but open, remove and close tokens in the same block
        const txOpen = await basket.connect(owner).open(basketId0);
        const txRemove = await basket.connect(owner).remove(basketId0, erc721.address, token0);
        const txClose = await basket.connect(owner).close(basketId0);
        const txTransfer = await basket.connect(owner)["safeTransferFrom(address,address,uint256)"](owner.address, receiver.address, basketId0);

        // mine 1 block
        await block.advance(1);

        // activate automine
        await block.setAutomine(true);

        // confirm all transactions were mined in the same block
        expect(txTransfer.blockNumber).to.be.eq(txOpen.blockNumber);
        expect(txOpen.blockNumber).to.be.eq(txRemove.blockNumber);
        expect(txRemove.blockNumber).to.be.eq(txClose.blockNumber);

        const receiptTransfer = await ethers.provider.getTransactionReceipt(txTransfer.hash);
        const receiptOpen = await ethers.provider.getTransactionReceipt(txOpen.hash);
        const receiptRemove = await ethers.provider.getTransactionReceipt(txRemove.hash);
        const receiptClose = await ethers.provider.getTransactionReceipt(txClose.hash);

        expect(receiptOpen.status).to.be.eq(TX_RECEIPT_STATUS.SUCCESS);
        expect(receiptRemove.status).to.be.eq(TX_RECEIPT_STATUS.SUCCESS);
        expect(receiptClose.status).to.be.eq(TX_RECEIPT_STATUS.FAILURE); // Can't close as cooldown not passed
        expect(receiptTransfer.status).to.be.eq(TX_RECEIPT_STATUS.FAILURE); // As a result of not being able to close, can't transfer


        expect(await basket.balanceOf(owner.address)).to.equal(1);
        expect(await basket.balanceOf(receiver.address)).to.equal(0);
        const tokensAfter = (await basket.tokensIn(basketId0)).map((t: any) => cleanToken(t));
        expect(tokensAfter).to.have.lengthOf(2);

    });

    it("can't open, transfer and remove tokens from a basket in the same block as", async () => {
        const { owner, receiver, deployer, basket, erc721 } = await loadFixture(basketFixture);
        let basketId0 = 0;
        let uri = 'uri';
        let token0 = 0;
        let token1 = 1;
        let token2 = 2;

        await basket.connect(owner).mint(owner.address, uri);
        await time.increase(OPEN_COOL_DOWN_S + 1);
        expect(await basket.balanceOf(owner.address)).to.equal(1);

        // mint 3 tokens to be added to basket
        await erc721.connect(deployer).safeMint(owner.address, token0);
        await erc721.connect(deployer).safeMint(owner.address, token1);
        await erc721.connect(deployer).safeMint(owner.address, token2);

        await erc721.connect(owner).setApprovalForAll(basket.address, true);

        // add tokens to basket
        await basket.connect(owner).add(basketId0, erc721.address, token0);
        await basket.connect(owner).add(basketId0, erc721.address, token1);
        await basket.connect(owner).add(basketId0, erc721.address, token2);

        // close basket
        await basket.connect(owner).close(basketId0);
        await time.increase(OPEN_COOL_DOWN_S + 1);

        // check number of tokens in basket
        expect(await basket.balanceOf(owner.address)).to.equal(1);
        expect(await basket.balanceOf(receiver.address)).to.equal(0);
        const tokensBefore = (await basket.tokensIn(basketId0)).map((t: any) => cleanToken(t));
        expect(tokensBefore).to.have.lengthOf(3);

        await block.setAutomine(false);
        // transfer basket, but open, remove and close tokens in the same block
        const txOpen = await basket.connect(owner).open(basketId0);
        const txTransfer = await basket.connect(owner)["safeTransferFrom(address,address,uint256)"](owner.address, receiver.address, basketId0);
        const txRemove = await basket.connect(owner).remove(basketId0, erc721.address, token0);
        const txClose = await basket.connect(owner).close(basketId0);

        // mine 1 block
        await block.advance(1);

        // activate automine
        await block.setAutomine(true);

        // confirm all transactions were mined in the same block
        expect(txTransfer.blockNumber).to.be.eq(txOpen.blockNumber);
        expect(txOpen.blockNumber).to.be.eq(txRemove.blockNumber);
        expect(txRemove.blockNumber).to.be.eq(txClose.blockNumber);

        const receiptTransfer = await ethers.provider.getTransactionReceipt(txTransfer.hash);
        const receiptOpen = await ethers.provider.getTransactionReceipt(txOpen.hash);
        const receiptRemove = await ethers.provider.getTransactionReceipt(txRemove.hash);
        const receiptClose = await ethers.provider.getTransactionReceipt(txClose.hash);

        expect(receiptOpen.status).to.be.eq(TX_RECEIPT_STATUS.SUCCESS);
        expect(receiptTransfer.status).to.be.eq(TX_RECEIPT_STATUS.FAILURE);
        expect(receiptRemove.status).to.be.eq(TX_RECEIPT_STATUS.SUCCESS);
        expect(receiptClose.status).to.be.eq(TX_RECEIPT_STATUS.FAILURE);


        expect(await basket.balanceOf(owner.address)).to.equal(1);
        expect(await basket.balanceOf(receiver.address)).to.equal(0);
        const tokensAfter = (await basket.tokensIn(basketId0)).map((t: any) => cleanToken(t));
        expect(tokensAfter).to.have.lengthOf(2);

    });
});
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { cleanToken, BASKET_STATE, basketFixture, INTERFACE_IDS, OPEN_COOL_DOWN_S } from "./utils";
const { testUtils } = require('hardhat');
const { time } = testUtils;
describe("Golden Path", function () {
    it("Able to deploy Basket", async function () {
        const { basket } = await loadFixture(basketFixture);
        expect(basket.address).to.be.properAddress;
    });

    it("Able to deploy ERC721", async function () {
        const { erc721 } = await loadFixture(basketFixture);
        expect(erc721.address).to.be.properAddress;
    });

    it("Basket support IBasket's interfaceId", async function () {
        const { basket } = await loadFixture(basketFixture);
        expect(await basket.supportsInterface(INTERFACE_IDS.IBasket)).to.be.true;
    });

    it("Basket support IERC721's interfaceId", async function () {
        const { basket } = await loadFixture(basketFixture);
        expect(await basket.supportsInterface(INTERFACE_IDS.IERC721)).to.be.true;
    });

    it("Basket support IERC721Receiver's interfaceId", async function () {
        const { basket } = await loadFixture(basketFixture);
        expect(await basket.supportsInterface(INTERFACE_IDS.IERC721Receiver)).to.be.true;
    });

    it("Basket support IERC165's interfaceId", async function () {
        const { basket } = await loadFixture(basketFixture);
        expect(await basket.supportsInterface(INTERFACE_IDS.IERC165)).to.be.true;
    });

    it("Basket support IERC721Metadata's interfaceId", async function () {
        const { basket } = await loadFixture(basketFixture);
        expect(await basket.supportsInterface(INTERFACE_IDS.IERC721Metadata)).to.be.true;
    });

    it("Can complete the full life cyle of a basket", async function () {
        // Deploy Basket and ERC721
        const { deployer, owner, receiver, basket, erc721 } = await loadFixture(basketFixture);

        // Mint 3 ERC721
        await erc721.connect(deployer).safeMint(owner.address, 1);
        await erc721.connect(deployer).safeMint(owner.address, 2);
        await erc721.connect(deployer).safeMint(owner.address, 3);

        // Check ERC721 ownership before adding to basket
        expect(await erc721.connect(owner).ownerOf(1)).to.be.equal(owner.address);
        expect(await erc721.connect(owner).ownerOf(2)).to.be.equal(owner.address);
        expect(await erc721.connect(owner).ownerOf(3)).to.be.equal(owner.address);

        // Approve Basket to transfer ERC721
        await erc721.connect(owner).setApprovalForAll(basket.address, true);

        // Create basket for owner 
        await basket.connect(owner).mint(owner.address, 'uri');

        // Check basket is in open state
        expect(await basket.connect(owner).stateOf(owner.address)).to.be.equal(BASKET_STATE.OPEN);

        // Get basket id
        const basketIds = await basket.connect(owner).basketsOf(owner.address);
        const basketId = basketIds[0];

        expect(basketId).to.be.equal(0);

        // check 721 side of basket
        expect(await basket.connect(owner).ownerOf(basketId)).to.be.equal(owner.address);

        // Add 3 ERC721 to basket
        await basket.connect(owner).add(basketId, erc721.address, 1);
        await basket.connect(owner).add(basketId, erc721.address, 2);
        await basket.connect(owner).add(basketId, erc721.address, 3);

        // Check basket contents
        const tokens = (await basket.connect(owner).tokensIn(basketId)).map(cleanToken);
        expect(tokens).to.be.deep.equal([
            { erc721: erc721.address, tokenId: 1, listPtr: 0 },
            { erc721: erc721.address, tokenId: 2, listPtr: 1 },
            { erc721: erc721.address, tokenId: 3, listPtr: 2 },
        ]);

        // Check ERC721 ownership after adding to basket
        expect(await erc721.connect(owner).ownerOf(1)).to.be.equal(basket.address);
        expect(await erc721.connect(owner).ownerOf(2)).to.be.equal(basket.address);
        expect(await erc721.connect(owner).ownerOf(3)).to.be.equal(basket.address);

        // Remove token 2 from basket
        await basket.connect(owner).remove(basketId, erc721.address, 2);

        // Check basket contents
        const tokens2 = (await basket.connect(owner).tokensIn(basketId)).map(cleanToken);
        expect(tokens2).to.be.deep.equal([
            { erc721: erc721.address, tokenId: 1, listPtr: 0 },
            { erc721: erc721.address, tokenId: 3, listPtr: 1 },
        ]);

        // Check ERC721 ownership after removing from basket
        expect(await erc721.connect(owner).ownerOf(1)).to.be.equal(basket.address);
        expect(await erc721.connect(owner).ownerOf(2)).to.be.equal(owner.address);
        expect(await erc721.connect(owner).ownerOf(3)).to.be.equal(basket.address);

        // Try to send basket to receiver
        await expect(basket.connect(owner).transferFrom(owner.address, receiver.address, basketId)).to.be.revertedWith("Basket: not all closed");

        await time.increase(OPEN_COOL_DOWN_S + 1)
        // Close basket
        await basket.connect(owner).close(basketId);

        // Check basket is in closed state
        expect(await basket.connect(owner).stateOf(basketId)).to.be.equal(BASKET_STATE.CLOSED);

        // Try to add token to closed basket
        await expect(basket.connect(owner).add(basketId, erc721.address, 2)).to.be.revertedWith("Basket: is not open");

        // Send basket to receiver
        await basket.connect(owner).transferFrom(owner.address, receiver.address, basketId);

        // Check owner of basket from 721 side
        expect(await basket.connect(receiver).ownerOf(basketId)).to.be.equal(receiver.address);
        // and basket side
        expect(await basket.connect(receiver).basketsOf(receiver.address)).to.be.deep.equal([basketId]);

        // Check ERC721 ownership after sending basket
        expect(await erc721.connect(receiver).ownerOf(1)).to.be.equal(basket.address);
        expect(await erc721.connect(receiver).ownerOf(2)).to.be.equal(owner.address);
        expect(await erc721.connect(receiver).ownerOf(3)).to.be.equal(basket.address);

        // try open basket as owner
        await expect(basket.connect(owner).open(basketId)).to.be.revertedWith("Basket: not owner");

        // Open basket as receiver
        await basket.connect(receiver).open(basketId);

        // Check basket is in open state
        expect(await basket.connect(receiver).stateOf(basketId)).to.be.equal(BASKET_STATE.OPEN);

        // remove token 3 from basket
        await basket.connect(receiver).remove(basketId, erc721.address, 3);

        // Check basket contents
        const tokens3 = (await basket.connect(receiver).tokensIn(basketId)).map(cleanToken);
        expect(tokens3).to.be.deep.equal([
            { erc721: erc721.address, tokenId: 1, listPtr: 0 },
        ]);

        // Check ERC721 ownership after removing from basket
        expect(await erc721.connect(receiver).ownerOf(1)).to.be.equal(basket.address);
        expect(await erc721.connect(receiver).ownerOf(2)).to.be.equal(owner.address);
        expect(await erc721.connect(receiver).ownerOf(3)).to.be.equal(receiver.address);

        // try to burn basket as receiver
        await expect(basket.connect(receiver).burn(basketId)).to.be.revertedWith("Basket: not closed");

        await time.increase(OPEN_COOL_DOWN_S + 1)
        // close basket
        await basket.connect(receiver).close(basketId);

        // Check basket is in closed state
        expect(await basket.connect(receiver).stateOf(basketId)).to.be.equal(BASKET_STATE.CLOSED);

        // try to burn with a token still in basket
        await expect(basket.connect(receiver).burn(basketId)).to.be.revertedWith("Basket: not empty");

        // remove token 1 from basket
        await basket.connect(receiver).open(basketId);
        await basket.connect(receiver).remove(basketId, erc721.address, 1);
        await time.increase(OPEN_COOL_DOWN_S + 1)
        await basket.connect(receiver).close(basketId);

        // Check basket contents
        const tokens4 = (await basket.connect(receiver).tokensIn(basketId)).map(cleanToken);
        expect(tokens4).to.be.deep.equal([]);

        // Check ERC721 ownership after removing from basket
        expect(await erc721.connect(receiver).ownerOf(1)).to.be.equal(receiver.address);
        expect(await erc721.connect(receiver).ownerOf(2)).to.be.equal(owner.address);
        expect(await erc721.connect(receiver).ownerOf(3)).to.be.equal(receiver.address);

        // burn basket
        await basket.connect(receiver).burn(basketId);

        // Check basket is in burned state
        expect(await basket.connect(receiver).stateOf(basketId)).to.be.equal(BASKET_STATE.BURNED);

        // Check if basket still exists
        await expect(basket.connect(receiver).ownerOf(basketId)).to.be.revertedWith("ERC721: invalid token ID");

    });
});

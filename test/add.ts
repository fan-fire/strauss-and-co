import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import {AddressZero} from "@ethersproject/constants";
import { expect } from "chai";
import { BASKET_STATE, INTERFACE_IDS, REVERT_MESSAGES, basketFixture } from "./utils";

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

        await expect(basket.connect(owner).add(basketId, AddressZero, 0)).to.be.revertedWith(REVERT_MESSAGES.BASKET_ERC721_0_OR_THIS);
    });

    it("can't add erc721 if it is the basket", async () => {
        const { deployer, owner, basket } = await loadFixture(basketFixture);
        const uri = 'uri';
        const basketId = 0;


        await basket.connect(deployer).mint(owner.address, uri);

        await expect(basket.connect(owner).add(basketId, basket.address, 0)).to.be.revertedWith(REVERT_MESSAGES.BASKET_ERC721_0_OR_THIS);
    });

    it("can't if erc721 does not support IERC721", async () => {
        const { deployer, owner, basket, not721 } = await loadFixture(basketFixture);

        const uri = 'uri';
        const basketId = 0;

        await basket.connect(deployer).mint(owner.address, uri);
        await not721.connect(deployer).safeMint(owner.address, 0);

        expect(await not721.supportsInterface(INTERFACE_IDS.IERC721)).to.be.false;

        await not721.connect(owner).setApprovalForAll(basket.address, true);

        await expect(basket.connect(owner).add(basketId, not721.address, 0)).to.be.revertedWith(REVERT_MESSAGES.BASKET_ERC721_NOT_IERC721);
    });


    it("can't add to non-existant basket", async () => {
        const { deployer, owner, basket, erc721 } = await loadFixture(basketFixture);
        const uri = 'uri';
        const basketId = 0;

        await basket.connect(deployer).mint(owner.address, uri);
        await erc721.connect(deployer).safeMint(owner.address, 0);
        await erc721.connect(owner).setApprovalForAll(basket.address, true);

        await expect(basket.connect(owner).add(basketId + 1, erc721.address, 0)).to.be.revertedWith(REVERT_MESSAGES.BASKET_DOES_NOT_EXIST);
    });
    it("can't add if basket is not open", async () => {
    });
    it("owner of basket can add 1 token to basket", async () => {
    });
    it("non owner of basket can add 1 token to basket", async () => {
    });
    it("tokens updated correctly when 3 different erc721's are added to 1 basket", async () => {
    });
    it("basket is the owner of NFT after adding", async () => {
    });
    it("can add 1000 tokens ", async () => {
    });
    it("isTokenInVault works when added", async () => {
    });

});
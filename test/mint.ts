import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BASE_TOKEN_URI, BASKET_STATE, CONTRACT_URI, basketFixture } from "./utils";

describe("Mint", function () {
    it("can mint a new basket by any wallet", async () => {
        const { deployer, owner, basket } = await loadFixture(basketFixture);
        const uri = 'uri';
        let basketId;
        let baskets;
        let tokens;

        // Deployer can mint a basket
        basketId = 0;
        await basket.connect(deployer).mint(owner.address, uri);
        expect(await basket.balanceOf(owner.address)).to.equal(1);
        expect(await basket.ownerOf(basketId)).to.equal(owner.address);

        baskets = await basket.basketsOf(owner.address);
        expect(baskets.length).to.equal(1);
        expect(baskets[0]).to.equal(basketId);

        tokens = await basket.tokensIn(basketId);
        expect(tokens.length).to.equal(0);


        // Owner can mint a basket
        basketId = 1;
        await basket.connect(owner).mint(owner.address, uri);
        expect(await basket.balanceOf(owner.address)).to.equal(2);
        expect(await basket.ownerOf(basketId)).to.equal(owner.address);

        baskets = await basket.basketsOf(owner.address);
        expect(baskets.length).to.equal(2);
        expect(baskets[1]).to.equal(basketId);

        tokens = await basket.tokensIn(basketId);
        expect(tokens.length).to.equal(0);

        // Receiver can mint a basket
        basketId = 2;
        await basket.connect(owner).mint(owner.address, uri);
        expect(await basket.balanceOf(owner.address)).to.equal(3);
        expect(await basket.ownerOf(basketId)).to.equal(owner.address);


        baskets = await basket.basketsOf(owner.address);
        expect(baskets.length).to.equal(3);
        expect(baskets[2]).to.equal(basketId);

        tokens = await basket.tokensIn(basketId);
        expect(tokens.length).to.equal(0);
    });

    it("sets the tokenURI correctly", async () => {
        const { deployer, owner, basket } = await loadFixture(basketFixture);

        const uri = 'uri';
        const basketId = 0;
        const expectedUri = `${BASE_TOKEN_URI}${uri}`;

        await basket.connect(deployer).mint(owner.address, uri);
        expect(await basket.tokenURI(basketId)).to.equal(expectedUri);
    });

    it("sets baseTokenURI correctly", async () => {
        const { basket } = await loadFixture(basketFixture);
        expect(await basket.baseTokenURI()).to.equal(BASE_TOKEN_URI);
    });

    it("set contractURI correctly", async () => {
        const { basket } = await loadFixture(basketFixture);
        expect(await basket.contractURI()).to.equal(CONTRACT_URI);
    });


    it("mint basket sent to _to", async () => {
        const { deployer, owner, basket } = await loadFixture(basketFixture);

        const uri = 'uri';
        const basketId = 0;
        const to = owner.address;

        await basket.connect(deployer).mint(to, uri);
        expect(await basket.ownerOf(basketId)).to.equal(to);

        const baskets = await basket.basketsOf(to);
        expect(baskets.length).to.equal(1);
        expect(baskets[0]).to.equal(basketId);

        const balance = await basket.balanceOf(to);
        expect(balance).to.equal(1);

    });
    it("basket is OPEN state after creation", async () => {
        const { deployer, owner, basket } = await loadFixture(basketFixture);

        const uri = 'uri';
        const basketId = 0;

        await basket.connect(deployer).mint(owner.address, uri);
        const state = await basket.stateOf(basketId);
        expect(state).to.equal(BASKET_STATE.OPEN);

    });
    it("baskets update correctly", async () => {
        const { deployer, owner, basket } = await loadFixture(basketFixture);

        const uri = 'uri';
        const basketId = 0;

        await basket.connect(deployer).mint(owner.address, uri);
        const baskets = await basket.basketsOf(owner.address);
        expect(baskets.length).to.equal(1);
        expect(baskets[0]).to.equal(basketId);

        await basket.connect(deployer).mint(owner.address, uri);
        const baskets2 = await basket.basketsOf(owner.address);
        expect(baskets2.length).to.equal(2);
        expect(baskets2[0]).to.equal(basketId);
    });
    it("curBasketId updated correctly", async () => {
        const { deployer, owner, basket } = await loadFixture(basketFixture);
        const uri = 'uri';

        await basket.connect(deployer).mint(owner.address, uri);
        const curBasketId = await basket.curBasketId();
        expect(curBasketId).to.equal(1);

        await basket.connect(deployer).mint(owner.address, uri);
        const curBasketId2 = await basket.curBasketId();
        expect(curBasketId2).to.equal(2);
    });
});
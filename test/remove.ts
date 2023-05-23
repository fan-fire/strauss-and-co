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
const { time } = testUtils;

describe("Remove", function () {
    it("can't remove on non-existant basket", async () => {
        const { owner, basket } = await loadFixture(basketFixture);
        let basketId = 0;
        let erc721Address = ZERO_ADDRESS;
        let tokenId = 0;

        expect(await basket.balanceOf(owner.address)).to.equal(0);

        await expect(basket.connect(owner).remove(basketId, erc721Address, tokenId))
            .to.be.revertedWith(REVERT_MESSAGES.ERC721_INVALID_TOKEN_ID);
    });

    it("can't remove from an empty basket", async () => {
        const { owner, basket, erc721 } = await loadFixture(basketFixture);
        let basketId = 0;
        let uri = 'uri';
        let erc721Address = erc721.address;
        let tokenId = 0;


        await basket.connect(owner).mint(owner.address, uri);
        expect(await basket.balanceOf(owner.address)).to.equal(1);
        await expect(basket.connect(owner).remove(basketId, erc721Address, tokenId))
            .to.be.revertedWith(REVERT_MESSAGES.BASKET_EMPTY);
    });

    it("can't remove a token that is not in the basket", async () => {
        const { owner, deployer, basket, erc721 } = await loadFixture(basketFixture);
        let basketId = 0;
        let uri = 'uri';
        let erc721Address = erc721.address;
        let tokenId0 = 0;
        let tokenId1 = 1;

        await basket.connect(owner).mint(owner.address, uri);
        await erc721.connect(deployer).safeMint(owner.address, tokenId0);
        await erc721.connect(deployer).safeMint(owner.address, tokenId1);
        await erc721.connect(owner).setApprovalForAll(basket.address, true);
        await basket.connect(owner).add(basketId, erc721Address, tokenId0);
        expect(await basket.balanceOf(owner.address)).to.equal(1);
        expect(await basket.tokensIn(basketId)).to.have.lengthOf(1);

        await expect(basket.connect(owner).remove(basketId, erc721Address, tokenId1))
            .to.be.revertedWith(REVERT_MESSAGES.BASKET_TOKEN_NOT_IN_BASKET);

    });

    it("only basket owner can remove tokens from basket", async () => {
        const { owner, receiver, deployer, basket, erc721 } = await loadFixture(basketFixture);
        let basketId = 0;
        let uri = 'uri';
        let erc721Address = erc721.address;
        let tokenId = 0;

        await basket.connect(owner).mint(owner.address, uri);
        await erc721.connect(deployer).safeMint(owner.address, tokenId);
        await erc721.connect(owner).setApprovalForAll(basket.address, true);
        await basket.connect(owner).add(basketId, erc721Address, tokenId);
        expect(await basket.tokensIn(basketId)).to.have.lengthOf(1);

        await expect(basket.connect(receiver).remove(basketId, erc721Address, tokenId))
            .to.be.revertedWith(REVERT_MESSAGES.BASKET_NOT_OWNER);

        expect(await basket.tokensIn(basketId)).to.have.lengthOf(1);

        await basket.connect(owner).remove(basketId, erc721Address, tokenId);

        expect(await basket.tokensIn(basketId)).to.have.lengthOf(0);
    });

    it("can't remove from basket if basket is not open", async () => {
        const { owner, receiver, deployer, basket, erc721 } = await loadFixture(basketFixture);
        let basketId = 0;
        let uri = 'uri';
        let erc721Address = erc721.address;
        let tokenId = 0;

        await basket.connect(owner).mint(owner.address, uri);
        await time.increase(OPEN_COOL_DOWN_S + 1);
        await erc721.connect(deployer).safeMint(owner.address, tokenId);
        await erc721.connect(owner).setApprovalForAll(basket.address, true);
        await basket.connect(owner).add(basketId, erc721Address, tokenId);
        expect(await basket.tokensIn(basketId)).to.have.lengthOf(1);

        await basket.connect(owner).close(basketId);
        expect(await basket.stateOf(basketId)).to.equal(BASKET_STATE.CLOSED);

        await expect(basket.connect(owner).remove(basketId, erc721Address, tokenId))
            .to.be.revertedWith(REVERT_MESSAGES.BASKET_NOT_OPEN);

        expect(await basket.tokensIn(basketId)).to.have.lengthOf(1);
    });
    it("Can't remove same token twice", async () => {
        const { owner, receiver, deployer, basket, erc721 } = await loadFixture(basketFixture);
        let basketId = 0;
        let uri = 'uri';
        let erc721Address = erc721.address;
        let tokenId0 = 0;
        let tokenId1 = 1;

        await basket.connect(owner).mint(owner.address, uri);
        await time.increase(OPEN_COOL_DOWN_S + 1);
        await erc721.connect(deployer).safeMint(owner.address, tokenId0);
        await erc721.connect(deployer).safeMint(owner.address, tokenId1);
        await erc721.connect(owner).setApprovalForAll(basket.address, true);
        await basket.connect(owner).add(basketId, erc721Address, tokenId0);
        await basket.connect(owner).add(basketId, erc721Address, tokenId1);
        expect(await basket.tokensIn(basketId)).to.have.lengthOf(2);

        await basket.connect(owner).remove(basketId, erc721Address, tokenId0);
        expect(await basket.tokensIn(basketId)).to.have.lengthOf(1);

        await expect(basket.connect(owner).remove(basketId, erc721Address, tokenId0))
            .to.be.revertedWith(REVERT_MESSAGES.BASKET_TOKEN_NOT_IN_BASKET);

        expect(await basket.tokensIn(basketId)).to.have.lengthOf(1);
    });
    it("NFT is transferred to basket owner when removed", async () => {
        const { owner, receiver, deployer, basket, erc721 } = await loadFixture(basketFixture);
        let basketId = 0;
        let uri = 'uri';
        let erc721Address = erc721.address;
        let tokenId = 0;

        await basket.connect(owner).mint(owner.address, uri);
        await time.increase(OPEN_COOL_DOWN_S + 1);
        await erc721.connect(deployer).safeMint(owner.address, tokenId);
        expect(await erc721.ownerOf(tokenId)).to.equal(owner.address);
        await erc721.connect(owner).setApprovalForAll(basket.address, true);
        await basket.connect(owner).add(basketId, erc721Address, tokenId);
        expect(await erc721.ownerOf(tokenId)).to.equal(basket.address);
        await basket.connect(owner).close(basketId);
        await basket.connect(owner)["safeTransferFrom(address,address,uint256)"](owner.address, receiver.address, basketId);

        await basket.connect(receiver).open(basketId);
        await basket.connect(receiver).remove(basketId, erc721Address, tokenId);
        expect(await basket.tokensIn(basketId)).to.have.lengthOf(0);

        expect(await erc721.ownerOf(tokenId)).to.equal(receiver.address);

    });
    it("pops last token in the tokensIn correctly", async () => {
        const { owner, receiver, deployer, basket, erc721 } = await loadFixture(basketFixture);
        let basketId = 0;
        let uri = 'uri';
        let erc721Address = erc721.address;
        let tokenId0 = 0;
        let tokenId1 = 1;
        let tokenId2 = 2;
        let tokenId3 = 3;

        await basket.connect(owner).mint(owner.address, uri);
        await time.increase(OPEN_COOL_DOWN_S + 1);
        await erc721.connect(deployer).safeMint(owner.address, tokenId0);
        await erc721.connect(deployer).safeMint(owner.address, tokenId1);
        await erc721.connect(deployer).safeMint(owner.address, tokenId2);
        await erc721.connect(deployer).safeMint(owner.address, tokenId3);
        await erc721.connect(owner).setApprovalForAll(basket.address, true);
        await basket.connect(owner).add(basketId, erc721Address, tokenId0);
        await basket.connect(owner).add(basketId, erc721Address, tokenId1);
        await basket.connect(owner).add(basketId, erc721Address, tokenId2);
        await basket.connect(owner).add(basketId, erc721Address, tokenId3);
        expect(await basket.tokensIn(basketId)).to.have.lengthOf(4);

        await basket.connect(owner).close(basketId);
        await basket.connect(owner)["safeTransferFrom(address,address,uint256)"](owner.address, receiver.address, basketId);

        await basket.connect(receiver).open(basketId);
        const tokensInBasket0 = (await basket.tokensIn(basketId)).map(cleanToken);
        const expectedTokensInBasket0 = [
            {
                erc721: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
                tokenId: 0,
                listPtr: 0
            },
            {
                erc721: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
                tokenId: 1,
                listPtr: 1
            },
            {
                erc721: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
                tokenId: 2,
                listPtr: 2
            },
            {
                erc721: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
                tokenId: 3,
                listPtr: 3
            }
        ]
        expect(tokensInBasket0).to.deep.equal(expectedTokensInBasket0);

        await basket.connect(receiver).remove(basketId, erc721Address, tokenId1);
        const tokensInBasket1 = (await basket.tokensIn(basketId)).map(cleanToken);

        const expectedTokensInBasket1 = [
            {
                erc721: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
                tokenId: 0,
                listPtr: 0
            },

            {
                erc721: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
                tokenId: 3,
                listPtr: 1
            },
            {
                erc721: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
                tokenId: 2,
                listPtr: 2
            },
        ]

        expect(tokensInBasket1).to.deep.equal(expectedTokensInBasket1);

        await basket.connect(receiver).remove(basketId, erc721Address, tokenId0);

        const tokensInBasket2 = (await basket.tokensIn(basketId)).map(cleanToken);
        const expectedTokensInBasket2 = [
            {
                erc721: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
                tokenId: 2,
                listPtr: 0
            },
            {
                erc721: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
                tokenId: 3,
                listPtr: 1
            },
        ]


        expect(tokensInBasket2).to.deep.equal(expectedTokensInBasket2);

        await basket.connect(receiver).remove(basketId, erc721Address, tokenId2);
        const tokensInBasket3 = (await basket.tokensIn(basketId)).map(cleanToken);
        const expectedTokensInBasket3 = [
            {
                erc721: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
                tokenId: 3,
                listPtr: 0
            },
        ]

        expect(tokensInBasket3).to.deep.equal(expectedTokensInBasket3);

        await basket.connect(receiver).remove(basketId, erc721Address, tokenId3);
        const tokensInBasket4 = (await basket.tokensIn(basketId)).map(cleanToken);
        const expectedTokensInBasket4: any = []

        expect(tokensInBasket4).to.deep.equal(expectedTokensInBasket4);
    });

    it("listPtr updates correctly for when removed, added, then removed", async () => {
        const { owner, receiver, deployer, basket, erc721 } = await loadFixture(basketFixture);
        let basketId = 0;
        let uri = 'uri';
        let erc721Address = erc721.address;
        let tokenId0 = 0;
        let tokenId1 = 1;
        let tokenId2 = 2;
        let tokenId3 = 3;

        await basket.connect(owner).mint(owner.address, uri);
        await time.increase(OPEN_COOL_DOWN_S + 1);
        await erc721.connect(deployer).safeMint(owner.address, tokenId0);
        await erc721.connect(deployer).safeMint(owner.address, tokenId1);
        await erc721.connect(deployer).safeMint(owner.address, tokenId2);
        await erc721.connect(deployer).safeMint(owner.address, tokenId3);
        await erc721.connect(owner).setApprovalForAll(basket.address, true);
        await basket.connect(owner).add(basketId, erc721Address, tokenId0);
        await basket.connect(owner).add(basketId, erc721Address, tokenId1);
        await basket.connect(owner).add(basketId, erc721Address, tokenId2);
        await basket.connect(owner).add(basketId, erc721Address, tokenId3);
        expect(await basket.tokensIn(basketId)).to.have.lengthOf(4);

        await basket.connect(owner).close(basketId);
        await basket.connect(owner)["safeTransferFrom(address,address,uint256)"](owner.address, receiver.address, basketId);

        await basket.connect(receiver).open(basketId);
        const tokensInBasket0 = (await basket.tokensIn(basketId)).map(cleanToken);
        const expectedTokensInBasket0 = [
            {
                erc721: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
                tokenId: 0,
                listPtr: 0
            },
            {
                erc721: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
                tokenId: 1,
                listPtr: 1
            },
            {
                erc721: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
                tokenId: 2,
                listPtr: 2
            },
            {
                erc721: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
                tokenId: 3,
                listPtr: 3
            }
        ]

        expect(tokensInBasket0).to.deep.equal(expectedTokensInBasket0);

        await basket.connect(receiver).remove(basketId, erc721Address, tokenId1);

        const tokensInBasket1 = (await basket.tokensIn(basketId)).map(cleanToken);

        const expectedTokensInBasket1 = [
            {
                erc721: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
                tokenId: 0,
                listPtr: 0
            },

            {
                erc721: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
                tokenId: 3,
                listPtr: 1
            },
            {
                erc721: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
                tokenId: 2,
                listPtr: 2
            },
        ]

        expect(tokensInBasket1).to.deep.equal(expectedTokensInBasket1);

        await erc721.connect(receiver).setApprovalForAll(basket.address, true);
        await basket.connect(receiver).add(basketId, erc721Address, tokenId1);

        const expectedTokensInBasket2 = [
            {
                erc721: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
                tokenId: 0,
                listPtr: 0
            },

            {
                erc721: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
                tokenId: 3,
                listPtr: 1
            },
            {
                erc721: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
                tokenId: 2,
                listPtr: 2
            },
            {
                erc721: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
                tokenId: 1,
                listPtr: 3
            },
        ]

        const tokensInBasket2 = (await basket.tokensIn(basketId)).map(cleanToken);

        expect(tokensInBasket2).to.deep.equal(expectedTokensInBasket2);
    });

    it("tokensIn and removes works with different erc721 addresses", async () => {
        const { owner, deployer, basket, erc721 } = await loadFixture(basketFixture);
        const Test721 = await ethers.getContractFactory("Test721");
        const erc721_1 = await Test721.deploy();
        let basketId = 0;
        let uri = 'uri';
        let erc721Address = erc721.address;
        let erc721_1Address = erc721_1.address;
        let tokenId0 = 0;
        let tokenId1 = 1;

        await basket.connect(owner).mint(owner.address, uri);
        await time.increase(OPEN_COOL_DOWN_S + 1);

        await erc721.connect(deployer).safeMint(owner.address, tokenId0);
        await erc721.connect(deployer).safeMint(owner.address, tokenId1);
        await erc721_1.connect(deployer).safeMint(owner.address, tokenId0);
        await erc721_1.connect(deployer).safeMint(owner.address, tokenId1);

        expect(await erc721.ownerOf(tokenId0)).to.equal(owner.address);
        expect(await erc721.ownerOf(tokenId1)).to.equal(owner.address);
        expect(await erc721_1.ownerOf(tokenId0)).to.equal(owner.address);
        expect(await erc721_1.ownerOf(tokenId1)).to.equal(owner.address);

        await erc721.connect(owner).setApprovalForAll(basket.address, true);
        await erc721_1.connect(owner).setApprovalForAll(basket.address, true);

        await basket.connect(owner).add(basketId, erc721Address, tokenId0);
        await basket.connect(owner).add(basketId, erc721Address, tokenId1);
        await basket.connect(owner).add(basketId, erc721_1Address, tokenId0);
        await basket.connect(owner).add(basketId, erc721_1Address, tokenId1);

        expect(await basket.tokensIn(basketId)).to.have.lengthOf(4);

        const tokens = (await basket.tokensIn(basketId)).map(cleanToken);

        const expectedTokens = [
            {
                erc721: erc721.address,
                tokenId: 0,
                listPtr: 0
            },
            {
                erc721: erc721.address,
                tokenId: 1,
                listPtr: 1
            },
            {
                erc721: erc721_1.address,
                tokenId: 0,
                listPtr: 2
            },
            {
                erc721: erc721_1.address,
                tokenId: 1,
                listPtr: 3
            }
        ]

        expect(tokens).to.deep.equal(expectedTokens);


    });

    it("tokens updated correctly when all 10 tokens are removed in non-linear fashion", async () => {
        const { owner, deployer, basket, erc721 } = await loadFixture(basketFixture);
        let basketId = 0;
        let uri = 'uri';
        let erc721Address = erc721.address;
        let tokenId0 = 0;
        let tokenId1 = 1;
        let tokenId2 = 2;
        let tokenId3 = 3;
        let tokenId4 = 4;
        let tokenId5 = 5;
        let tokenId6 = 6;
        let tokenId7 = 7;
        let tokenId8 = 8;
        let tokenId9 = 9;

        await basket.connect(owner).mint(owner.address, uri);
        await time.increase(OPEN_COOL_DOWN_S + 1);

        await erc721.connect(deployer).safeMint(owner.address, tokenId0);
        await erc721.connect(deployer).safeMint(owner.address, tokenId1);
        await erc721.connect(deployer).safeMint(owner.address, tokenId2);
        await erc721.connect(deployer).safeMint(owner.address, tokenId3);
        await erc721.connect(deployer).safeMint(owner.address, tokenId4);
        await erc721.connect(deployer).safeMint(owner.address, tokenId5);
        await erc721.connect(deployer).safeMint(owner.address, tokenId6);
        await erc721.connect(deployer).safeMint(owner.address, tokenId7);
        await erc721.connect(deployer).safeMint(owner.address, tokenId8);
        await erc721.connect(deployer).safeMint(owner.address, tokenId9);

        expect(await erc721.ownerOf(tokenId0)).to.equal(owner.address);
        expect(await erc721.ownerOf(tokenId1)).to.equal(owner.address);
        expect(await erc721.ownerOf(tokenId2)).to.equal(owner.address);
        expect(await erc721.ownerOf(tokenId3)).to.equal(owner.address);
        expect(await erc721.ownerOf(tokenId4)).to.equal(owner.address);
        expect(await erc721.ownerOf(tokenId5)).to.equal(owner.address);
        expect(await erc721.ownerOf(tokenId6)).to.equal(owner.address);
        expect(await erc721.ownerOf(tokenId7)).to.equal(owner.address);
        expect(await erc721.ownerOf(tokenId8)).to.equal(owner.address);

        await erc721.connect(owner).setApprovalForAll(basket.address, true);

        await basket.connect(owner).add(basketId, erc721Address, tokenId0);
        await basket.connect(owner).add(basketId, erc721Address, tokenId1);
        await basket.connect(owner).add(basketId, erc721Address, tokenId2);
        await basket.connect(owner).add(basketId, erc721Address, tokenId3);
        await basket.connect(owner).add(basketId, erc721Address, tokenId4);
        await basket.connect(owner).add(basketId, erc721Address, tokenId5);
        await basket.connect(owner).add(basketId, erc721Address, tokenId6);
        await basket.connect(owner).add(basketId, erc721Address, tokenId7);
        await basket.connect(owner).add(basketId, erc721Address, tokenId8);
        await basket.connect(owner).add(basketId, erc721Address, tokenId9);

        expect(await basket.tokensIn(basketId)).to.have.lengthOf(10);

        const tokens = (await basket.tokensIn(basketId)).map(cleanToken);

        const expectedTokens = [
            {
                erc721: erc721.address,
                tokenId: 0,
                listPtr: 0
            },
            {
                erc721: erc721.address,
                tokenId: 1,
                listPtr: 1
            },
            {
                erc721: erc721.address,
                tokenId: 2,
                listPtr: 2
            },
            {
                erc721: erc721.address,
                tokenId: 3,
                listPtr: 3
            },
            {
                erc721: erc721.address,
                tokenId: 4,
                listPtr: 4
            },
            {
                erc721: erc721.address,
                tokenId: 5,
                listPtr: 5
            },
            {
                erc721: erc721.address,
                tokenId: 6,
                listPtr: 6
            },
            {
                erc721: erc721.address,
                tokenId: 7,
                listPtr: 7
            },
            {
                erc721: erc721.address,
                tokenId: 8,
                listPtr: 8
            },
            {
                erc721: erc721.address,
                tokenId: 9,
                listPtr: 9
            },
        ]

        expect(tokens).to.deep.equal(expectedTokens);

        await basket.connect(owner).close(basketId);
        await basket.connect(owner)["safeTransferFrom(address,address,uint256)"](owner.address, owner.address, basketId);

        await basket.connect(owner).open(basketId);

        await basket.connect(owner).remove(basketId, erc721Address, tokenId1);
        await basket.connect(owner).remove(basketId, erc721Address, tokenId3);
        await basket.connect(owner).remove(basketId, erc721Address, tokenId5);
        await basket.connect(owner).remove(basketId, erc721Address, tokenId7);
        await basket.connect(owner).remove(basketId, erc721Address, tokenId9);


        const expectedTokens2 = [
            {
                erc721: erc721.address,
                tokenId: 0,
                listPtr: 0
            },
            {
                erc721: erc721.address,
                tokenId: 6,
                listPtr: 1
            },
            {
                erc721: erc721.address,
                tokenId: 2,
                listPtr: 2
            },
            {
                erc721: erc721.address,
                tokenId: 8,
                listPtr: 3
            },
            {
                erc721: erc721.address,
                tokenId: 4,
                listPtr: 4
            },
        ]


        expect(await basket.tokensIn(basketId)).to.have.lengthOf(5);
        const tokens2 = (await basket.tokensIn(basketId)).map(cleanToken);
        expect(tokens2).to.deep.equal(expectedTokens2);


    });

});
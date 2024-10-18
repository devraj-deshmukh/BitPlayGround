const GameToken = artifacts.require("GameToken");
const truffleAssert = require('truffle-assertions');
contract("GameToken", accounts => {
    let gameToken;
    const [owner, addr1, addr2] = accounts;

    beforeEach(async () => {
        gameToken = await GameToken.new("GameToken", "GTK", 10000);
    });

    describe("Deployment", () => {
        it("Should set the correct owner", async () => {
            const tokenOwner = await gameToken.owner();
            assert.equal(tokenOwner, owner, "The owner is not set correctly");
        });

        it("Should mint the initial supply to the owner", async () => {
            const ownerBalance = await gameToken.balanceOf(owner);
            assert.equal(ownerBalance.toString(), web3.utils.toWei("10000", "ether"), "Initial supply is not minted to the owner");
        });
    });

    describe("Transactions", () => {
        it("Should allow user to burn tokens when playing the game", async () => {
            // Transfer tokens to addr1
            await gameToken.transfer(addr1, web3.utils.toWei("100", "ether"));
            let addr1Balance = await gameToken.balanceOf(addr1);
            assert.equal(addr1Balance.toString(), web3.utils.toWei("100", "ether"), "Address 1 should have 100 tokens");

            // Addr1 plays the game by burning tokens
            await gameToken.playGame(web3.utils.toWei("10", "ether"), { from: addr1 });

            addr1Balance = await gameToken.balanceOf(addr1);
            assert.equal(addr1Balance.toString(), web3.utils.toWei("90", "ether"), "Remaining balance should be 90 tokens");
        });

        it("Should not allow user to play the game without sufficient balance", async () => {
            await truffleAssert.reverts(
                gameToken.playGame(web3.utils.toWei("10", "ether"), { from: addr1 }),
                "Insufficient balance to play."
            );
        });

        it("Should allow the owner to reward a player", async () => {
            // Transfer tokens to addr1
            await gameToken.transfer(addr1, web3.utils.toWei("100", "ether"));
            await gameToken.playGame(web3.utils.toWei("10", "ether"), { from: addr1 });

            // Reward addr1 with 20 tokens
            await gameToken.rewardPlayer(addr1, web3.utils.toWei("20", "ether"), { from: owner });

            const addr1Balance = await gameToken.balanceOf(addr1);
            assert.equal(addr1Balance.toString(), web3.utils.toWei("110", "ether"), "Addr1 should have 110 tokens after reward");
        });

        it("Should allow the owner to mint new tokens", async () => {
            await gameToken.rewardPlayer(owner, web3.utils.toWei("50", "ether"), { from: owner });
            const ownerBalance = await gameToken.balanceOf(owner);
            assert.equal(ownerBalance.toString(), web3.utils.toWei("10050", "ether"), "Owner balance should be 10050 tokens after minting");
        });

        it("Should not allow non-owners to mint new tokens", async () => {
            await truffleAssert.reverts(
                gameToken.rewardPlayer(addr2, web3.utils.toWei("20", "ether"), { from: addr1 }),
                "revert"
            );            
        });
    });
});

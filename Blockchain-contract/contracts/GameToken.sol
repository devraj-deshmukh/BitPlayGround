// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GameToken is ERC20, Ownable {

    // Constructor to initialize token details
    constructor(string memory name, string memory symbol, uint256 initialSupply) 
        ERC20(name, symbol)  Ownable(msg.sender)
    {
        _mint(msg.sender, initialSupply * 10 ** decimals()); // Mint initial supply for the contract owner
    }

    // Function for players to pay to play the game
    function playGame(uint256 amount) external {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance to play.");
        _burn(msg.sender, amount); // Burn tokens to simulate the payment
    }

    // Function to reward players after they finish the game
    function rewardPlayer(address player, uint256 rewardAmount) external {
        require(player != address(0), "Invalid player address"); // Ensure valid address
        require(rewardAmount > 0, "Reward amount must be greater than 0"); // Ensure reward is positive

        // Mint tokens to the owner's address
        _mint(owner(), rewardAmount); // Mint tokens to the owner

        // Transfer the minted tokens to the player's address
        _transfer(owner(), player, rewardAmount); // Transfer tokens from owner to player
    }
    // Function for the contract owner to mint additional tokens
    function mintTokens(uint256 amount) external onlyOwner {
        require(amount > 0, "Mint amount must be greater than 0");

        _mint(owner(), amount); // Mint new tokens to the owner's address
    }

    // Function for the contract owner to transfer tokens to another address
    function transferTokens(address recipient, uint256 amount) external onlyOwner {
        require(recipient != address(0), "Invalid recipient address");
        require(amount > 0, "Transfer amount must be greater than 0");
        require(balanceOf(owner()) >= amount, "Insufficient balance to transfer");

        _transfer(owner(), recipient, amount); // Transfer tokens from owner to recipient
    }
}

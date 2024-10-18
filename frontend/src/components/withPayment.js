import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Paywall from './Paywall';
import { ethers } from 'ethers';
import contractABI from './GameToken.json';
const { abi } = contractABI;

const CONTRACT_ADDRESS = '0xb639c1db7B627811bF70A8dE52Eba7EFea65f137';

const withPayment = (WrappedComponent, redirectPath) => {
  return (props) => {
    const [hasPaid, setHasPaid] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Function to handle blockchain payment
    const handlePayment = async () => {
      setLoading(true);

      try {
        // Check if MetaMask is installed
        if (!window.ethereum) {
          alert("MetaMask is not installed!");
          setLoading(false);
          return;
        }

        // Get the wallet address from localStorage
        const walletAddress = localStorage.getItem('walletAddress');
        if (!walletAddress) {
          alert("No wallet address found. Please connect your wallet first.");
          setLoading(false);
          return;
        }

        // Create a provider instance and get the signer
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        // Request account access
        await provider.send('eth_requestAccounts', []);

        // Get the signer (the user's wallet)
        const signer = provider.getSigner();

        // Create a contract instance with the signer
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

        // Fetch the user's token balance (not ETH balance)
        const userTokenBalance = await contract.balanceOf(walletAddress);
        console.log("User's token balance:", ethers.utils.formatUnits(userTokenBalance, 18)); // To display as full tokens

        // Amount to pay (e.g., 10 tokens)
        const amountToPay = ethers.utils.parseUnits("10", 18); // Adjust as needed

        if (userTokenBalance.lt(amountToPay)) {
          alert("Insufficient token balance to play the game.");
          setLoading(false);
          return;
        }

        // APPROVE contract to spend tokens on behalf of the user (required for ERC-20 tokens)
        const approveTx = await contract.approve(CONTRACT_ADDRESS, amountToPay);
        await approveTx.wait();

        // Call the playGame function on the contract (this will deduct tokens)
        const playGameTx = await contract.playGame(amountToPay);
        await playGameTx.wait();

        // Payment successful, allow access to the game
        setHasPaid(true);
        navigate(redirectPath); // Redirect to the game after payment
      } catch (error) {
        console.error("Error making payment:", error);
        alert("Payment failed. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const handleGameOver = async (playerScore, multiplier,status) => {
      setHasPaid(false);
      if (playerScore === 0){return;}
      // Reward the player using smart contract
      try {
        // Create a provider instance and get the signer
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        // Request account access
        await provider.send('eth_requestAccounts', []);

        // Get the signer (the user's wallet)
        const signer = provider.getSigner();

        // Create a contract instance with the signer
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
        
        const reward = calculateReward(playerScore, multiplier);
        const rewardAmount = ethers.utils.parseUnits(reward.toString(), 18);
        const approveTx = await contract.approve(CONTRACT_ADDRESS, rewardAmount);
        await approveTx.wait();
        const tx = await contract.rewardPlayer(signer.getAddress(), rewardAmount);
        await tx.wait();
        console.log('Player rewarded with:', rewardAmount);
        if (status === "close"){
          window.location.href = "/";
        }
      } catch (error) {
        console.error('Error rewarding player:', error);
      }
    };

    const calculateReward = (score, multiplier) => {
      return score * multiplier; // Adjust this logic based on your reward structure
    };

    return (
      <div style={{ position: 'relative' }}>
        {hasPaid ? (
          <WrappedComponent {...props} onGameOver={handleGameOver} />
        ) : (
          <Paywall onPayment={handlePayment} loading={loading} />
        )}
      </div>
    );
  };
};

export default withPayment;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import { ethers } from 'ethers';
import contractABI from './GameToken.json';
const { abi } = contractABI;


const CONTRACT_ADDRESS = '0xb639c1db7B627811bF70A8dE52Eba7EFea65f137';
function Profile() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [account, setAccount] = useState(''); // For storing the user account address
  const [balance, setBalance] = useState(0); // For storing wallet balance
  const [balanceUpdated, setBalanceUpdated] = useState(false); // To track if balance was updated
  const [showNotification, setShowNotification] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);
  const handleLogout = () => {
    // Clear the wallet address from localStorage
    localStorage.removeItem('walletAddress');
    navigate('/login'); // Navigate to login page on logout
  };
  const test = async () => {
    const rewardAmount = ethers.utils.parseUnits("10", 18);
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        // Request account access
        await provider.send('eth_requestAccounts', []);

        // Get the signer (the user's wallet)
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
        const owner = '0xe3357f0614a4dA36B62Dd0ad91919A16bB4E3284'; //owner address
       // const playerAddress = "0x63f789A9fA4F0b51235286Ad1c7aeB3014c3e725"; // Replace with the player's address
        const rewardAmount = ethers.utils.parseUnits("10", 18); 
        const prin = await signer.getAddress();
       // console.log("aaaaaaaaaaaaaaa",prin);
        const tx = await contract.rewardPlayer(owner, rewardAmount);
        console.log("Transaction sent:", tx);
        // Wait for the transaction to be mined
        const receipt = await tx.wait();
        console.log("Transaction mined:", receipt);
      //  await contract.transfer(playerAddress, rewardAmount);
        console.log('Simulation successful');
    } catch (error) {
        console.error('Simulation failed:', error);
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      const walletAddress = localStorage.getItem('walletAddress');

      if (walletAddress) {
        // If the user is logged in, fetch account and balance
        setAccount(walletAddress); // Set account from localStorage

        if (typeof window.ethereum !== 'undefined') {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          try {
            // Fetch wallet balance
            // Get the signer (the user's wallet)
            const signer = provider.getSigner();

            // Create a contract instance with the signer
            const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
            const userBalance =  await contract.balanceOf(walletAddress);
            setBalance(ethers.utils.formatUnits(userBalance, 18)); // Set balance
            console.log(balance);
            // Listen for Transfer events related to the user's address
          contract.on('Transfer', (from, to, value, event) => {
            if (to === walletAddress || from === walletAddress) {
              // Fetch the updated balance when a transfer happens
              updateBalance(contract, walletAddress);
              if (to.toLowerCase() === walletAddress.toLowerCase()) {
                setRewardAmount(ethers.utils.formatUnits(value, 18));
                setShowNotification(true);
                setTimeout(() => {
                  setShowNotification(false);
                }, 3000);
              }    
              
            }
          });
          // have to implemet the update currency function when changed
          } catch (error) {
            console.error('Error fetching balance:', error);
          }
        } else {
          console.error("MetaMask is not available.");
        }
      }
    };

    const updateBalance = async (contract, walletAddress) => {
      try {
        const userBalance = await contract.balanceOf(walletAddress);
        
        setBalance(ethers.utils.formatUnits(userBalance, 18)); // Update balance
        setBalanceUpdated(true);
      setTimeout(() => {
        setBalanceUpdated(false); // Remove the color change after 2 seconds
      }, 2000);
      } catch (error) {
        console.error('Error updating balance:', error);
      }
    };

    fetchProfileData();

    // Cleanup on unmount
    return () => {
      setAccount('');
      setBalance(0);
    };
  }, [navigate]);

  const toggleDropdown = () => setIsOpen(!isOpen);
 

  
  return (
    <div className="profile">
      {account ? (
        <>
          {/* If user is logged in, show profile details */}
          <div className="profile-header" onClick={toggleDropdown}>
            <img src="assets/catto.png" alt="User Logo" className="profile-logo" />
            <span className={`profile-balance ${balanceUpdated ? 'balance-updated' : ''}`}>
              {balance} YUG
              </span> {/* Display wallet balance with color change */}
          </div>
          {isOpen && (
            <div className="profile-dropdown">
              <p>User Details</p>
              <p>Wallet Address: {account}</p> {/* Display wallet address */}
              <p>Wallet Balance: {balance} YUG</p> {/* Display wallet balance */}
              <p onClick={handleLogout}>Logout</p> {/* Call handleLogout on click */}
              <p onClick={test}>Test</p>
            </div>
          )}
          {/* Notification Box for rewards */}
          {showNotification && (
            <div className="notification-box">
              🎉 You have received {rewardAmount} YUG tokens as a reward!
            </div>
          )}
        </>
      ) : (
        <>
          {/* If user is not logged in, show Login button */}
          <div className="login-container">
            <button className="login-button" onClick={() => navigate('/login')}>Login</button>
          </div>
        </>
      )}
    </div>
  );
}

export default Profile;

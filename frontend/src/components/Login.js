// src/components/Login.js
import React, { useState, useEffect } from 'react';
import './login.css';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [account, setAccount] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      try {
        // Request MetaMask account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const signer = await provider.getSigner();
        const userAccount = await signer.getAddress();
        setAccount(userAccount);
        
        // Store the account in localStorage
        localStorage.setItem('walletAddress', userAccount);

        // Navigate to profile page after login
        navigate('/');
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      }
    } else {
      console.error('MetaMask not found');
    }
  };

  return (
    <div className="login-page">
      <h1>Login to BitPlayGround</h1>
      <button className="login-button" onClick={handleLogin}>
        Connect with MetaMask
      </button>
    </div>
  );
}

export default Login;

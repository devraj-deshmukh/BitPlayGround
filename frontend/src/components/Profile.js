import React, { useEffect, useState } from 'react';
import './Profile.css'; // Make sure to have the necessary CSS for styling

function Profile() {
  const [isOpen, setIsOpen] = useState(false);
  const [balance, setBalance] = useState(0); // Integrating wallet balance

  // Simulating fetching wallet balance (uncomment if using backend)
  /*
  useEffect(() => {
    axios.get('/api/wallet')
      .then(response => setBalance(response.data.balance))
      .catch(error => console.error('Error fetching wallet balance:', error));
  }, []);
  */

  // Toggle dropdown
  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className="profile">
      <div className="profile-header" onClick={toggleDropdown}>
        <img src="assets\catto.png" alt="User Logo" className="profile-logo" />
        <span className="profile-balance">{balance} FakeCoins</span> {/* Wallet balance */}
      </div>
      {isOpen && (
        <div className="profile-dropdown">
          <p>User Details</p>
          <p>Email: user@example.com</p>
          <p>Wallet Balance: {balance} FakeCoins</p> {/* Showing balance in dropdown */}
          <p>Settings</p>
          <p>Logout</p>
        </div>
      )}
    </div>
  );
}

export default Profile;

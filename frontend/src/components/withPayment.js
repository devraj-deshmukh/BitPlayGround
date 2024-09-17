import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Paywall from './Paywall';

const withPayment = (WrappedComponent, redirectPath) => {
  return (props) => {
    const [hasPaid, setHasPaid] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handlePayment = () => {
      setLoading(true);
      // Simulate payment processing
      setTimeout(() => {
        setLoading(false);
        setHasPaid(true);
        navigate(redirectPath); // Redirect to the game after payment
      }, 2000);
    };

    const handleGameOver = () => {
      setHasPaid(false); // Reset payment state when the game is over
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

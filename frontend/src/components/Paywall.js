import React from 'react';

const Paywall = ({ onPayment, loading }) => {
  return (
    <div className="paywall" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'rgba(0,0,0,0.5)' }}>
      <h1 style={{ color: 'white' }}>Payment Required</h1>
      <button onClick={onPayment} disabled={loading} style={{ padding: '10px 20px', fontSize: '16px' }}>
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </div>
  );
};

export default Paywall;

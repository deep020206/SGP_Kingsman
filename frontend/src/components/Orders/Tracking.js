import React from 'react';

const Tracking = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Order Tracking</h2>
      <div className="space-y-4">
        <div className="border p-4 rounded shadow">
          <p>Order #12345</p>
          <p className="text-yellow-500">Status: Preparing</p>
        </div>
        <div className="border p-4 rounded shadow">
          <p>Order #12346</p>
          <p className="text-blue-500">Status: Out for Delivery</p>
        </div>
      </div>
    </div>
  );
};

export default Tracking;

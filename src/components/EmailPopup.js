import React, { useState } from 'react';

const EmailPopup = ({ visible, error, onClose, onConfirm, loading }) => {
  const [email, setEmail] = useState('');

  if (!visible) return null;

  const handleConfirm = () => {
    onConfirm(email);
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div 
        className="w-4/5 max-w-lg bg-white p-5 rounded-lg"
        onClick={e => e.stopPropagation()}
      >
        <p className="text-base font-semibold mb-1.5 text-black">
          Email:
        </p>
        
        <input
          type="email"
          className="w-full px-2.5 py-2.5 border border-gray-300 rounded 
            text-black mb-2.5 focus:outline-none focus:border-gray-400
            placeholder:text-gray-500"
          placeholder="Enter your email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {error && (
          <p className="text-red-500 mt-2.5 text-center">
            {error}
          </p>
        )}

        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full bg-black text-white font-bold py-2.5 px-2.5 
            rounded mt-7 flex items-center justify-center"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent 
              rounded-full animate-spin" />
          ) : (
            'Submit'
          )}
        </button>
      </div>
    </div>
  );
};

export default EmailPopup;
import React from 'react';

const Button = ({ children, onClick, className }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-700 ${className}`}
  >
    {children}
  </button>
);

export default Button;

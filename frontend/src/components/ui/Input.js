import React from 'react';

const Input = ({ type, placeholder, value, onChange, className }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`p-2 border rounded-lg shadow-sm ${className}`}
  />
);

export default Input;

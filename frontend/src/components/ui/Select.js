import React from 'react';

const Select = ({ value, onChange, children, className }) => (
  <select
    value={value}
    onChange={onChange}
    className={`p-2 border rounded-lg shadow-sm ${className}`}
  >
    {children}
  </select>
);

export default Select;

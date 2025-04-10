import React from 'react';

const Tooltip = ({ position, className, children }) => (
  <div className={`absolute ${position} p-2 bg-gray-700 text-white rounded-lg shadow-lg ${className}`}>
    {children}
  </div>
);

export default Tooltip;

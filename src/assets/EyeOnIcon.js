import React from 'react';

const EyeIcon = ({ show }) => {
  return (
    <svg
    // xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={21}
    fill="none"
    style={{marginRight: 5}}
    >
    <path
      stroke="#111920"
      strokeWidth={1.25}
      d="M10 4.701c-4.094 0-7.14 3.985-8.333 5.833C2.86 12.383 5.906 16.368 10 16.368c4.095 0 7.14-3.985 8.333-5.833C17.141 8.685 14.095 4.7 10 4.7Z"
    />
    <path
      stroke="#111920"
      strokeLinejoin="round"
      strokeWidth={1.25}
      d="M12.5 10.535a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z"
    />
  </svg>
  );
};

export default EyeIcon;

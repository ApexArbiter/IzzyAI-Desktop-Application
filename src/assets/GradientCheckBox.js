import * as React from 'react';


const GradientCheckBox = ( ) => (
  <svg
    // xmlns="http://www.w3.org/2000/svg"
    width={25}
    height={24}
    fill="none"
     >
    <rect width={24} height={24} x={0.366} fill="#fff" rx={12} />
    <path
      fill="url(#a)"
      fillRule="evenodd"
      d="M12.366 22.75c-5.937 0-10.75-4.813-10.75-10.75S6.43 1.25 12.366 1.25 23.116 6.063 23.116 12s-4.813 10.75-10.75 10.75Zm3.248-14.81-4.795 5.23-1.761-1.762-1.414 1.414 3.238 3.239 6.206-6.77-1.475-1.352Z"
      clipRule="evenodd"
    />
    <defs>
      <LinearGradient
        id="a"
        x1={2.113}
        x2={23.208}
        y1={1.891}
        y2={22.689}
        gradientUnits="userSpaceOnUse">
        <Stop stopColor="#0CC8E8" />
        <Stop offset={1} stopColor="#2DEEAA" />
      </LinearGradient>
    </defs>
  </svg>
);
export default GradientCheckBox;

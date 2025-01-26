import * as React from 'react';
 

const SuccessIcon = ( ) => (
  <svg
    // xmlns="http://www.w3.org/2000/svg"
    width={44}
    height={44}
    fill="none"
     >
    <path
      fill="url(#a)"
      fillRule="evenodd"
      d="M22 43.733c-11.874 0-21.5-9.626-21.5-21.5S10.126.733 22 .733s21.5 9.626 21.5 21.5-9.626 21.5-21.5 21.5Zm6.495-29.621-9.589 10.46-3.523-3.523-2.828 2.828 6.477 6.477 12.411-13.54-2.948-2.703Z"
      clipRule="evenodd"
    />
    <Defs>
      <LinearGradient
        id="a"
        x1={1.493}
        x2={43.684}
        y1={2.015}
        y2={43.61}
        gradientUnits="userSpaceOnUse">
        <Stop stopColor="#0CC8E8" />
        <Stop offset={1} stopColor="#2DEEAA" />
      </LinearGradient>
    </Defs>
  </svg>
);
export default SuccessIcon;

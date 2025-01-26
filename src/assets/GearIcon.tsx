import * as React from 'react';
import svg, {svgProps, path} from 'react-native-svg';

const GearIcon = ( ) => (
  <svg
    // xmlns="http://www.w3.org/2000/svg"
    width={22}
    height={22}
    fill="none"
     >
    <path
      stroke="#111920"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M13.953 1H8.047v2.582L6.155 4.694 3.953 3.402 1 8.598 3.202 9.89v2.222L1 13.4l2.953 5.197 2.202-1.292 1.892 1.113V21h5.906v-2.581l1.892-1.113 2.202 1.292L21 13.402l-2.201-1.291V9.889L21 8.6l-2.953-5.197-2.202 1.292-1.892-1.112V1Z"
    />
    <path
      stroke="#111920"
      strokeWidth={1.5}
      d="M14.5 11a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
    />
  </svg>
);
export default GearIcon;

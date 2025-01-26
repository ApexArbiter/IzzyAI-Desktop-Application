import * as React from 'react';
import svg, {
  svgProps,
  Rect,
  path,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

const MicButton = ( ) => (
  <svg
    // xmlns="http://www.w3.org/2000/svg"
    width={64}
    height={64}
    fill="none"
     >
    <Rect width={64} height={64} fill="url(#a)" rx={32} />
    <path
      stroke="#111920"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M38.667 25.333v5.334a6.667 6.667 0 0 1-13.334 0v-5.334a6.667 6.667 0 1 1 13.334 0ZM42.667 30.667c0 5.89-4.776 10.666-10.667 10.666m0 0c-5.891 0-10.667-4.775-10.667-10.666M32 41.333v4m0 0h4m-4 0h-4"
    />
    <Defs>
      <LinearGradient
        id="a"
        x1={1.477}
        x2={64.273}
        y1={1.909}
        y2={63.817}
        gradientUnits="userSpaceOnUse">
        <Stop stopColor="#0CC8E8" />
        <Stop offset={1} stopColor="#2DEEAA" />
      </LinearGradient>
    </Defs>
  </svg>
);
export default MicButton;

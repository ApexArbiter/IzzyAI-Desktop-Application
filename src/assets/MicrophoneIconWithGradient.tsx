import * as React from 'react';
import svg, {
  svgProps,
  Rect,
  G,
  path,
  Defs,
  LinearGradient,
  Stop,
  Clippath,
} from 'react-native-svg';
const MicroPhoneIconGradient = ( ) => (
  <svg
    // xmlns="http://www.w3.org/2000/svg"
    width={32}
    height={33}
    fill="none"
     >
    <Rect width={32} height={32} y={0.647} fill="url(#a)" rx={16} />
    <G
      stroke="#111920"
      strokeLinejoin="round"
      strokeWidth={1.5}
      clipPath="url(#b)">
      <path d="M20 12.647v3.2a4 4 0 0 1-8 0v-3.2a4 4 0 1 1 8 0ZM22.4 15.847a6.4 6.4 0 0 1-6.4 6.4m0 0a6.4 6.4 0 0 1-6.4-6.4m6.4 6.4v2.4m0 0h2.4m-2.4 0h-2.4" />
    </g>
    <Defs>
      <LinearGradient
        id="a"
        x1={0.739}
        x2={32.137}
        y1={1.601}
        y2={32.555}
        gradientUnits="userSpaceOnUse">
        <Stop stopColor="#0CC8E8" />
        <Stop offset={1} stopColor="#2DEEAA" />
      </LinearGradient>
      <Clippath id="b">
        <path fill="#fff" d="M6.4 7.047h19.2v19.2H6.4z" />
      </Clippath>
    </Defs>
  </svg>
);
export default MicroPhoneIconGradient;

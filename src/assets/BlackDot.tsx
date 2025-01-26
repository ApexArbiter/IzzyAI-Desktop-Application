import * as React from 'react';
import svg, {svgProps, Circle} from 'react-native-svg';
const BlackDot = ( ) => (
  <svg
    // xmlns="http://www.w3.org/2000/svg"
    width={5}
    height={4}
    style={props.style}
    fill="none"
     >
    <Circle cx={2.82} cy={2} r={2} fill="#111920" />
  </svg>
);
export default BlackDot;

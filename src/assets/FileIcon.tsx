import * as React from 'react';
import svg, {path} from 'react-native-svg';

const FileIcon = (props: any) => {
  const stroke = props.active ? '#111920' : '#888C90';
  return (
    <svg
      // xmlns="http://www.w3.org/2000/svg"
      width={19}
      height={22}
      fill="none"
       >
      <path
        fill={stroke}
        d="M.75 1V.25A.75.75 0 0 0 0 1h.75Zm17 0h.75a.75.75 0 0 0-.75-.75V1Zm-17 20H0a.75.75 0 0 0 .75.75V21Zm10 0v.75h.31l.22-.22-.53-.53Zm7-7 .53.53.22-.22V14h-.75Zm-7 0v-.75H10V14h.75ZM.75 1.75h17V.25h-17v1.5ZM1.5 21V1H0v20h1.5Zm-.75.75h10v-1.5h-10v1.5ZM18.5 14V1H17v13h1.5Zm-7.22 7.53 7-7-1.06-1.06-7 7 1.06 1.06Zm.22-.53v-7H10v7h1.5Zm-.75-6.25h7v-1.5h-7v1.5Z"
      />
      <path
        stroke={stroke}
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M5.25 6h8M5.25 10h4"
      />
    </svg>
  );
};
export default FileIcon;

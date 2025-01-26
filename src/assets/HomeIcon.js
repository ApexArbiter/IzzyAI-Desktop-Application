import * as React from 'react';


const HomeIcon = (props) => {
  const stroke = props.active ? '#111920' : '#888C90';

  return (
    <svg
      // xmlns="http://www.w3.org/2000/svg"
      width={23}
      height={20}
      fill="none"
       >
      <path stroke={stroke} strokeWidth={1.5} d="M19.25 8v11h-15V8" />
      <path stroke={stroke} strokeWidth={1.5} d="M19.25 9h1.5l-9-8-9 8h1.5" />
      <path
        stroke={stroke}
        strokeLinecap="square"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11.75 14h.009"
      />
    </svg>
  );
};
export default HomeIcon;

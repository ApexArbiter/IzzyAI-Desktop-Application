import * as React from 'react';


const UserIcon2 = (props: any) => {
  const stroke = props.active ? '#111920' : '#888C90';

  return (
    <svg
      // xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={22}
      fill="none"
       >
      <path
        stroke={stroke}
        strokeWidth={1.5}
        d="M1.25 21h18c0-4.418-4.03-8-9-8s-9 3.582-9 8ZM14.75 5.5a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z"
      />
    </svg>
  );
};
export default UserIcon2;

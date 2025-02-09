import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import HomeIcon from '../assets/HomeIcon';
import FileIcon from '../assets/FileIcon';
import UserIcon2 from '../assets/UserIcon2';
import BrainIcon from '../assets/BrainIcon';
import { fonts } from '../theme';

const getIcon = (name) => {
  switch (name) {
    case 'home':
      return HomeIcon;
    case 'Assessments':
      return FileIcon;
    case 'therapistsPage':
      return BrainIcon;
    case 'profile':
      return UserIcon2;
    default:
      return HomeIcon;
  }
};

const capitalize = (str) => str?.charAt(0)?.toUpperCase() + str?.slice(1);

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userDetail = JSON.parse(localStorage.getItem("userDetails"));

  const routes = [
    { name: 'home', label: 'Home' },
    { name: 'Assessments', label: 'Assessments' },
    ...(userDetail?.SubscriptionDetails ? [{ name: 'therapistsPage', label: 'Therapists' }] : []),
    { name: 'profile', label: 'Profile' },
  ];

  const isRouteFocused = (routeName) => {
    return location.pathname === `/${routeName}`;
  };

  const handleClick = (name) => {
    switch (name) {
      case 'home':
        navigate('/home');
        break;
      case 'Assessments':
        navigate('/assessmentPage');
        break;
      case 'therapistsPage':
        navigate('/therapistsPage');
        break;
      case 'profile':
        navigate('/profile');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div style={styles.menuUpperWrapper}>
      <div style={styles.menuContainer}>
        {routes.map((route, index) => {
          const isFocused = isRouteFocused(route.name);
          const Icon = getIcon(route.name);

          return (
            <button
              key={index}
              onClick={() => handleClick(route.name)}
            >
              <div
              className='  lg:text-xl '
              style={styles.iconTextContainer}>
                <Icon active={isFocused} style={styles.icon} />
                <span
                
                  style={{
                    ...styles.base,
                    color: isFocused ? '#111920' : '#888C90',
                    marginLeft: 8,
                  }}
                >
                  {capitalize(route.label)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;

const styles = {
  base: {
    fontFamily: fonts.regular,
  },
  menuUpperWrapper: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    boxShadow: '0 -2px 5px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
  },
  menuContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '60px',
    padding: '0 10px',
  },
  bottomTabWrapper: {
    height: '40px',
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: 'none',
    cursor: 'pointer',
  },
  iconTextContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
};
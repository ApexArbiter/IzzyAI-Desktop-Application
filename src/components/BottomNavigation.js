import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Import necessary hooks from react-router-dom
import HomeIcon from '../assets/HomeIcon';
import FileIcon from '../assets/FileIcon';
import UserIcon2 from '../assets/UserIcon2';
import BrainIcon from '../assets/BrainIcon';
// Assuming these are React components or SVG imports
import { fonts } from '../theme'; // You may adjust based on your theme setup

// Function to get the correct icon based on the route name
const getIcon = (name) => {
  switch (name) {
    case 'home':
      return HomeIcon;
    case 'assessments':
      return FileIcon;
    case 'therapists':
      return BrainIcon;
    case 'profile':
      return UserIcon2;
    default:
      return HomeIcon;
  }
};

// Function to capitalize the first letter of a string
const capitalize = (str) => str?.charAt(0)?.toUpperCase() + str?.slice(1);

const BottomNavigation = () => {
  const navigate = useNavigate(); // Use the useNavigate hook from react-router-dom
  const location = useLocation(); // Get current route location

  const routes = [
    { name: 'home', label: 'Home' },
    { name: 'assessments', label: 'Assessments' },
    { name: 'therapists', label: 'Therapists' },
    { name: 'profile', label: 'Profile' },
  ];

  const isRouteFocused = (routeName) => {
    return location.pathname === `/${routeName}`;
  };

  // Handle onClick using useNavigate
  const handleClick = (name, path) => {
    switch (name) {
      case 'home':
        navigate('/home');
        break;
      case 'assessments':
        navigate('/assessmentPage');
        break;
      case 'therapists':
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
          const isFocused = isRouteFocused(route.name); // Check if the route is currently focused

          const Icon = getIcon(route.name);

          return (
            <button
              key={index}
              style={styles.bottomTabWrapper}
              onClick={() => handleClick(route.name)} // On click navigation
              className={isFocused ? 'selected' : ''}
            >
              <Icon active={isFocused} />
              <span
                style={{
                  ...styles.base,
                  color: isFocused ? '#111920' : '#888C90',
                }}
              >
                {capitalize(route.label)}
              </span>
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
    fontFamily: fonts.regular, // Ensure the correct font from your theme
  },
  menuUpperWrapper: {
    marginBottom: 10,
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
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
  menuUpperWrapper: {
    position: 'fixed',  // Fixes the position of the bottom tab bar
    bottom: 0,          // Align it to the bottom
    left: 0,            // Align it to the left edge of the viewport
    right: 0,           // Align it to the right edge of the viewport
    backgroundColor: '#fff', // Optional: Add background color for better visibility
    boxShadow: '0 -2px 5px rgba(0, 0, 0, 0.1)', // Optional: Add shadow for better styling
    zIndex: 1000,       // Ensure it stays on top of other content
  },
};

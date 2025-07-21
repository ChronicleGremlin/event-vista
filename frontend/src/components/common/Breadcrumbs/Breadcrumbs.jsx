import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const PATH_NAME_MAP = {
  '/': 'Welcome',
  '/app/dashboard': 'Dashboard',
  '/app/clients': 'Clients',
  '/app/vendors': 'Vendors',
  '/app/venues': 'Venues',
  '/app/profile': 'User Profile',
};

function Breadcrumbs() {
  const location = useLocation();
  const previousPath = location.state?.from || '/app/dashboard';
  const currentPath = location.pathname;

  if (currentPath === '/app/dashboard' && previousPath === '/app/dashboard') {
    return (
      <nav aria-label="breadcrumb" style={{ marginBottom: '1rem' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#007bff' }}>
          Welcome
        </Link>{' '}
          / <span> Dashboard </span>
      </nav>
    );
  }

  const currentName = PATH_NAME_MAP[currentPath] || currentPath.split('/').pop();
  const previousName = PATH_NAME_MAP[previousPath] || previousPath.split('/').pop();

  return (
    <nav aria-label="breadcrumb" style={{ marginBottom: '1rem' }}>
      <Link to={previousPath} style={{ textDecoration: 'none', color: '#007bff' }}>
        {previousName}
      </Link>{' '}
      / <span>{currentName}</span>
    </nav>
  );
}

export default Breadcrumbs;





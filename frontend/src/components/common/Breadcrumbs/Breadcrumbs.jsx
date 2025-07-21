import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const PATH_NAME_MAP = {
  '/': 'Welcome',
  '/dashboard': 'Dashboard',
  '/clients': 'Clients',
  '/vendors': 'Vendors',
  '/venues': 'Venues',
  '/profile': 'User Profile',
};

function Breadcrumbs() {
  const location = useLocation();
  const previousPath = location.state?.from || '/dashboard';
  const currentPath = location.pathname;

  if (currentPath === '/dashboard' && previousPath === '/dashboard') {
    return (
      <nav aria-label="breadcrumb" style={{ marginBottom: '1rem' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#007bff' }}>
          Dashboard
        </Link>{' '}
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





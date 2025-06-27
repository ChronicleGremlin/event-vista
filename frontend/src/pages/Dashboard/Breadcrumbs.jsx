import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Breadcrumbs() {
    const location = useLocation();
    const [breadcrumbs, setBreadcrumbs] = useState([{
        name: 'Dashboard',
        link: '/dashboard',
    }]); // Starting with the Dashboard breadcrumb

    // Helper function to format breadcrumb names (e.g., "user-profile" -> "User Profile")
    const formatName = (str) => str.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());

    useEffect(() => {
        // Get the current pathname
        const pathnames = location.pathname.split('/').filter(x => x);
        const newBreadcrumbs = [...breadcrumbs];

        // For each part of the path, add a breadcrumb if it's not already there
        pathnames.forEach((segment, index) => {
            // We want to avoid adding duplicate breadcrumbs
            const link = `/${pathnames.slice(0, index + 1).join('/')}`; // Build the full link for each breadcrumb
            const name = formatName(segment);

            // Only add the breadcrumb if it's not already in the list
            if (!newBreadcrumbs.some(b => b.link === link)) {
                newBreadcrumbs.push({ name, link });
            }
        });

        // Update the breadcrumbs state with the new list
        setBreadcrumbs(newBreadcrumbs);

    }, [location]);

    return (
        <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
                {breadcrumbs.map((breadcrumb, index) => (
                    <li
                        key={breadcrumb.link}
                        className={`breadcrumb-item ${index === breadcrumbs.length - 1 ? 'active' : ''}`}
                        aria-current={index === breadcrumbs.length - 1 ? 'page' : undefined}
                    >
                        {index === breadcrumbs.length - 1 ? (
                            breadcrumb.name // Last breadcrumb (current page), non-clickable
                        ) : (
                            <Link to={breadcrumb.link}>{breadcrumb.name}</Link> // Other breadcrumbs, clickable
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}

export default Breadcrumbs;
import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import './Header.css';

function Header({ session }) {
  const history = useHistory();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    history.push('/');
  };

  if (!session) return null;

  return (
    <header className="header">
      <h1 className="system-name">Pawmise Stock Tracking System</h1>
      <nav>
        <ul className="nav-list">
          <li><Link to="/summary">Summary</Link></li>
          <li><Link to="/actions">Actions</Link></li>
          <li><Link to="/products">Manage Products</Link></li>
          <li><button onClick={handleLogout}>Logout</button></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
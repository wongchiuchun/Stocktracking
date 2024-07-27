import React, { useState, useEffect } from 'react';
import UserForm from '../components/UserForm'; // Ensure that the 'UserForm' component exists in the '../components' directory

function UserManagementPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // TODO: Fetch users from API
    // For now, we'll use dummy data
    setUsers([
      { id: 1, username: 'user1', isAdmin: false },
      { id: 2, username: 'admin1', isAdmin: true },
    ]);
  }, []);

  const handleAddUser = (user) => {
    // TODO: Implement API call to add user
    console.log('Adding user:', user);
    setUsers([...users, { ...user, id: Date.now() }]);
  };

  const handleRemoveUser = (userId) => {
    // TODO: Implement API call to remove user
    console.log('Removing user:', userId);
    setUsers(users.filter(u => u.id !== userId));
  };

  return (
    <div className="user-management-page">
      <h1>Manage Users</h1>
      <UserForm onSubmit={handleAddUser} />
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.username} ({user.isAdmin ? 'Admin' : 'User'})
            <button onClick={() => handleRemoveUser(user.id)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserManagementPage;
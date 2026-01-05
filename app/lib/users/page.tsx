'use client';

import { useEffect, useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import api from '../api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    password: '',
  });

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchUsers = async () => {
    if (!token) {
      setError('Please login again');
      return;
    }

    try {
      const res = await api.get('/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        password: '',
      });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', role: '', password: '' });
    }
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        await api.patch(`/users/${editingUser.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post('/users/create', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setModalOpen(false);
      fetchUsers();
    } catch {
      alert('Error saving user');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete user?')) return;
    await api.delete(`/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchUsers();
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Users</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{new Date(u.createdAt).toLocaleString()}</td>
                <td>
                  <button onClick={() => openModal(u)}>
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(u.id)}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button onClick={() => openModal()} className="mt-4">
        Add User
      </button>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6">
            <input
              placeholder="Name"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <input
              placeholder="Email"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <input
              placeholder="Role"
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
            />
            {!editingUser && (
              <input
                placeholder="Password"
                type="password"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            )}
            <button onClick={handleSubmit}>
              {editingUser ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

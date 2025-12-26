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
  const [formData, setFormData] = useState({ name: '', email: '', role: '' });

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
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
      setFormData({ name: user.name, email: user.email, role: user.role });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', role: '' });
    }
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post('/users', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchUsers();
      setModalOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving user');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting user');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Users Management</h1>

      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-lg bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Created At</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 text-gray-700">{user.name}</td>
                  <td className="px-6 py-4 text-gray-700">{user.email}</td>
                  <td className="px-6 py-4 text-gray-700">{user.role}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(user.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center space-x-2">
                    <button
                      onClick={() => openModal(user)}
                      className="flex items-center gap-2 px-3 py-1 border border-blue-500 text-blue-600 rounded-md hover:bg-blue-500 hover:text-white transition"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="flex items-center gap-2 px-3 py-1 border border-red-500 text-red-600 rounded-md hover:bg-red-500 hover:text-white transition"
                    >
                      <FaTrash /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        onClick={() => openModal()}
        className="mt-6 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-semibold transition"
      >
        Add User
      </button>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md animate-fadeIn">
            <h2 className="text-xl font-bold mb-4">
              {editingUser ? 'Edit User' : 'Add User'}
            </h2>
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 mb-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 mb-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              placeholder="Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-3 mb-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                {editingUser ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

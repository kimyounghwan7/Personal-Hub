"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';

type User = {
  id: string;
  email: string;
  role: string;
  created_at: string;
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data || []);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError(err.response?.data?.detail || 'Failed to load users. Are you an admin?');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to completely delete this user and all their data?')) return;
    
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter((user) => user.id !== userId));
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      alert('Failed to delete user.');
    }
  };

  if (loading) return <div className="p-8">Loading admin dashboard...</div>;
  if (error) return <div className="p-8 text-red-600 font-semibold">{error}</div>;

  return (
    <div className="py-8 max-w-5xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard - User Management</h1>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 font-semibold text-sm text-gray-700">ID</th>
                <th className="py-3 px-4 font-semibold text-sm text-gray-700">Email</th>
                <th className="py-3 px-4 font-semibold text-sm text-gray-700">Role</th>
                <th className="py-3 px-4 font-semibold text-sm text-gray-700">Joined Date</th>
                <th className="py-3 px-4 font-semibold text-sm text-gray-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-500 font-mono">{user.id.slice(0, 8)}...</td>
                  <td className="py-3 px-4 text-sm font-medium">{user.email}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={user.role === 'admin'}
                      className={`text-sm px-3 py-1 rounded ${
                        user.role === 'admin' 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

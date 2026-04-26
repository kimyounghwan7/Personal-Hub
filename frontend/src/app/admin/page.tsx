"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';

type User = {
  id: string;
  email: string;
  role: string;
  is_approved: boolean;
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

  const handleApproveUser = async (userId: string) => {
    try {
      await api.patch(`/admin/users/${userId}/approve`);
      setUsers(users.map((user) => user.id === userId ? { ...user, is_approved: true } : user));
    } catch (err: any) {
      console.error('Failed to approve user:', err);
      alert('Failed to approve user.');
    }
  };

  if (loading) return <div className="p-8 mt-20 text-gray-300">Loading admin dashboard...</div>;
  if (error) return <div className="p-8 mt-20 text-red-400 font-semibold">{error}</div>;

  return (
    <div className="py-24 max-w-6xl mx-auto px-4">
      <div className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/10 text-white">
        <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
          Admin Dashboard - User Management
        </h1>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-4 px-4 font-semibold text-sm text-gray-400">ID</th>
                <th className="py-4 px-4 font-semibold text-sm text-gray-400">Email</th>
                <th className="py-4 px-4 font-semibold text-sm text-gray-400">Role</th>
                <th className="py-4 px-4 font-semibold text-sm text-gray-400">Status</th>
                <th className="py-4 px-4 font-semibold text-sm text-gray-400">Joined Date</th>
                <th className="py-4 px-4 font-semibold text-sm text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4 text-sm text-gray-500 font-mono">{user.id.slice(0, 8)}...</td>
                  <td className="py-4 px-4 text-sm font-medium text-gray-200">{user.email}</td>
                  <td className="py-4 px-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      user.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm">
                    {user.is_approved ? (
                      <span className="text-green-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Approved</span>
                    ) : (
                      <span className="text-yellow-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span> Pending</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4 text-right flex justify-end gap-2">
                    {!user.is_approved && (
                      <button
                        onClick={() => handleApproveUser(user.id)}
                        className="text-sm px-3 py-1.5 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors border border-green-500/30 font-medium"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={user.role === 'admin'}
                      className={`text-sm px-3 py-1.5 rounded font-medium border transition-colors ${
                        user.role === 'admin' 
                        ? 'bg-gray-800 text-gray-600 cursor-not-allowed border-gray-700' 
                        : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/30'
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

"use client";

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ShieldAlert, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import api, { isPendingApprovalError, isUnauthorizedError } from '@/lib/api';
import { buildLoginPath } from '@/lib/auth-paths';

type User = {
  id: string;
  email: string;
  role: string;
  is_approved: boolean;
  created_at: string;
};

export default function AdminDashboardClient() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get<User[]>('/admin/users');
      setUsers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);

      if (isUnauthorizedError(error)) {
        router.replace(buildLoginPath('/admin'));
        router.refresh();
        return;
      }

      if (isPendingApprovalError(error)) {
        setError('Your account is still waiting for admin approval.');
        return;
      }

      setError('You do not have permission to access the admin dashboard.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to completely delete this user and all their data?')) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((currentUsers) => currentUsers.filter((user) => user.id !== userId));
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user.');
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      await api.patch(`/admin/users/${userId}/approve`);
      setUsers((currentUsers) =>
        currentUsers.map((user) => (user.id === userId ? { ...user, is_approved: true } : user)),
      );
    } catch (error) {
      console.error('Failed to approve user:', error);
      alert('Failed to approve user.');
    }
  };

  if (loading) {
    return <div className="p-8 mt-20 text-gray-300 text-center">Loading admin dashboard…</div>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <Card className="text-center max-w-md w-full p-4">
          <CardHeader className="items-center">
            <ShieldAlert className="h-12 w-12 text-red-400 mb-2" />
            <CardTitle>Admin access unavailable</CardTitle>
            <CardDescription className="pt-2">{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-24 max-w-6xl mx-auto px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Admin Dashboard — User Management
            </CardTitle>
            <CardDescription className="mt-1.5">
              Approve pending registrations and manage user access boundaries.
            </CardDescription>
          </div>
          <Badge variant="secondary">{users.length} Users</Badge>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="text-gray-500 font-mono text-xs">
                    {user.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell className="font-medium text-gray-200">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'secondary' : 'default'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.is_approved ? (
                      <Badge variant="success">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Approved
                      </Badge>
                    ) : (
                      <Badge variant="warning">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {!user.is_approved && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => {
                            void handleApproveUser(user.id);
                          }}
                        >
                          <Check className="h-3.5 w-3.5" />
                          Approve
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          void handleDeleteUser(user.id);
                        }}
                        disabled={user.role === 'admin'}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

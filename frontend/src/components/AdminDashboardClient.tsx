"use client";

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Clock, ShieldAlert, ShieldCheck, Trash2, Users } from 'lucide-react';
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
    return (
      <div className="flex items-center justify-center min-h-screen px-4 bg-subtle-grid">
        <Badge variant="outline" className="py-2 px-4 text-sm">
          <span className="h-2 w-2 rounded-full bg-[#8ee3be] animate-pulse" />
          Loading admin dashboard…
        </Badge>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 bg-subtle-grid">
        <Card className="text-center max-w-md w-full p-4">
          <CardHeader className="items-center">
            <ShieldAlert className="h-12 w-12 text-rose-300 mb-2" />
            <CardTitle>Admin access unavailable</CardTitle>
            <CardDescription className="pt-2">{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const approvedCount = users.filter((user) => user.is_approved).length;
  const pendingCount = users.length - approvedCount;

  return (
    <div className="min-h-screen bg-subtle-grid pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-emerald-100/60">Registered Accounts</div>
              <div className="text-2xl font-bold text-white mt-1">{users.length}</div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-[#8ee3be]/12 border border-[#8ee3be]/30 flex items-center justify-center text-[#8ee3be]">
              <Users className="h-5 w-5" />
            </div>
          </Card>

          <Card className="p-5 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-emerald-100/60">Approved Active</div>
              <div className="text-2xl font-bold text-[#a7f3d0] mt-1">{approvedCount}</div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-[#8ee3be]/12 border border-[#8ee3be]/30 flex items-center justify-center text-[#8ee3be]">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </Card>

          <Card className="p-5 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-emerald-100/60">Pending Approval</div>
              <div className="text-2xl font-bold text-amber-200 mt-1">{pendingCount}</div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-400/12 border border-amber-300/30 flex items-center justify-center text-amber-200">
              <Clock className="h-5 w-5" />
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#d8f9e9] via-[#8ee3be] to-[#6ee7b7]">
                Admin Dashboard — User Access Control
              </CardTitle>
              <CardDescription className="mt-1.5">
                Approve pending registrations and enforce role-based access boundaries.
              </CardDescription>
            </div>
            <Badge variant="default">{users.length} Total</Badge>
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
                    <TableCell className="text-emerald-100/45 font-mono text-xs">
                      {user.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="font-medium text-emerald-50">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.is_approved ? (
                        <Badge variant="success">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#8ee3be]" />
                          Approved
                        </Badge>
                      ) : (
                        <Badge variant="warning">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-emerald-100/60">
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
    </div>
  );
}

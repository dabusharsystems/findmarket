import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  MoreHorizontal, 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  UserX, 
  UserCheck,
  RefreshCw,
  Mail,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UserWithRole {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: 'buyer' | 'seller' | 'admin';
  trust_level: string | null;
  is_suspended: boolean | null;
  suspended_reason: string | null;
  created_at: string | null;
  total_connections: number | null;
  average_rating: number | null;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [newRole, setNewRole] = useState<'buyer' | 'seller' | 'admin'>('buyer');
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Merge profiles with roles
      const usersWithRoles = profiles?.map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.id);
        return {
          ...profile,
          role: userRole?.role || 'buyer',
        } as UserWithRole;
      }) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!selectedUser) return;
    setActionLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_suspended: true,
          suspended_at: new Date().toISOString(),
          suspended_reason: suspendReason,
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast({
        title: 'User Suspended',
        description: `${selectedUser.name} has been suspended`,
      });

      setShowSuspendDialog(false);
      setSuspendReason('');
      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to suspend user',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnsuspend = async (user: UserWithRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_suspended: false,
          suspended_at: null,
          suspended_reason: null,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'User Unsuspended',
        description: `${user.name} has been unsuspended`,
      });

      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to unsuspend user',
        variant: 'destructive',
      });
    }
  };

  const handleRoleChange = async () => {
    if (!selectedUser) return;
    setActionLoading(true);

    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', selectedUser.id);

      if (error) throw error;

      toast({
        title: 'Role Updated',
        description: `${selectedUser.name} is now a ${newRole}`,
      });

      setShowRoleDialog(false);
      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update role',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleTrustLevelChange = async (user: UserWithRole, trustLevel: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ trust_level: trustLevel })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Trust Level Updated',
        description: `${user.name}'s trust level set to ${trustLevel}`,
      });

      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update trust level',
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getTrustBadge = (trustLevel: string | null) => {
    switch (trustLevel) {
      case 'verified':
        return <Badge variant="success"><ShieldCheck className="h-3 w-3 mr-1" />Verified</Badge>;
      case 'trusted':
        return <Badge variant="secondary"><Shield className="h-3 w-3 mr-1" />Trusted</Badge>;
      case 'low':
        return <Badge variant="destructive"><ShieldAlert className="h-3 w-3 mr-1" />Low</Badge>;
      default:
        return <Badge variant="outline">Standard</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="default">Admin</Badge>;
      case 'seller':
        return <Badge variant="service">Seller</Badge>;
      default:
        return <Badge variant="product">Buyer</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="buyer">Buyers</SelectItem>
              <SelectItem value="seller">Sellers</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchUsers}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Users Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Trust Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stats</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getTrustBadge(user.trust_level)}</TableCell>
                  <TableCell>
                    {user.is_suspended ? (
                      <Badge variant="destructive">
                        <UserX className="h-3 w-3 mr-1" />
                        Suspended
                      </Badge>
                    ) : (
                      <Badge variant="success">
                        <UserCheck className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Connections: {user.total_connections || 0}</div>
                      <div>Rating: {user.average_rating?.toFixed(1) || 'N/A'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setNewRole(user.role);
                            setShowRoleDialog(true);
                          }}
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Change Role
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleTrustLevelChange(user, 'verified')}>
                          <ShieldCheck className="mr-2 h-4 w-4 text-success" />
                          Set Verified
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTrustLevelChange(user, 'trusted')}>
                          <Shield className="mr-2 h-4 w-4 text-accent" />
                          Set Trusted
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTrustLevelChange(user, 'standard')}>
                          <Shield className="mr-2 h-4 w-4" />
                          Set Standard
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTrustLevelChange(user, 'low')}>
                          <ShieldAlert className="mr-2 h-4 w-4 text-destructive" />
                          Set Low
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.is_suspended ? (
                          <DropdownMenuItem onClick={() => handleUnsuspend(user)}>
                            <UserCheck className="mr-2 h-4 w-4 text-success" />
                            Unsuspend
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setShowSuspendDialog(true);
                            }}
                            className="text-destructive"
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            Suspend
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {filteredUsers.length} of {users.length} users
        </div>

        {/* Suspend Dialog */}
        <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suspend User</DialogTitle>
              <DialogDescription>
                Suspend {selectedUser?.name}? They won't be able to access the platform.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Reason for suspension</Label>
                <Textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="Enter the reason for suspending this user..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSuspendDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleSuspend}
                disabled={actionLoading || !suspendReason}
              >
                {actionLoading ? 'Suspending...' : 'Suspend User'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Role Change Dialog */}
        <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change User Role</DialogTitle>
              <DialogDescription>
                Update the role for {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>New Role</Label>
                <Select value={newRole} onValueChange={(v) => setNewRole(v as 'buyer' | 'seller' | 'admin')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buyer">Buyer</SelectItem>
                    <SelectItem value="seller">Seller</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleRoleChange} disabled={actionLoading}>
                {actionLoading ? 'Updating...' : 'Update Role'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

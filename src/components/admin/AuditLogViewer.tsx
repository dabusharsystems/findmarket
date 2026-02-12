import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  FileText,
  Search,
  RefreshCw,
  User,
  CreditCard,
  Package,
  Shield,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any;
  created_at: string;
  actor_name?: string;
  actor_email?: string;
}

const actionIcons: Record<string, React.ReactNode> = {
  payment_initiated: <CreditCard className="h-4 w-4" />,
  payment_success: <CreditCard className="h-4 w-4 text-success" />,
  user_suspended: <Shield className="h-4 w-4 text-destructive" />,
  user_unsuspended: <Shield className="h-4 w-4 text-success" />,
  listing_flagged: <Package className="h-4 w-4 text-warning" />,
  listing_resolved: <Package className="h-4 w-4 text-success" />,
  role_changed: <User className="h-4 w-4" />,
  settings_updated: <Settings className="h-4 w-4" />,
};

export const AuditLogViewer = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data: logsData, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;

      // Fetch actor profiles
      const actorIds = [...new Set(logsData?.map(l => l.actor_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', actorIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]));

      const enriched = (logsData || []).map(log => ({
        ...log,
        actor_name: profileMap.get(log.actor_id)?.name || 'Unknown',
        actor_email: profileMap.get(log.actor_id)?.email || '',
      }));

      setLogs(enriched);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load audit logs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const uniqueActions = [...new Set(logs.map(l => l.action))];

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.actor_name?.toLowerCase().includes(search.toLowerCase()) ||
      log.actor_email?.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

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
          <FileText className="h-5 w-5" />
          Audit Logs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by actor or action..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {uniqueActions.map(action => (
                <SelectItem key={action} value={action}>
                  {action.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchLogs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Log Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No audit logs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">{log.actor_name}</div>
                        <div className="text-xs text-muted-foreground">{log.actor_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        {actionIcons[log.action] || <FileText className="h-3 w-3" />}
                        {log.action.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {log.entity_type && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">{log.entity_type}:</span>{' '}
                          <span className="font-mono text-xs">{log.entity_id?.slice(0, 8)}...</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {log.metadata && (
                        <pre className="text-xs bg-muted p-1 rounded max-w-[200px] overflow-hidden text-ellipsis">
                          {JSON.stringify(log.metadata, null, 1)}
                        </pre>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {filteredLogs.length} of {logs.length} logs
        </div>
      </CardContent>
    </Card>
  );
};

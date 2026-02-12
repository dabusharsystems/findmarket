import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { 
  Users, 
  Package, 
  Wrench, 
  DollarSign,
  MessageSquare,
  TrendingUp,
  Settings,
  FileText,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { PaymentSettings } from '@/components/admin/PaymentSettings';
import { UserManagement } from '@/components/admin/UserManagement';
import { ListingManagement } from '@/components/admin/ListingManagement';
import { CategoryManagement } from '@/components/admin/CategoryManagement';
import { AuditLogViewer } from '@/components/admin/AuditLogViewer';

interface Stats {
  totalUsers: number;
  totalBuyers: number;
  totalSellers: number;
  totalAdmins: number;
  totalListings: number;
  openListings: number;
  totalBids: number;
  paidBids: number;
  totalRevenue: number;
  subscriptionRevenue: number;
  bidRevenue: number;
  activeSubscriptions: number;
}

const StatCard = ({ 
  label, 
  value, 
  icon: Icon, 
  color,
  prefix = ''
}: { 
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: 'product' | 'service' | 'success' | 'accent';
  prefix?: string;
}) => {
  const colors = {
    product: 'bg-product/10 text-product',
    service: 'bg-service/10 text-service',
    success: 'bg-success/10 text-success',
    accent: 'bg-accent/10 text-accent',
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <div className="text-2xl font-bold">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          <div className="text-sm text-muted-foreground">{label}</div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { user, role, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalBuyers: 0,
    totalSellers: 0,
    totalAdmins: 0,
    totalListings: 0,
    openListings: 0,
    totalBids: 0,
    paidBids: 0,
    totalRevenue: 0,
    subscriptionRevenue: 0,
    bidRevenue: 0,
    activeSubscriptions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user || role !== 'admin') return;

      // Fetch user counts
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: totalBuyers } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'buyer');

      const { count: totalSellers } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'seller');

      const { count: totalAdmins } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin');

      // Fetch listings stats
      const { count: totalListings } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true });

      const { count: openListings } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      // Fetch bids stats
      const { count: totalBids } = await supabase
        .from('bids')
        .select('*', { count: 'exact', head: true });

      const { count: paidBids } = await supabase
        .from('bids')
        .select('*', { count: 'exact', head: true })
        .eq('payment_status', 'paid');

      // Fetch payments
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .eq('status', 'successful');

      let totalRevenue = 0;
      let subscriptionRevenue = 0;
      let bidRevenue = 0;

      if (paymentsData) {
        paymentsData.forEach(p => {
          totalRevenue += p.amount;
          if (p.payment_type === 'single_bid') {
            bidRevenue += p.amount;
          } else {
            subscriptionRevenue += p.amount;
          }
        });
      }

      // Active subscriptions
      const { count: activeSubscriptions } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      setStats({
        totalUsers: totalUsers || 0,
        totalBuyers: totalBuyers || 0,
        totalSellers: totalSellers || 0,
        totalAdmins: totalAdmins || 0,
        totalListings: totalListings || 0,
        openListings: openListings || 0,
        totalBids: totalBids || 0,
        paidBids: paidBids || 0,
        totalRevenue,
        subscriptionRevenue,
        bidRevenue,
        activeSubscriptions: activeSubscriptions || 0,
      });

      setLoading(false);
    };

    fetchStats();
  }, [user, role]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Redirect non-admins
  if (!user || role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/50 border-b border-border">
        <div className="container-custom py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-6 w-6 text-primary" />
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              </div>
              <p className="text-muted-foreground">
                Monitor and manage your marketplace
              </p>
            </div>
            <Badge variant="default" className="w-fit">
              Admin Access
            </Badge>
          </div>
        </div>
      </div>

      <div className="container-custom py-8 space-y-8">
        {/* Overview Stats */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Overview</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Users" value={stats.totalUsers} icon={Users} color="product" />
            <StatCard label="Total Listings" value={stats.totalListings} icon={FileText} color="service" />
            <StatCard label="Paid Bids" value={stats.paidBids} icon={MessageSquare} color="accent" />
            <StatCard label="Total Revenue" value={stats.totalRevenue} icon={DollarSign} color="success" prefix="KES " />
          </div>
        </div>

        {/* User Breakdown */}
        <div>
          <h2 className="text-xl font-semibold mb-4">User Breakdown</h2>
          <div className="grid sm:grid-cols-4 gap-4">
            <StatCard label="Buyers" value={stats.totalBuyers} icon={Users} color="product" />
            <StatCard label="Sellers" value={stats.totalSellers} icon={Users} color="service" />
            <StatCard label="Admins" value={stats.totalAdmins} icon={Shield} color="accent" />
            <StatCard label="Active Subscriptions" value={stats.activeSubscriptions} icon={TrendingUp} color="success" />
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Revenue Breakdown</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <StatCard 
              label="Subscription Revenue" 
              value={stats.subscriptionRevenue} 
              icon={CreditCard} 
              color="accent"
              prefix="KES " 
            />
            <StatCard 
              label="Bid Revenue" 
              value={stats.bidRevenue} 
              icon={MessageSquare} 
              color="product"
              prefix="KES " 
            />
            <StatCard 
              label="Open Listings" 
              value={stats.openListings} 
              icon={Clock} 
              color="service" 
            />
          </div>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="listings">
              <FileText className="h-4 w-4 mr-2" />
              Listings
            </TabsTrigger>
            <TabsTrigger value="categories">
              <Package className="h-4 w-4 mr-2" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="payments">
              <CreditCard className="h-4 w-4 mr-2" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="logs">
              <FileText className="h-4 w-4 mr-2" />
              Audit Logs
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="listings">
            <ListingManagement />
          </TabsContent>

          <TabsContent value="categories">
            <CategoryManagement />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentSettings />
          </TabsContent>

          <TabsContent value="logs">
            <AuditLogViewer />
          </TabsContent>

          <TabsContent value="settings">
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Platform Settings
              </h3>
              <p className="text-muted-foreground">
                Additional platform configuration options will be available here.
              </p>
              <div className="mt-4 p-4 rounded-lg border border-border bg-muted/30">
                <h4 className="font-medium mb-2">Admin Account Info</h4>
                <p className="text-sm text-muted-foreground">
                  Logged in as: <span className="font-medium text-foreground">{user?.email}</span>
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;

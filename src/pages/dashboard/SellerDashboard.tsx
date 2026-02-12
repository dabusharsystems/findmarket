import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Wrench, 
  Bell, 
  ChevronRight,
  MessageSquare,
  CheckCircle,
  Clock,
  Loader2,
  Zap,
  TrendingUp,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';

interface Bid {
  id: string;
  price: number;
  message: string;
  payment_status: 'pending' | 'paid' | 'failed';
  created_at: string;
  listings: {
    id: string;
    title: string;
    listing_type: 'product' | 'service';
  };
}

interface Subscription {
  id: string;
  plan_name: string;
  bid_limit: number | null;
  bids_used: number;
  end_date: string;
  status: 'active' | 'expired' | 'cancelled';
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

const StatCard = ({ 
  label, 
  value, 
  icon: Icon, 
  color 
}: { 
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: 'product' | 'service' | 'success' | 'accent';
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
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm text-muted-foreground">{label}</div>
        </div>
      </div>
    </div>
  );
};

const BidRow = ({ bid }: { bid: Bid }) => {
  const isProduct = bid.listings.listing_type === 'product';
  
  return (
    <Link
      to={`/listing/${bid.listings.id}`}
      className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
    >
      <div className={`p-2 rounded-lg ${isProduct ? 'bg-product/10' : 'bg-service/10'}`}>
        {isProduct ? (
          <Package className="h-5 w-5 text-product" />
        ) : (
          <Wrench className="h-5 w-5 text-service" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate group-hover:text-primary transition-colors">
          {bid.listings.title}
        </h4>
        <p className="text-sm text-muted-foreground">
          Your bid: KES {bid.price.toLocaleString()}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Badge 
          variant={bid.payment_status === 'paid' ? 'default' : 'outline'}
          className={bid.payment_status === 'paid' ? 'bg-success' : ''}
        >
          {bid.payment_status === 'paid' ? (
            <><CheckCircle className="h-3 w-3 mr-1" /> Paid</>
          ) : bid.payment_status === 'pending' ? (
            <><Clock className="h-3 w-3 mr-1" /> Pending</>
          ) : (
            <><AlertCircle className="h-3 w-3 mr-1" /> Failed</>
          )}
        </Badge>
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </Link>
  );
};

const SellerDashboard = () => {
  const { user } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState({
    totalBids: 0,
    paidBids: 0,
    connections: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch bids
      const { data: bidsData } = await supabase
        .from('bids')
        .select('*, listings(id, title, listing_type)')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (bidsData) {
        setBids(bidsData as Bid[]);
        setStats(prev => ({
          ...prev,
          totalBids: bidsData.length,
          paidBids: bidsData.filter(b => b.payment_status === 'paid').length,
        }));
      }

      // Fetch subscription
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('seller_id', user.id)
        .eq('status', 'active')
        .single();

      if (subData) {
        setSubscription(subData);
      }

      // Fetch connections count
      const { count: connectionsCount } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user.id);

      setStats(prev => ({
        ...prev,
        connections: connectionsCount || 0,
      }));

      // Fetch notifications
      const { data: notificationsData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (notificationsData) {
        setNotifications(notificationsData);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const bidsRemaining = subscription 
    ? subscription.bid_limit 
      ? subscription.bid_limit - subscription.bids_used 
      : 'Unlimited'
    : 0;

  const bidsProgress = subscription && subscription.bid_limit
    ? (subscription.bids_used / subscription.bid_limit) * 100
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/50 border-b border-border">
        <div className="container-custom py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">Seller Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your bids and track your performance
              </p>
            </div>
            <Button variant="accent" asChild>
              <Link to="/browse">
                Browse Listings
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats */}
            <div className="grid sm:grid-cols-3 gap-4">
              <StatCard label="Total Bids" value={stats.totalBids} icon={MessageSquare} color="product" />
              <StatCard label="Paid Bids" value={stats.paidBids} icon={CheckCircle} color="success" />
              <StatCard label="Connections" value={stats.connections} icon={TrendingUp} color="accent" />
            </div>

            {/* Recent Bids */}
            <div className="bg-card rounded-xl border border-border">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-xl font-semibold">Your Bids</h2>
                <Link to="/my-bids" className="text-sm text-primary hover:underline">
                  View All
                </Link>
              </div>
              
              <div className="p-4">
                {bids.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex p-4 rounded-full bg-muted mb-4">
                      <MessageSquare className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-2">No bids yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Browse listings and submit your first bid.
                    </p>
                    <Button variant="accent" asChild>
                      <Link to="/browse">
                        Browse Listings
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {bids.slice(0, 5).map((bid) => (
                      <BidRow key={bid.id} bid={bid} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscription Status */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Subscription Status
              </h3>
              
              {subscription ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="default" className="bg-success">
                      {subscription.plan_name}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Expires {new Date(subscription.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Bids Used</span>
                      <span className="font-medium">
                        {subscription.bids_used} / {subscription.bid_limit || '∞'}
                      </span>
                    </div>
                    {subscription.bid_limit && (
                      <Progress value={bidsProgress} className="h-2" />
                    )}
                  </div>

                  <div className="text-center p-4 rounded-lg bg-accent/10 border border-accent/20">
                    <div className="text-2xl font-bold text-accent">{bidsRemaining}</div>
                    <div className="text-sm text-muted-foreground">Bids Remaining</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="inline-flex p-3 rounded-full bg-muted mb-3">
                    <Zap className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    No active subscription. Bids cost KES 10 each.
                  </p>
                  <Button variant="accent" className="w-full" asChild>
                    <Link to="/pricing">
                      View Plans
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="bg-card rounded-xl border border-border">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                </h3>
                <Link to="/notifications" className="text-xs text-primary hover:underline">
                  View All
                </Link>
              </div>
              
              <div className="p-4">
                {notifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No notifications yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={`p-3 rounded-lg text-sm ${notification.read ? 'bg-muted/50' : 'bg-accent/10 border border-accent/20'}`}
                      >
                        <div className="font-medium">{notification.title}</div>
                        <div className="text-muted-foreground text-xs mt-1">
                          {notification.message}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;

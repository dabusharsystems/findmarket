import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Package, 
  Wrench, 
  Bell, 
  ChevronRight,
  FileText,
  MessageSquare,
  CheckCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';

interface Listing {
  id: string;
  title: string;
  description: string;
  listing_type: 'product' | 'service';
  status: 'open' | 'resolved';
  created_at: string;
  bids_count?: number;
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
  value: number;
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

const ListingRow = ({ listing }: { listing: Listing }) => {
  const isProduct = listing.listing_type === 'product';
  
  return (
    <Link
      to={`/listing/${listing.id}`}
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
          {listing.title}
        </h4>
        <p className="text-sm text-muted-foreground">
          Posted {new Date(listing.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {listing.bids_count !== undefined && listing.bids_count > 0 && (
          <Badge variant="secondary">
            {listing.bids_count} bid{listing.bids_count !== 1 ? 's' : ''}
          </Badge>
        )}
        <Badge variant={listing.status === 'open' ? 'default' : 'outline'}>
          {listing.status === 'open' ? (
            <><Clock className="h-3 w-3 mr-1" /> Open</>
          ) : (
            <><CheckCircle className="h-3 w-3 mr-1" /> Resolved</>
          )}
        </Badge>
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </Link>
  );
};

const BuyerDashboard = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    resolved: 0,
    bids: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch listings
      const { data: listingsData } = await supabase
        .from('listings')
        .select('*')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (listingsData) {
        // Get bid counts for each listing
        const listingsWithBids = await Promise.all(
          listingsData.map(async (listing) => {
            const { count } = await supabase
              .from('bids')
              .select('*', { count: 'exact', head: true })
              .eq('listing_id', listing.id)
              .eq('payment_status', 'paid');
            
            return { ...listing, bids_count: count || 0 };
          })
        );

        setListings(listingsWithBids);

        // Calculate stats
        const totalBids = listingsWithBids.reduce((acc, l) => acc + (l.bids_count || 0), 0);
        setStats({
          total: listingsData.length,
          open: listingsData.filter(l => l.status === 'open').length,
          resolved: listingsData.filter(l => l.status === 'resolved').length,
          bids: totalBids,
        });
      }

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/50 border-b border-border">
        <div className="container-custom py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">Buyer Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your listings and view bids
              </p>
            </div>
            <Button variant="accent" asChild>
              <Link to="/create-listing">
                <Plus className="mr-2 h-4 w-4" />
                Create Listing
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
            <div className="grid sm:grid-cols-4 gap-4">
              <StatCard label="Total Listings" value={stats.total} icon={FileText} color="product" />
              <StatCard label="Open" value={stats.open} icon={Clock} color="accent" />
              <StatCard label="Resolved" value={stats.resolved} icon={CheckCircle} color="success" />
              <StatCard label="Total Bids" value={stats.bids} icon={MessageSquare} color="service" />
            </div>

            {/* Listings */}
            <div className="bg-card rounded-xl border border-border">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-xl font-semibold">Your Listings</h2>
                <Link to="/my-listings" className="text-sm text-primary hover:underline">
                  View All
                </Link>
              </div>
              
              <div className="p-4">
                {listings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex p-4 rounded-full bg-muted mb-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-2">No listings yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first listing to start receiving bids.
                    </p>
                    <Button variant="accent" asChild>
                      <Link to="/create-listing">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Listing
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {listings.slice(0, 5).map((listing) => (
                      <ListingRow key={listing.id} listing={listing} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button variant="product" className="w-full justify-start" asChild>
                  <Link to="/create-listing?type=product">
                    <Package className="mr-2 h-4 w-4" />
                    Request a Product
                  </Link>
                </Button>
                <Button variant="service" className="w-full justify-start" asChild>
                  <Link to="/create-listing?type=service">
                    <Wrench className="mr-2 h-4 w-4" />
                    Request a Service
                  </Link>
                </Button>
              </div>
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

export default BuyerDashboard;

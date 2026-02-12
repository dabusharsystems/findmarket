import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Package, 
  Wrench, 
  MapPin, 
  Calendar, 
  Clock,
  DollarSign,
  MessageSquare,
  CheckCircle,
  ArrowLeft,
  Loader2,
  Send,
  ImageIcon,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { ImageUpload } from '@/components/ImageUpload';
import { AccessFeeModal } from '@/components/AccessFeeModal';
import { calculateBidFee, formatFee, BidFeeInfo } from '@/lib/bidFees';
import { BidCard } from '@/components/negotiation/BidCard';
import { initiatePayment } from '@/lib/payment';

interface Listing {
  id: string;
  title: string;
  description: string;
  listing_type: 'product' | 'service';
  status: 'open' | 'resolved';
  condition: 'new' | 'used' | 'any' | null;
  required_date: string | null;
  budget_min: number | null;
  budget_max: number | null;
  location: string | null;
  images: string[] | null;
  created_at: string;
  buyer_id: string;
  category_id: string | null;
  categories?: { name: string; icon: string | null };
}

interface Bid {
  id: string;
  price: number;
  message: string;
  estimated_time: string | null;
  payment_status: 'pending' | 'paid' | 'failed';
  negotiation_status: string | null;
  bid_fee: number | null;
  images: string[] | null;
  created_at: string;
  seller_id: string;
  listing_id: string;
  seller_location: string | null;
  delivery_options: string | null;
  availability: string | null;
  offer_valid_until: string | null;
  profiles?: {
    name: string;
    avatar_url: string | null;
    trust_level?: string;
    average_rating?: number;
    total_connections?: number;
  };
}

interface Connection {
  id: string;
  seller_id: string;
}

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { toast } = useToast();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [feeModalOpen, setFeeModalOpen] = useState(false);

  // Bid form state
  const [bidPrice, setBidPrice] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [bidEstimatedTime, setBidEstimatedTime] = useState('');
  const [bidImages, setBidImages] = useState<string[]>([]);

  const isOwner = user?.id === listing?.buyer_id;
  const isSeller = role === 'seller';

  // Calculate bid fee based on listing budget
  const bidFeeInfo: BidFeeInfo = useMemo(() => {
    if (!listing) return { 
      fee: 20, 
      tier: 'Basic', 
      budgetRange: '0 – 2,000 KES',
      maxPercentage: '1.0%',
      typicalCategory: 'Errands, small accessories, basic repairs',
    };
    return calculateBidFee(listing.budget_max, listing.budget_min);
  }, [listing]);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;

      // Fetch listing with category
      const { data: listingData, error } = await supabase
        .from('listings')
        .select('*, categories(name, icon)')
        .eq('id', id)
        .single();

      if (error || !listingData) {
        toast({
          title: 'Error',
          description: 'Listing not found',
          variant: 'destructive',
        });
        navigate('/browse');
        return;
      }

      setListing(listingData);

      // Fetch bids
      const { data: bidsData } = await supabase
        .from('bids')
        .select('*')
        .eq('listing_id', id)
        .order('created_at', { ascending: false });

      if (bidsData) {
        // Fetch profiles for each bid
        const bidsWithProfiles = await Promise.all(
          bidsData.map(async (bid) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('name, avatar_url, trust_level, average_rating, total_connections')
              .eq('id', bid.seller_id)
              .single();
            return { 
              ...bid, 
              listing_id: id,
              profiles: profile || undefined
            };
          })
        );
        setBids(bidsWithProfiles as Bid[]);
      }

      // Fetch connections for this listing
      const { data: connectionsData } = await supabase
        .from('connections')
        .select('id, seller_id')
        .eq('listing_id', id);

      if (connectionsData) {
        setConnections(connectionsData);
      }

      setLoading(false);
    };

    fetchListing();
  }, [id, navigate, toast]);

  const handleConnect = async (bidId: string) => {
    if (!user || !listing) return;

    const bid = bids.find(b => b.id === bidId);
    if (!bid) return;

    try {
      const { error } = await supabase
        .from('connections')
        .insert({
          listing_id: listing.id,
          buyer_id: user.id,
          seller_id: bid.seller_id,
          bid_id: bidId,
        });

      if (error) throw error;

      // Create notification for seller
      await supabase.rpc('create_notification', {
        _user_id: bid.seller_id,
        _type: 'connection_made',
        _title: 'New Connection!',
        _message: `A buyer has connected with you on "${listing.title}". You can now view their contact details.`,
        _metadata: { listing_id: listing.id, bid_id: bidId },
      });

      setConnections(prev => [...prev, { id: crypto.randomUUID(), seller_id: bid.seller_id }]);

      toast({
        title: 'Connected!',
        description: 'Your contact information has been shared with the seller.',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to connect';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const handleStartNegotiation = async (bidId: string) => {
    // This is handled within the BidCard component
    toast({
      title: 'Counter Offer',
      description: 'Expand the bid card to make a counter offer.',
    });
  };

  // Opens the fee confirmation modal when bid form is valid
  const handlePreSubmitBid = () => {
    if (!bidPrice || !bidMessage) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in price and message',
        variant: 'destructive',
      });
      return;
    }
    setFeeModalOpen(true);
  };

  const handleSubmitBid = async () => {
    if (!user || !listing || !bidPrice || !bidMessage) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in price and message',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      // 1. Insert bid with pending status
      const { data: bid, error } = await supabase
        .from('bids')
        .insert({
          listing_id: listing.id,
          seller_id: user.id,
          price: parseFloat(bidPrice),
          message: bidMessage,
          estimated_time: bidEstimatedTime || null,
          images: bidImages.length > 0 ? bidImages : null,
          payment_method: 'single_bid',
          bid_fee: bidFeeInfo.fee,
        })
        .select()
        .single();

      if (error) throw error;

      // Fetch user profile (for email/name)
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, email, phone, avatar_url, trust_level, average_rating, total_connections')
        .eq('id', user.id)
        .single();

      // 2. Initiate payment & redirect to Flutterwave
      const { paymentLink } = await initiatePayment({
        bidId: bid.id,
        amount: bidFeeInfo.fee,
        email: profile?.email || user.email || '',
        name: profile?.name || 'Seller',
        phone: profile?.phone || undefined,
      });

      // Add to local state for immediate feedback
      const bidWithProfile: Bid = { 
        ...bid, 
        listing_id: listing.id,
        profiles: profile || undefined
      };
      setBids(prev => [bidWithProfile, ...prev]);
      setBidDialogOpen(false);
      setFeeModalOpen(false);
      setBidPrice('');
      setBidMessage('');
      setBidEstimatedTime('');
      setBidImages([]);

      // Redirect to payment
      window.location.href = paymentLink;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to submit bid';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      setSubmitting(false);
    }
  };

  // Retry payment for pending/failed bid
  const handleRetryPayment = async (bid: Bid) => {
    if (!user) return;
    setSubmitting(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, email, phone')
        .eq('id', user.id)
        .single();

      const { paymentLink } = await initiatePayment({
        bidId: bid.id,
        amount: bid.bid_fee || bidFeeInfo.fee,
        email: profile?.email || user.email || '',
        name: profile?.name || 'Seller',
        phone: profile?.phone || undefined,
      });

      window.location.href = paymentLink;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to initiate payment';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      setSubmitting(false);
    }
  };

  const handleResolveListing = async () => {
    if (!listing) return;

    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: 'resolved' })
        .eq('id', listing.id);

      if (error) throw error;

      setListing(prev => prev ? { ...prev, status: 'resolved' } : null);

      toast({
        title: 'Listing resolved',
        description: 'Your listing has been marked as resolved.',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to resolve listing';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  // Filter bids based on user role:
  // - Buyers see only paid bids
  // - Sellers see their own bids (any status) + other paid bids
  const visibleBids = useMemo(() => {
    if (!user) return bids.filter(b => b.payment_status === 'paid');
    
    return bids.filter(bid => {
      // Owner (buyer) sees only paid bids
      if (isOwner) return bid.payment_status === 'paid';
      
      // Seller sees their own bids (any status) for this listing
      if (bid.seller_id === user.id) return true;
      
      // Other sellers see only paid bids
      return bid.payment_status === 'paid';
    });
  }, [bids, user, isOwner]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!listing) {
    return null;
  }

  const isProduct = listing.listing_type === 'product';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className={`${isProduct ? 'bg-product/5' : 'bg-service/5'} border-b border-border`}>
        <div className="container-custom py-8">
          <Link
            to={isOwner ? '/dashboard/buyer' : '/browse'}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {isOwner ? 'Back to Dashboard' : 'Back to Browse'}
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge variant={isProduct ? 'product' : 'service'}>
                  {isProduct ? (
                    <><Package className="h-3 w-3 mr-1" /> Product</>
                  ) : (
                    <><Wrench className="h-3 w-3 mr-1" /> Service</>
                  )}
                </Badge>
                {listing.categories && (
                  <Badge variant="outline">{listing.categories.name}</Badge>
                )}
                <Badge variant={listing.status === 'open' ? 'default' : 'secondary'}>
                  {listing.status === 'open' ? 'Open' : 'Resolved'}
                </Badge>
              </div>

              <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {listing.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {listing.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Posted {new Date(listing.created_at).toLocaleDateString()}
                </span>
                {listing.condition && (
                  <span className="flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    Condition: {listing.condition}
                  </span>
                )}
                {listing.required_date && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Needed by: {new Date(listing.required_date).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {listing.budget_max && (
              <div className="bg-card rounded-xl border border-border p-4 min-w-[200px]">
                <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                  Target Budget
                  <Badge variant="outline" className="text-xs">Negotiable</Badge>
                </div>
                <div className="text-2xl font-bold">
                  KES {listing.budget_max.toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Listing Images */}
            {listing.images && listing.images.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Reference Images
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {listing.images.map((image, index) => (
                    <a
                      key={index}
                      href={image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aspect-square rounded-lg overflow-hidden border border-border hover:opacity-90 transition-opacity"
                    >
                      <img
                        src={image}
                        alt={`Reference ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>

            {/* Bids Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  Offers ({visibleBids.length})
                </h2>
                {isSeller && listing.status === 'open' && !isOwner && (
                  <>
                    <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="accent">
                          <Send className="mr-2 h-4 w-4" />
                          Submit Offer
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Submit Your Offer</DialogTitle>
                          <DialogDescription>
                            Complete the form below to submit your offer to the buyer.
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4">
                          <div>
                            <Label htmlFor="price">Your Price (KES) *</Label>
                            <Input
                              id="price"
                              type="number"
                              placeholder="e.g. 5000"
                              value={bidPrice}
                              onChange={(e) => setBidPrice(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              You can offer above or below the target budget.
                            </p>
                          </div>

                          <div>
                            <Label htmlFor="estimated_time">Estimated Delivery Time</Label>
                            <Input
                              id="estimated_time"
                              placeholder="e.g. 3-5 days"
                              value={bidEstimatedTime}
                              onChange={(e) => setBidEstimatedTime(e.target.value)}
                            />
                          </div>

                          <div>
                            <Label htmlFor="message">Message to Buyer * (min 30 chars)</Label>
                            <Textarea
                              id="message"
                              placeholder="Describe your offer, experience, and why you're the best fit..."
                              rows={4}
                              value={bidMessage}
                              onChange={(e) => setBidMessage(e.target.value)}
                            />
                            <div className="text-xs text-muted-foreground mt-1">
                              {bidMessage.length}/30 characters minimum
                            </div>
                          </div>

                          {/* Bid Images */}
                          {user && (
                            <div>
                              <Label>Attach Photos (Optional)</Label>
                              <p className="text-sm text-muted-foreground mb-2">
                                Add photos of your product or previous work.
                              </p>
                              <ImageUpload
                                bucket="bid-images"
                                userId={user.id}
                                images={bidImages}
                                onImagesChange={setBidImages}
                                maxImages={3}
                              />
                            </div>
                          )}

                          {/* Access Fee Info */}
                          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <CreditCard className="h-4 w-4 text-accent" />
                              <span className="font-medium text-sm">Access Fee Required</span>
                            </div>
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-muted-foreground">Offer Submission Fee:</span>
                              <span className="font-bold text-lg text-accent">{formatFee(bidFeeInfo.fee)}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              <span className="font-medium">Fee tier:</span> {bidFeeInfo.tier} ({bidFeeInfo.budgetRange})
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              One-time fee. Your offer will be visible after payment. Counter offers are free.
                            </p>
                          </div>
                        </div>

                        <DialogFooter>
                          <Button variant="outline" onClick={() => setBidDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button 
                            variant="accent" 
                            onClick={handlePreSubmitBid}
                            disabled={!bidPrice || !bidMessage || bidMessage.length < 30}
                          >
                            Continue to Payment
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* Access Fee Confirmation Modal */}
                    <AccessFeeModal
                      open={feeModalOpen}
                      onOpenChange={setFeeModalOpen}
                      feeInfo={bidFeeInfo}
                      listingTitle={listing.title}
                      onConfirm={handleSubmitBid}
                      loading={submitting}
                    />
                  </>
                )}
              </div>

              {visibleBids.length === 0 ? (
                <div className="bg-card rounded-xl border border-border p-12 text-center">
                  <div className="inline-flex p-4 rounded-full bg-muted mb-4">
                    <MessageSquare className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">No offers yet</h3>
                  <p className="text-muted-foreground">
                    {isOwner 
                      ? 'Sellers will submit offers on your listing soon.'
                      : 'Be the first to submit an offer!'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {visibleBids.map((bid) => (
                    <div key={bid.id}>
                      {/* Show pending/failed status for seller's own bids with retry button */}
                      {bid.seller_id === user?.id && (bid.payment_status === 'pending' || bid.payment_status === 'failed') && (
                        <div className="mb-2 p-3 bg-warning/10 border border-warning/20 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="text-sm">
                            <span className="font-medium text-warning">
                              {bid.payment_status === 'failed' ? '❌ Payment Failed' : '⏳ Payment Pending'}
                            </span>
                            <span className="text-muted-foreground ml-2">
                              Complete payment to make your offer visible to the buyer.
                            </span>
                          </div>
                          <Button 
                            size="sm" 
                            variant="accent"
                            onClick={() => handleRetryPayment(bid)}
                            disabled={submitting}
                          >
                            <CreditCard className="h-4 w-4 mr-1" />
                            {bid.payment_status === 'failed' ? 'Retry Payment' : 'Pay Now'}
                          </Button>
                        </div>
                      )}
                      <BidCard
                        bid={bid}
                        currentUserId={user?.id || ''}
                        isBuyer={isOwner}
                        onConnect={handleConnect}
                        onStartNegotiation={handleStartNegotiation}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            {isOwner && listing.status === 'open' && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold mb-4">Actions</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full" asChild>
                    <Link to={`/create-listing?edit=${listing.id}`}>
                      Edit Listing
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="default" className="w-full">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Resolved
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Mark listing as resolved?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will close your listing and stop accepting new offers.
                          Existing offers will remain visible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleResolveListing}>
                          Yes, Resolve
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold mb-4">Tips for {isOwner ? 'Buyers' : 'Sellers'}</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {isOwner ? (
                  <>
                    <li className="flex gap-2">
                      <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                      Review all offers and make counter offers if needed
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                      Your contact info is only shared when you accept
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                      Mark as resolved when you've found what you need
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex gap-2">
                      <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                      Write a compelling message that stands out
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                      Be competitive but fair with your pricing
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                      Counter offers are free after your first paid offer
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;

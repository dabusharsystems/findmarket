import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  User, 
  MapPin, 
  Truck, 
  Clock,
  Star,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { NegotiationThread } from './NegotiationThread';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Bid {
  id: string;
  price: number;
  message: string;
  seller_id: string;
  listing_id: string;
  seller_location: string | null;
  delivery_options: string | null;
  availability: string | null;
  offer_valid_until: string | null;
  negotiation_status: string | null;
  created_at: string;
  images: string[] | null;
  profiles?: {
    name: string;
    avatar_url: string | null;
    trust_level?: string;
    average_rating?: number;
    total_connections?: number;
  };
}

interface Negotiation {
  id: string;
  bid_id: string;
  listing_id: string;
  from_user_id: string;
  to_user_id: string;
  price: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired';
  round_number: number;
  created_at: string;
  responded_at: string | null;
}

interface BidCardProps {
  bid: Bid;
  currentUserId: string;
  isBuyer: boolean;
  onConnect?: (bidId: string) => void;
  onStartNegotiation?: (bidId: string) => void;
}

export const BidCard = ({ 
  bid, 
  currentUserId, 
  isBuyer,
  onConnect,
  onStartNegotiation 
}: BidCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const trustLevel = bid.profiles?.trust_level || 'standard';
  const avgRating = bid.profiles?.average_rating || 0;
  const totalConnections = bid.profiles?.total_connections || 0;

  useEffect(() => {
    if (isExpanded) {
      fetchNegotiations();
    }
  }, [isExpanded]);

  const fetchNegotiations = async () => {
    const { data } = await supabase
      .from('negotiations')
      .select('*')
      .eq('bid_id', bid.id)
      .order('created_at', { ascending: true });
    
    if (data) {
      setNegotiations(data as Negotiation[]);
    }
  };

  const handleAccept = async (negotiationId: string) => {
    setLoading(true);
    const { error } = await supabase
      .from('negotiations')
      .update({ status: 'accepted', responded_at: new Date().toISOString() })
      .eq('id', negotiationId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to accept offer', variant: 'destructive' });
    } else {
      toast({ title: 'Offer Accepted!', description: 'Contact details have been shared.' });
      fetchNegotiations();
    }
    setLoading(false);
  };

  const handleReject = async (negotiationId: string) => {
    setLoading(true);
    const { error } = await supabase
      .from('negotiations')
      .update({ status: 'rejected', responded_at: new Date().toISOString() })
      .eq('id', negotiationId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to reject offer', variant: 'destructive' });
    } else {
      toast({ title: 'Offer Rejected', description: 'The negotiation has ended.' });
      fetchNegotiations();
    }
    setLoading(false);
  };

  const handleCounterOffer = async (price: number, message: string) => {
    setLoading(true);
    const latestNeg = negotiations[negotiations.length - 1];
    const toUserId = latestNeg?.from_user_id;

    const { error } = await supabase.from('negotiations').insert({
      bid_id: bid.id,
      listing_id: bid.listing_id,
      from_user_id: currentUserId,
      to_user_id: toUserId || bid.seller_id,
      price,
      message,
    });

    // Update previous negotiation status
    if (latestNeg) {
      await supabase
        .from('negotiations')
        .update({ status: 'countered', responded_at: new Date().toISOString() })
        .eq('id', latestNeg.id);
    }

    if (error) {
      toast({ title: 'Error', description: 'Failed to send counter offer', variant: 'destructive' });
    } else {
      toast({ title: 'Counter Offer Sent!', description: 'Waiting for response.' });
      fetchNegotiations();
    }
    setLoading(false);
  };

  const getTrustBadge = () => {
    switch (trustLevel) {
      case 'verified':
        return (
          <Badge className="bg-success/10 text-success border-success/20">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      case 'trusted':
        return (
          <Badge className="bg-accent/10 text-accent border-accent/20">
            <Shield className="h-3 w-3 mr-1" />
            Trusted
          </Badge>
        );
      case 'low':
        return (
          <Badge variant="outline" className="text-destructive border-destructive/50">
            <ShieldAlert className="h-3 w-3 mr-1" />
            Low Rated
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Shield className="h-3 w-3 mr-1" />
            Standard
          </Badge>
        );
    }
  };

  const hasActiveNegotiation = negotiations.some(n => n.status === 'pending');
  const isAccepted = bid.negotiation_status === 'accepted' || negotiations.some(n => n.status === 'accepted');

  return (
    <Card className="border-border hover:border-accent/30 transition-colors">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              {bid.profiles?.avatar_url ? (
                <img src={bid.profiles.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <User className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{bid.profiles?.name || 'Seller'}</span>
                {getTrustBadge()}
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                {avgRating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    {avgRating.toFixed(1)}
                  </span>
                )}
                {totalConnections > 0 && (
                  <span>{totalConnections} deals</span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-accent">
              KES {bid.price.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(bid.created_at), { addSuffix: true })}
            </div>
          </div>
        </div>

        {/* Message */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{bid.message}</p>

        {/* Details Row */}
        <div className="flex flex-wrap gap-3 mb-4 text-sm">
          {bid.seller_location && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {bid.seller_location}
            </span>
          )}
          {bid.delivery_options && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Truck className="h-3 w-3" />
              {bid.delivery_options}
            </span>
          )}
          {bid.availability && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              {bid.availability}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {isBuyer && !isAccepted && (
            <>
              {!hasActiveNegotiation && negotiations.length === 0 ? (
                <>
                  <Button 
                    size="sm" 
                    onClick={() => onConnect?.(bid.id)}
                  >
                    Accept & Connect
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      onStartNegotiation?.(bid.id);
                      setIsExpanded(true);
                    }}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Counter Offer
                  </Button>
                </>
              ) : (
                <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className="w-full">
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          Hide Negotiation
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          View Negotiation ({negotiations.length} messages)
                        </>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4">
                    <NegotiationThread
                      negotiations={negotiations}
                      currentUserId={currentUserId}
                      bidPrice={bid.price}
                      onAccept={handleAccept}
                      onReject={handleReject}
                      onCounterOffer={handleCounterOffer}
                      isLoading={loading}
                    />
                  </CollapsibleContent>
                </Collapsible>
              )}
            </>
          )}

          {!isBuyer && (
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className="w-full">
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Hide Negotiation
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      {negotiations.length > 0 ? `View Negotiation (${negotiations.length})` : 'View Details'}
                    </>
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                {negotiations.length > 0 ? (
                  <NegotiationThread
                    negotiations={negotiations}
                    currentUserId={currentUserId}
                    bidPrice={bid.price}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    onCounterOffer={handleCounterOffer}
                    isLoading={loading}
                  />
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    Waiting for buyer response...
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>

        {isAccepted && (
          <div className="mt-4 p-3 rounded-lg bg-success/10 border border-success/20 text-center">
            <span className="text-success font-medium">
              🎉 Deal Completed! Contact details shared.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

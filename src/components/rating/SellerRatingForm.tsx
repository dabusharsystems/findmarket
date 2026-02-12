import { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SellerRatingFormProps {
  sellerId: string;
  connectionId: string;
  sellerName: string;
  buyerId: string;
  onComplete: () => void;
}

export const SellerRatingForm = ({
  sellerId,
  connectionId,
  sellerName,
  buyerId,
  onComplete,
}: SellerRatingFormProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({ title: 'Rating Required', description: 'Please select a star rating', variant: 'destructive' });
      return;
    }

    setLoading(true);

    // Insert rating into seller_ratings table
    const { error } = await supabase
      .from('seller_ratings' as any)
      .insert({
        seller_id: sellerId,
        buyer_id: buyerId,
        connection_id: connectionId,
        rating,
        review: review.trim() || null,
      });

    if (error) {
      toast({ title: 'Error', description: 'Failed to submit rating. You may have already rated this seller.', variant: 'destructive' });
    } else {
      toast({ title: 'Thank You!', description: `Your ${rating}-star rating has been recorded.` });
      onComplete();
    }
    
    setLoading(false);
  };

  return (
    <Card className="border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-accent" />
          Rate Your Experience
        </CardTitle>
        <CardDescription>
          How was your experience with {sellerName}?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label>Rating *</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star 
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'fill-accent text-accent'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <Label htmlFor="review">Review (Optional)</Label>
            <Textarea
              id="review"
              placeholder="Share details about your experience..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading || rating === 0}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Rating'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

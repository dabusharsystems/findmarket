import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Wrench, MapPin, Clock, ArrowRight, TrendingUp, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface Listing {
  id: string;
  title: string;
  description: string;
  listing_type: 'product' | 'service';
  location: string | null;
  budget_min: number | null;
  budget_max: number | null;
  created_at: string;
  categories?: { name: string } | null;
}

interface Category {
  id: string;
  name: string;
  type: 'product' | 'service';
  icon: string | null;
}

const ListingCard = ({ listing }: { listing: Listing }) => {
  const isProduct = listing.listing_type === 'product';
  
  return (
    <Link
      to={`/listing/${listing.id}`}
      className="group bg-card rounded-xl border border-border p-5 hover:shadow-floating transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        <div className={`shrink-0 p-3 rounded-lg ${isProduct ? 'bg-product/10' : 'bg-service/10'}`}>
          {isProduct ? (
            <Package className="h-5 w-5 text-product" />
          ) : (
            <Wrench className="h-5 w-5 text-service" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={isProduct ? 'product' : 'service'} className="text-xs">
              {isProduct ? 'Product' : 'Service'}
            </Badge>
            {listing.categories && (
              <Badge variant="outline" className="text-xs">
                {listing.categories.name}
              </Badge>
            )}
          </div>
          
          <h3 className="font-semibold mb-1 line-clamp-1 group-hover:text-primary transition-colors">
            {listing.title}
          </h3>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {listing.description}
          </p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {listing.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {listing.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(listing.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {(listing.budget_min || listing.budget_max) && (
          <div className="text-right shrink-0">
            <p className="text-xs text-muted-foreground mb-1">Budget</p>
            <p className="font-bold text-sm">
              {listing.budget_min && listing.budget_max ? (
                <>KES {listing.budget_min.toLocaleString()}</>
              ) : listing.budget_max ? (
                <>Up to KES {listing.budget_max.toLocaleString()}</>
              ) : (
                <>From KES {listing.budget_min?.toLocaleString()}</>
              )}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
};

const CategoryPill = ({ category, isActive, onClick }: { 
  category: Category; 
  isActive: boolean; 
  onClick: () => void 
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
      isActive
        ? category.type === 'product'
          ? 'bg-product text-white'
          : 'bg-service text-white'
        : 'bg-muted hover:bg-muted/80 text-muted-foreground'
    }`}
  >
    {category.name}
  </button>
);

export const FeaturedListings = () => {
  const [newListings, setNewListings] = useState<Listing[]>([]);
  const [topListings, setTopListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryListings, setCategoryListings] = useState<Listing[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch new listings (most recent)
      const { data: newData } = await supabase
        .from('listings')
        .select('*, categories(name)')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(4);

      if (newData) setNewListings(newData);

      // Fetch categories
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (catData) {
        setCategories(catData);
        if (catData.length > 0) {
          setSelectedCategory(catData[0].id);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchCategoryListings = async () => {
      if (!selectedCategory) return;

      const { data } = await supabase
        .from('listings')
        .select('*, categories(name)')
        .eq('status', 'open')
        .eq('category_id', selectedCategory)
        .order('created_at', { ascending: false })
        .limit(4);

      if (data) setCategoryListings(data);
    };

    fetchCategoryListings();
  }, [selectedCategory]);

  if (loading) return null;

  return (
    <>
      {/* New Listings Section */}
      {newListings.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Sparkles className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">New Listings</h2>
                  <p className="text-muted-foreground text-sm">Fresh requests looking for sellers</p>
                </div>
              </div>
              <Button variant="ghost" asChild>
                <Link to="/browse" className="flex items-center gap-2">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {newListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Browse by Category */}
      {categories.length > 0 && (
        <section className="py-16 bg-background">
          <div className="container-custom">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Browse by Category</h2>
                <p className="text-muted-foreground text-sm">Find listings in your area of interest</p>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.slice(0, 10).map((category) => (
                <CategoryPill
                  key={category.id}
                  category={category}
                  isActive={selectedCategory === category.id}
                  onClick={() => setSelectedCategory(category.id)}
                />
              ))}
            </div>

            {/* Category Listings */}
            {categoryListings.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {categoryListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-xl">
                <p className="text-muted-foreground">No listings in this category yet.</p>
                <Button variant="accent" className="mt-4" asChild>
                  <Link to="/create-listing">Be the first to post</Link>
                </Button>
              </div>
            )}

            <div className="text-center mt-8">
              <Button variant="outline" asChild>
                <Link to="/browse" className="flex items-center gap-2">
                  Browse All Listings
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

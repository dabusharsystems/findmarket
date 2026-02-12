import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Package, 
  Wrench, 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  DollarSign,
  ChevronRight,
  Loader2
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
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
  type: 'product' | 'service';
  icon: string;
}

interface Listing {
  id: string;
  title: string;
  description: string;
  listing_type: 'product' | 'service';
  category_id: string;
  status: 'open' | 'resolved';
  condition: string | null;
  required_date: string | null;
  budget_min: number | null;
  budget_max: number | null;
  location: string | null;
  created_at: string;
  categories?: Category;
}

const ListingCard = ({ listing }: { listing: Listing }) => {
  const isProduct = listing.listing_type === 'product';
  
  return (
    <Link
      to={`/listing/${listing.id}`}
      className="group block bg-card rounded-xl border border-border p-6 hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className={`p-3 rounded-lg ${isProduct ? 'bg-product/10' : 'bg-service/10'}`}>
          {isProduct ? (
            <Package className={`h-5 w-5 text-product`} />
          ) : (
            <Wrench className={`h-5 w-5 text-service`} />
          )}
        </div>
        <Badge variant={listing.status === 'open' ? 'default' : 'secondary'}>
          {listing.status}
        </Badge>
      </div>

      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
        {listing.title}
      </h3>
      
      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
        {listing.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {listing.categories && (
          <Badge variant="outline" className={isProduct ? 'border-product/30 text-product' : 'border-service/30 text-service'}>
            {listing.categories.name}
          </Badge>
        )}
        {listing.condition && (
          <Badge variant="outline" className="capitalize">
            {listing.condition}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        {listing.budget_min && listing.budget_max && (
          <span className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            KES {listing.budget_min.toLocaleString()} - {listing.budget_max.toLocaleString()}
          </span>
        )}
        {listing.location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {listing.location}
          </span>
        )}
        {listing.required_date && (
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(listing.required_date).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Posted {new Date(listing.created_at).toLocaleDateString()}
        </span>
        <span className={`flex items-center gap-1 text-sm font-medium ${isProduct ? 'text-product' : 'text-service'} group-hover:gap-2 transition-all`}>
          View Details
          <ChevronRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
};

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const typeParam = searchParams.get('type') as 'product' | 'service' | null;
  
  const [listingType, setListingType] = useState<'all' | 'product' | 'service'>(typeParam || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (data) setCategories(data);
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      
      let query = supabase
        .from('listings')
        .select('*, categories(*)')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (listingType !== 'all') {
        query = query.eq('listing_type', listingType);
      }

      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data } = await query;
      
      if (data) setListings(data);
      setLoading(false);
    };

    fetchListings();
  }, [listingType, selectedCategory, searchQuery]);

  const filteredCategories = categories.filter(
    cat => listingType === 'all' || cat.type === listingType
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/50 border-b border-border">
        <div className="container-custom py-8">
          <h1 className="text-3xl font-bold mb-2">Browse Listings</h1>
          <p className="text-muted-foreground">
            Find buyer requests and submit your best offers
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="container-custom py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Type Toggle */}
            <div className="flex rounded-lg border border-border p-1 bg-muted/50">
              <button
                onClick={() => {
                  setListingType('all');
                  setSearchParams({});
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  listingType === 'all' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                }`}
              >
                All
              </button>
              <button
                onClick={() => {
                  setListingType('product');
                  setSearchParams({ type: 'product' });
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  listingType === 'product' ? 'bg-product text-product-foreground shadow-sm' : 'hover:bg-product-light'
                }`}
              >
                <Package className="h-4 w-4" />
                Products
              </button>
              <button
                onClick={() => {
                  setListingType('service');
                  setSearchParams({ type: 'service' });
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  listingType === 'service' ? 'bg-service text-service-foreground shadow-sm' : 'hover:bg-service-light'
                }`}
              >
                <Wrench className="h-4 w-4" />
                Services
              </button>
            </div>

            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="container-custom py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex p-4 rounded-full bg-muted mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No listings found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters or search query
            </p>
            <Button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {listings.length} listing{listings.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Browse;

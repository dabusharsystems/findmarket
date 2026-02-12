import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  MoreHorizontal,
  Eye,
  Flag,
  CheckCircle,
  Clock,
  Package,
  Wrench,
  RefreshCw,
  AlertTriangle,
  Edit,
  Trash2,
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

interface ListingWithBuyer {
  id: string;
  title: string;
  listing_type: 'product' | 'service';
  status: 'open' | 'resolved';
  is_flagged: boolean | null;
  flagged_reason: string | null;
  budget_min: number | null;
  budget_max: number | null;
  created_at: string | null;
  buyer_name: string;
  buyer_email: string;
  bid_count: number;
}

interface Category {
  id: string;
  name: string;
  type: 'product' | 'service';
}

export const ListingManagement = () => {
  const [listings, setListings] = useState<ListingWithBuyer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedListing, setSelectedListing] = useState<ListingWithBuyer | null>(null);
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [editBudgetMin, setEditBudgetMin] = useState('');
  const [editBudgetMax, setEditBudgetMax] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchListings();
    fetchCategories();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const { data: listingsData, error } = await supabase
        .from('listings')
        .select('id, title, listing_type, status, is_flagged, flagged_reason, budget_min, budget_max, created_at, buyer_id, category_id')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch buyer profiles and bid counts
      const listingsWithDetails = await Promise.all(
        (listingsData || []).map(async (listing) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, email')
            .eq('id', listing.buyer_id)
            .single();

          const { count: bidCount } = await supabase
            .from('bids')
            .select('*', { count: 'exact', head: true })
            .eq('listing_id', listing.id);

          return {
            ...listing,
            buyer_name: profile?.name || 'Unknown',
            buyer_email: profile?.email || '',
            bid_count: bidCount || 0,
          } as ListingWithBuyer;
        })
      );

      setListings(listingsWithDetails);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load listings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, name, type')
      .order('name');
    
    if (data) setCategories(data);
  };

  const handleFlag = async () => {
    if (!selectedListing) return;
    setActionLoading(true);

    try {
      const { error } = await supabase
        .from('listings')
        .update({
          is_flagged: true,
          flagged_at: new Date().toISOString(),
          flagged_reason: flagReason,
        })
        .eq('id', selectedListing.id);

      if (error) throw error;

      toast({
        title: 'Listing Flagged',
        description: 'The listing has been flagged for review',
      });

      setShowFlagDialog(false);
      setFlagReason('');
      fetchListings();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to flag listing',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnflag = async (listing: ListingWithBuyer) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({
          is_flagged: false,
          flagged_at: null,
          flagged_reason: null,
        })
        .eq('id', listing.id);

      if (error) throw error;

      toast({
        title: 'Flag Removed',
        description: 'The listing flag has been removed',
      });

      fetchListings();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove flag',
        variant: 'destructive',
      });
    }
  };

  const handleEditSave = async () => {
    if (!selectedListing) return;
    setActionLoading(true);

    try {
      const updates: Record<string, any> = {};
      
      if (editBudgetMin) updates.budget_min = parseFloat(editBudgetMin);
      if (editBudgetMax) updates.budget_max = parseFloat(editBudgetMax);
      if (editCategory) updates.category_id = editCategory;

      const { error } = await supabase
        .from('listings')
        .update(updates)
        .eq('id', selectedListing.id);

      if (error) throw error;

      toast({
        title: 'Listing Updated',
        description: 'The listing has been updated successfully',
      });

      setShowEditDialog(false);
      fetchListings();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update listing',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async (listing: ListingWithBuyer) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: 'resolved' })
        .eq('id', listing.id);

      if (error) throw error;

      toast({
        title: 'Listing Resolved',
        description: 'The listing has been marked as resolved',
      });

      fetchListings();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resolve listing',
        variant: 'destructive',
      });
    }
  };

  const handleReopen = async (listing: ListingWithBuyer) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: 'open' })
        .eq('id', listing.id);

      if (error) throw error;

      toast({
        title: 'Listing Reopened',
        description: 'The listing is now open again',
      });

      fetchListings();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reopen listing',
        variant: 'destructive',
      });
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(search.toLowerCase()) ||
      listing.buyer_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'flagged' ? listing.is_flagged : listing.status === statusFilter);
    const matchesType = typeFilter === 'all' || listing.listing_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
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
          Listing Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search listings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="product">Products</SelectItem>
              <SelectItem value="service">Services</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchListings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Listings Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Listing</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bids</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredListings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell>
                    <div className="flex items-start gap-2">
                      {listing.is_flagged && (
                        <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-1" />
                      )}
                      <div>
                        <div className="font-medium">{listing.title}</div>
                        <Badge variant={listing.listing_type === 'product' ? 'product' : 'service'} className="mt-1">
                          {listing.listing_type === 'product' ? (
                            <><Package className="h-3 w-3 mr-1" />Product</>
                          ) : (
                            <><Wrench className="h-3 w-3 mr-1" />Service</>
                          )}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{listing.buyer_name}</div>
                      <div className="text-sm text-muted-foreground">{listing.buyer_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {listing.budget_min || listing.budget_max ? (
                      <div className="text-sm">
                        KES {listing.budget_min?.toLocaleString() || '0'} - {listing.budget_max?.toLocaleString() || '∞'}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Not set</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant={listing.status === 'open' ? 'default' : 'secondary'}>
                        {listing.status === 'open' ? (
                          <><Clock className="h-3 w-3 mr-1" />Open</>
                        ) : (
                          <><CheckCircle className="h-3 w-3 mr-1" />Resolved</>
                        )}
                      </Badge>
                      {listing.is_flagged && (
                        <Badge variant="destructive">
                          <Flag className="h-3 w-3 mr-1" />Flagged
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{listing.bid_count}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/listing/${listing.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Listing
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedListing(listing);
                            setEditBudgetMin(listing.budget_min?.toString() || '');
                            setEditBudgetMax(listing.budget_max?.toString() || '');
                            setShowEditDialog(true);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {listing.status === 'open' ? (
                          <DropdownMenuItem onClick={() => handleResolve(listing)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark Resolved
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleReopen(listing)}>
                            <Clock className="mr-2 h-4 w-4" />
                            Reopen
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {listing.is_flagged ? (
                          <DropdownMenuItem onClick={() => handleUnflag(listing)}>
                            <CheckCircle className="mr-2 h-4 w-4 text-success" />
                            Remove Flag
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedListing(listing);
                              setShowFlagDialog(true);
                            }}
                            className="text-destructive"
                          >
                            <Flag className="mr-2 h-4 w-4" />
                            Flag Listing
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
          Showing {filteredListings.length} of {listings.length} listings
        </div>

        {/* Flag Dialog */}
        <Dialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Flag Listing</DialogTitle>
              <DialogDescription>
                Flag "{selectedListing?.title}" for review
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Reason for flagging</Label>
                <Textarea
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  placeholder="Enter the reason for flagging this listing..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowFlagDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleFlag}
                disabled={actionLoading || !flagReason}
              >
                {actionLoading ? 'Flagging...' : 'Flag Listing'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Listing</DialogTitle>
              <DialogDescription>
                Modify listing details (admin override)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Budget (KES)</Label>
                  <Input
                    type="number"
                    value={editBudgetMin}
                    onChange={(e) => setEditBudgetMin(e.target.value)}
                    placeholder="Min budget"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Budget (KES)</Label>
                  <Input
                    type="number"
                    value={editBudgetMax}
                    onChange={(e) => setEditBudgetMax(e.target.value)}
                    placeholder="Max budget"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={editCategory} onValueChange={setEditCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter(c => c.type === selectedListing?.listing_type)
                      .map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditSave} disabled={actionLoading}>
                {actionLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

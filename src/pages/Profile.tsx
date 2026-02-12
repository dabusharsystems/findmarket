import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Camera, 
  Loader2, 
  Save,
  ArrowLeft,
  Star,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  trust_level: string | null;
  average_rating: number | null;
  total_connections: number | null;
}

const Profile = () => {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to load profile',
          variant: 'destructive',
        });
        return;
      }

      setProfile(data);
      setName(data.name);
      setPhone(data.phone || '');
      setLoading(false);
    };

    fetchProfile();
  }, [user, toast]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image under 2MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      toast({
        title: 'Upload failed',
        description: uploadError.message,
        variant: 'destructive',
      });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);

    if (updateError) {
      toast({
        title: 'Error',
        description: 'Failed to update avatar',
        variant: 'destructive',
      });
    } else {
      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      toast({
        title: 'Success',
        description: 'Avatar updated successfully',
      });
    }

    setUploading(false);
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({ 
        name: name.trim(),
        phone: phone.trim() || null,
      })
      .eq('id', user.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/50 border-b border-border">
        <div className="container-custom py-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account information
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-xl border border-border p-6 space-y-8">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-1 -right-1 p-2 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{profile?.name}</h2>
                <p className="text-muted-foreground capitalize">{role}</p>
                {/* Trust Badge */}
                <div className="mt-2">
                  {profile?.trust_level === 'verified' && (
                    <Badge className="bg-success/10 text-success border-success/20">
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      Verified Seller
                    </Badge>
                  )}
                  {profile?.trust_level === 'trusted' && (
                    <Badge className="bg-accent/10 text-accent border-accent/20">
                      <Shield className="h-3 w-3 mr-1" />
                      Trusted Seller
                    </Badge>
                  )}
                  {profile?.trust_level === 'low' && (
                    <Badge variant="outline" className="text-destructive border-destructive/50">
                      <ShieldAlert className="h-3 w-3 mr-1" />
                      Low Rated
                    </Badge>
                  )}
                  {(!profile?.trust_level || profile?.trust_level === 'standard') && role === 'seller' && (
                    <Badge variant="outline">
                      <Shield className="h-3 w-3 mr-1" />
                      Standard
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Section (for sellers) */}
            {role === 'seller' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                    <span className="text-2xl font-bold">
                      {profile?.average_rating?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="h-5 w-5 text-accent" />
                    <span className="text-2xl font-bold">
                      {profile?.total_connections || 0}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Completed Deals</p>
                </div>
              </div>
            )}

            {/* Form */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  value={profile?.email || ''}
                  disabled
                  className="h-12 bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254 7XX XXX XXX"
                  className="h-12"
                />
              </div>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full"
              variant="accent"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

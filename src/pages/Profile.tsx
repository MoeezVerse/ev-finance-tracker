import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Camera, Save, User, Mail, Calendar } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { if (user) fetchProfile(); }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('display_name, avatar_url').eq('user_id', user!.id).single();
      if (error) throw error;
      if (data) {
        setDisplayName(data.display_name || '');
        // Use stored avatar, or fall back to Google avatar from user metadata
        const googleAvatar = user!.user_metadata?.avatar_url || user!.user_metadata?.picture;
        setAvatarUrl(data.avatar_url || googleAvatar || null);

        // If profile has no avatar but Google provides one, save it
        if (!data.avatar_url && googleAvatar) {
          await supabase.from('profiles').update({ avatar_url: googleAvatar }).eq('user_id', user!.id);
        }
      }
    } catch (error: any) { console.error('Error fetching profile:', error.message); }
    finally { setLoading(false); }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast({ title: 'Invalid file', description: 'Please upload an image file.', variant: 'destructive' }); return; }
    if (file.size > 2 * 1024 * 1024) { toast({ title: 'File too large', description: 'Please upload an image under 2MB.', variant: 'destructive' }); return; }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user!.id}/avatar.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const urlWithCacheBuster = `${publicUrl}?t=${Date.now()}`;
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: urlWithCacheBuster }).eq('user_id', user!.id);
      if (updateError) throw updateError;
      setAvatarUrl(urlWithCacheBuster);
      toast({ title: 'Avatar updated', description: 'Your profile picture has been changed.' });
    } catch (error: any) { toast({ title: 'Upload failed', description: error.message, variant: 'destructive' }); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').update({ display_name: displayName }).eq('user_id', user!.id);
      if (error) throw error;
      toast({ title: 'Profile updated', description: 'Your display name has been saved.' });
    } catch (error: any) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 sm:p-6 max-w-2xl space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4 py-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/')} className="rounded-xl">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">My Profile</h1>
            <p className="text-muted-foreground text-sm">Manage your account details</p>
          </div>
        </div>

        {/* Avatar Section */}
        <Card className="glass-card">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg text-foreground">Profile Picture</CardTitle>
            <CardDescription>Click on the avatar to change your photo</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="relative cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
              <Avatar className="h-28 w-28 border-4 border-primary/20 shadow-lg shadow-primary/10">
                <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {displayName ? getInitials(displayName) : <User className="h-10 w-10" />}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-foreground/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-8 w-8 text-white" />
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Account Details</CardTitle>
            <CardDescription>View and update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> Display Name</Label>
              <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Enter your name" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> Email</Label>
              <Input value={user?.email || ''} disabled className="h-11 bg-muted/50" />
              <p className="text-xs text-muted-foreground">Email cannot be changed here</p>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /> Member Since</Label>
              <Input value={user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''} disabled className="h-11 bg-muted/50" />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full h-11 font-semibold shadow-lg shadow-primary/20">
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;

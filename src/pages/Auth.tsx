import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { LogIn, UserPlus, Mail, Wallet } from 'lucide-react';

const Auth = () => {
  const { user, loading: authLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const { toast } = useToast();

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
  if (user) return <Navigate to="/" replace />;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (resetMode) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        toast({ title: 'Check your email', description: 'Password reset link has been sent.' });
        setResetMode(false);
      } else if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: 'Welcome back!', description: 'You have been logged in successfully.' });
      } else {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: displayName }, emailRedirectTo: window.location.origin } });
        if (error) throw error;
        toast({ title: 'Account created!', description: 'Please check your email to verify your account.' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-info/5 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md glass-card shadow-2xl animate-scale-in relative">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Wallet className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            FinanceTracker
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {resetMode ? 'Reset your password' : isLogin ? 'Sign in to manage your finances' : 'Create your account'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && !resetMode && (
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" required={!isLogin} className="h-11" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="h-11" />
            </div>
            {!resetMode && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="h-11" />
              </div>
            )}
            <Button type="submit" className="w-full h-11 font-semibold shadow-lg shadow-primary/20" disabled={loading}>
              {loading ? (
                <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
              ) : resetMode ? (
                <><Mail className="mr-2 h-4 w-4" /> Send Reset Link</>
              ) : isLogin ? (
                <><LogIn className="mr-2 h-4 w-4" /> Sign In</>
              ) : (
                <><UserPlus className="mr-2 h-4 w-4" /> Sign Up</>
              )}
            </Button>
          </form>

          {!resetMode && (
            <>
              <div className="flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">or</span>
                <Separator className="flex-1" />
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 font-medium"
                onClick={async () => {
                  const { error } = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
                  if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
                }}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </Button>
            </>
          )}

          <div className="text-center space-y-2 pt-2">
            {!resetMode && (
              <button onClick={() => setResetMode(true)} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Forgot password?
              </button>
            )}
            <div>
              <button
                onClick={() => { setIsLogin(!isLogin); setResetMode(false); }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;

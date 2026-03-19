import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LogIn, UserPlus, Mail } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (resetMode) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast({ title: 'Check your email', description: 'Password reset link has been sent.' });
        setResetMode(false);
      } else if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: 'Welcome back!', description: 'You have been logged in successfully.' });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName },
            emailRedirectTo: window.location.origin,
          },
        });
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-emerald-800">
            FinanceTracker
          </CardTitle>
          <CardDescription className="text-emerald-600">
            {resetMode ? 'Reset your password' : isLogin ? 'Sign in to manage your finances' : 'Create your account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && !resetMode && (
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  required={!isLogin}
                />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            {!resetMode && (
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={loading}
            >
              {loading ? (
                'Loading...'
              ) : resetMode ? (
                <><Mail className="mr-2 h-4 w-4" /> Send Reset Link</>
              ) : isLogin ? (
                <><LogIn className="mr-2 h-4 w-4" /> Sign In</>
              ) : (
                <><UserPlus className="mr-2 h-4 w-4" /> Sign Up</>
              )}
            </Button>
          </form>
          <div className="mt-4 text-center space-y-2">
            {!resetMode && (
              <button
                onClick={() => setResetMode(true)}
                className="text-sm text-emerald-600 hover:underline"
              >
                Forgot password?
              </button>
            )}
            <div>
              <button
                onClick={() => { setIsLogin(!isLogin); setResetMode(false); }}
                className="text-sm text-emerald-600 hover:underline"
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

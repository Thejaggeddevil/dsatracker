import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Download, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import ClickSpark from '@/components/ClickSpark';
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

interface User {
  id: string;
  name: string;
  email: string;
}

const Settings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const firebaseUser = auth.currentUser;

        if (!firebaseUser) {
          navigate('/login');
          return;
        }

        const token = await firebaseUser.getIdToken();

        await loadProfile(token);
      } catch (err) {
        console.error(err);
        toast.error("Authentication failed");
        navigate("/login");
      }
    };

    init();
  }, []);

  const loadProfile = async (token: string) => {
    try {
      const response = await fetch('/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to load profile');
      }

      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
        setName(data.user.name);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    try {
      setUpdating(true);

      const firebaseUser = auth.currentUser;

      if (!firebaseUser) {
        navigate('/login');
        return;
      }

      const token = await firebaseUser.getIdToken();

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Failed to update profile');
        return;
      }

      setUser(data.user);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadData = () => {
    if (!user) return;

    const data = {
      user,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dsa-streak-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Data downloaded successfully!');
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  if (loading) {
    return (
      <Layout>
        <ClickSpark sparkColor="rgba(10, 108, 199, 0.8)" sparkCount={10} sparkRadius={20} duration={500} />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px-100px)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-64px-100px)]">
          <p className="text-muted-foreground">Failed to load user data</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        {/* Profile Section */}
        <div className="rounded-lg border border-border bg-card p-6 mb-6">
          <h2 className="text-xl font-semibold mb-6">Profile</h2>

          <form onSubmit={handleUpdateName} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={updating}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="email">Email (Read-only)</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="mt-2 bg-secondary/50"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Email cannot be changed. This is your account identifier.
              </p>
            </div>

            <Button type="submit" disabled={updating} className="w-full">
              {updating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Profile'
              )}
            </Button>
          </form>
        </div>

        {/* Data Management Section */}
        <div className="rounded-lg border border-border bg-card p-6 mb-6">
          <h2 className="text-xl font-semibold mb-6">Data & Privacy</h2>

          <div className="space-y-3">
            <Button
              onClick={handleDownloadData}
              variant="outline"
              className="w-full justify-start"
            >
              <Download className="w-4 h-4 mr-2" />
              Download My Data
            </Button>
            <p className="text-xs text-muted-foreground">
              Export your profile information as JSON. This feature is for data portability and backup purposes.
            </p>
          </div>
        </div>

        {/* Account Section */}
        <div className="rounded-lg border border-border bg-card p-6 mb-6">
          <h2 className="text-xl font-semibold mb-6">Account</h2>

          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full justify-start"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </div>

        {/* Security Info */}
        <div className="p-4 rounded-lg bg-secondary/50 border border-border">
          <h3 className="font-medium text-sm mb-2">🔒 Security & Privacy</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>✓ Your password is securely hashed using PBKDF2</li>
            <li>✓ Passwords are never stored in plain text</li>
            <li>✓ Sessions expire after 7 days of inactivity</li>
            <li>✓ Your data is private and never shared</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;



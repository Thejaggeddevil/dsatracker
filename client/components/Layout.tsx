import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PillNav from '@/components/PillNav';
import logo from '@/image/fire.png';
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface LayoutProps {
  children: React.ReactNode;
  hideNav?: boolean; 
}
const MobileMenu = () => {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg border border-border"
      >
        ☰
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg p-2 space-y-2">
          <button onClick={() => navigate('/home')} className="block w-full text-left p-2 hover:bg-secondary rounded">
            Home
          </button>
          <button onClick={() => navigate('/history')} className="block w-full text-left p-2 hover:bg-secondary rounded">
            History
          </button>
          <button onClick={() => navigate('/revisions')} className="block w-full text-left p-2 hover:bg-secondary rounded">
            Revisions
          </button>
          <button onClick={() => navigate('/settings')} className="block w-full text-left p-2 hover:bg-secondary rounded">
            Settings
          </button>
          <button onClick={() => navigate('/login')} className="block w-full text-left p-2 hover:bg-destructive rounded text-destructive">
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

const Layout = ({ children }: LayoutProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/signup';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    isDark ? html.classList.add('dark') : html.classList.remove('dark');
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const navItems = [
    { label: 'Home', href: '/home' },
    { label: 'History', href: '/history' },
    { label: 'Revisions', href: '/revisions' },
    { label: 'Settings', href: '/settings' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">

      {/* HEADER */}
     <header className="relative z-50 h-20 border-b border-border bg-background">
  <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">

    {/* LEFT: Logo */}
    <div className="flex items-center">
      DSA TRACKER
         </div>

    {/* CENTER: Desktop Navigation */}
    {!isAuthPage && user && (
      <div className="hidden md:flex justify-center flex-1">

        <PillNav
          logo={logo}
          logoAlt="DSA Streak"
          items={[
            { label: 'Home', href: '/home' },
            { label: 'History', href: '/history' },
            { label: 'Revisions', href: '/revisions' },
            { label: 'Settings', href: '/settings' }
          ]}
          activeHref={location.pathname}
          initialLoadAnimation={false}
        />
      </div>
    )}

    {/* RIGHT: Actions */}
    <div className="flex items-center gap-3">

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors"
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Desktop Logout */}
      {user && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="hidden md:inline-flex"
        >
          Logout
        </Button>
      )}

      {/* Mobile Hamburger */}
      {user && (
        <div className="md:hidden">
          <MobileMenu />
        </div>
      )}
    </div>

  </div>
</header>


      {/* MOBILE MENU */}
      {mobileOpen && user && (
        <div className="md:hidden border-b bg-background px-4 py-4 space-y-3">
          {navItems.map((item) => (
            <div
              key={item.href}
              onClick={() => {
                navigate(item.href);
                setMobileOpen(false);
              }}
              className="cursor-pointer text-base font-medium hover:text-primary"
            >
              {item.label}
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full"
          >
            Logout
          </Button>
        </div>
      )}

      {/* MAIN */}
      <main className="flex-1 pt-10">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        created with ❤️ by mansi.dev
      </footer>
    </div>
  );
};

export default Layout;

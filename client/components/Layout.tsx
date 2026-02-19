import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PillNav from '@/components/PillNav';
import logo from '@/image/fire.png';
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useTheme } from "@/components/ThemeProvider";

interface LayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

const MobileMenu = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

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
          <button
            onClick={async () => {
              await signOut(auth);
              navigate('/login');
            }}
            className="block w-full text-left p-2 hover:bg-destructive rounded text-destructive"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

const Layout = ({ children, hideNav }: LayoutProps) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme(); // ✅ single source of truth

  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/signup';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">

      {/* HEADER */}
      {!hideNav && (
        <header className="relative z-50 h-20 border-b border-border bg-background">
          <div className="max-w-7xl mx-auto h-full pl-0 pr-4 flex items-center justify-between">


            {/* LEFT */}
           
<div className="flex items-center ml-2">
  <h1
    className="
      text-2xl md:text-3xl
      font-bold italic
      tracking-wide
      bg-gradient-to-r
      from-blue-600
      via-indigo-500
      to-purple-600
      bg-clip-text
      text-transparent
      animate-gradient
      logo-glow
    "
    style={{
      fontFamily: "'Cinzel', serif"
    }}
  >
    DSA Tracker
  </h1>
</div>


            {/* CENTER NAV */}
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

            {/* RIGHT */}
            <div className="flex items-center gap-3">

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg border border-border"
              >
                {theme === "dark" ? "☀️" : "🌙"}
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

              {/* Mobile */}
              {user && (
                <div className="md:hidden">
                  <MobileMenu />
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      {/* MAIN */}
      <main className="flex-1 pt-10">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        created with ❤️ by mansi.code
      </footer>
    </div>
  );
};

export default Layout;

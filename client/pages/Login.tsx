import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import LogoImage from '@/image/fire.png';
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { apiFetch } from "@/lib/api";

const provider = new GoogleAuthProvider();

// 🔹 Replace this path with your image


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged in successfully");
      navigate("/home");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Enter email first");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleGoogleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, provider);

    const user = result.user;
    const token = await user.getIdToken();

    // optional: call backend to create profile
    await apiFetch("/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: user.displayName,
        email: user.email,
      }),
    });

  } catch (error) {
    console.error("Google login failed", error);
  }
};


  return (
    <Layout hideNav>
      {/* Proper vertical centering */}
     
        <div className="min-h-screen flex items-start justify-center pt-10 px-4">

        <div className="w-full max-w-md animate-fade-in">

          <div className="bg-card p-8 rounded-2xl shadow-xl border border-border">

            {/* 🔥 Replaced Flame with Custom Image */}
            <div className="flex justify-center mb-6">
              <img
                src={LogoImage}
                alt="App Logo"
                className="w-16 h-16 object-contain"
              />
            </div>

            <h1 className="text-3xl font-bold text-center mb-2">
              Welcome Back
            </h1>

            <p className="text-muted-foreground text-center mb-6">
              Continue your DSA practice streak
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <Label className="mb-2 block">Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="relative">
                <Label className="mb-2 block">Password</Label>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
           
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-muted-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Log In"
                )}
              </Button>
            </form>
<Button
  type="button"
  onClick={handleGoogleLogin}
  variant="outline"
  className="w-full flex items-center justify-center gap-3 bg-white text-black hover:bg-gray-100 border border-gray-300 mt-3"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    className="w-5 h-5"
  >
    <path
      fill="#FFC107"
      d="M43.6 20.5H42V20H24v8h11.3C33.5 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.4 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10.5 0 19.3-7.7 20-17.5.1-.8.1-1.5.1-2.5 0-1.1-.1-2.1-.5-3.5z"
    />
    <path
      fill="#FF3D00"
      d="M6.3 14.7l6.6 4.8C14.4 16.3 18.9 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.4 6.5 29.5 4 24 4 16.1 4 9.2 8.6 6.3 14.7z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.3 35.7 26.8 36 24 36c-5.2 0-9.5-3.3-11-8l-6.6 5.1C9.2 39.3 16.1 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.6 20.5H42V20H24v8h11.3c-1 3-3.4 5.4-6.6 6.6l6.3 5.2C38.5 36.7 44 31 44 24c0-1.1-.1-2.1-.4-3.5z"
    />
  </svg>

  Continue with Google
</Button>


            <p className="text-center text-sm mt-6">
              Don’t have an account?{" "}
              <Link to="/signup" className="text-primary font-medium">
                Sign up
              </Link>
            </p>

            <button
              type="button"
              onClick={handleForgotPassword}
              className="block text-sm text-center w-full mt-4 text-primary"
            >
              Forgot password?
            </button>

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;

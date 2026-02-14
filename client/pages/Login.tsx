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

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import ClickSpark from "@/components/ClickSpark";
import LogoImage from '@/image/fire.png';
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

const Signup = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const validatePassword = (pwd: string) => {
    const minLength = pwd.length >= 8;
    const upper = /[A-Z]/.test(pwd);
    const lower = /[a-z]/.test(pwd);
    const number = /[0-9]/.test(pwd);
    const special = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

    return minLength && upper && lower && number && special;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!name || !email || !password || !confirmPassword) {
      toast.error("All fields are required");
      setLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      toast.error(
        "Password must include uppercase, lowercase, number and special character"
      );
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: name,
        });
      }

      toast.success("Account created successfully");
      navigate("/home");
    } catch (error: any) {
      toast.error(error.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <ClickSpark
        sparkColor="rgba(10, 108, 199, 0.8)"
        sparkCount={10}
        sparkRadius={20}
        duration={500}
      />

      {/* 🔥 Card moved upward */}
      <div className="min-h-screen flex items-start justify-center pt-4 px-4">
        <div className="w-full max-w-md bg-card p-8 rounded-2xl border border-border shadow-[0_20px_60px_rgba(0,0,0,0.15)]">

          {/* 🔥 Replace this with your custom logo image */}
          <div className="text-center mb-6">
            <img
                src={LogoImage}
               alt="App Logo"
                  className="w-16 h-16 mx-auto mb-4"
              />
           
            <h1 className="text-3xl font-bold mb-2">Create Account</h1>
            <p className="text-muted-foreground">
              Start your DSA practice streak today
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <Label>Full Name</Label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="mt-1"
              />
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <Label>Password</Label>
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="mt-1 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-muted-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>

              <p className="text-xs text-muted-foreground mt-2">
                Must contain 8+ chars, uppercase, lowercase, number & special character.
              </p>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="relative">
              <Label>Confirm Password</Label>
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="mt-1 pr-10"
              />
              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-3 top-9 text-muted-foreground"
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            <Button type="submit" className="w-full mt-6" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Signup;

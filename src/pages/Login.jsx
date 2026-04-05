import React, { useState } from "react";
import { signIn, signUp } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Scissors } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      if (isSignUp) await signUp(email, password, { full_name: email.split("@")[0], role: "user" });
      else await signIn(email, password);
      navigate("/"); window.location.reload();
    } catch (err) { setError(err.message || "Authentication failed."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-[#F5F5F5]">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden bg-[#111]">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 80% 20%, rgba(212,175,55,0.15), transparent 60%)" }} />
        <img src="https://images.pexels.com/photos/3740029/pexels-photo-3740029.jpeg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-10" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #D4AF37, #B8960C)" }}>
            <Scissors className="w-4 h-4 text-black" />
          </div>
          <div>
            <p className="font-black text-white tracking-tight">SEW SHEEK</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">Academy</p>
          </div>
        </div>
        <div className="relative z-10">
          <h2 className="text-5xl font-black text-white mb-4 leading-tight">Learn to Sew.<br /><span style={{ color: "#D4AF37" }}>Level Up.</span></h2>
          <p className="text-white/50 text-base leading-relaxed max-w-sm">Live classes, replays, tutorials, and courses — all in one place.</p>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-black text-[#111] mb-1">{isSignUp ? "Create Account" : "Welcome Back"}</h1>
          <p className="text-sm text-[#999] mb-8">{isSignUp ? "Join the Sew Sheek community." : "Sign in to access your classes."}</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#555] mb-1.5 uppercase tracking-wide">Email</label>
              <Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="h-12 rounded-xl border-[#E0E0E0] bg-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#555] mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="h-12 rounded-xl border-[#E0E0E0] bg-white pr-11" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>}
            <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl font-bold text-sm text-black" style={{ backgroundColor: "#D4AF37" }}>
              {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
            </Button>
            <div className="text-center">
              <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(""); }} className="text-sm font-semibold" style={{ color: "#D4AF37" }}>
                {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

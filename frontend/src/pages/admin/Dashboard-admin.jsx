import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Shield, LogOut, Key, Copy, Check, ChefHat, User as UserIcon, Settings, LayoutDashboard, Lock, Music } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion } from 'framer-motion';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/redux/authSlice';
import { persistStore } from 'redux-persist'
import store from '@/redux/store';
import { toast } from 'sonner';
import { LOGOUT_API } from '@/utils/constants';
import ChangePassword from '@/components/dashboard/ChangePassword';

const DashboardAdmin = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const dispatch = useDispatch();
  let persistor = persistStore(store);
  const user = useSelector((state) => state.auth?.user);

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      toast.success('Room ID copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy Room ID');
    }
  };

  const logoutHandler = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${LOGOUT_API}`, {}, { withCredentials: true });
      if (res.data.success) {
        dispatch(logout());
        persistor.purge();
        navigate('/login');
        toast.success('Logged out successfully');
      }
    } catch (error) {
      toast.error('Logout failed');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md dark:bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block">Nexus Hub</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center px-3 py-1.5 bg-slate-100 dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-mono text-slate-500 mr-2 uppercase tracking-wider">Room:</span>
              <span className="text-sm font-semibold truncate max-w-[80px] sm:max-w-none">{roomId}</span>
              <button onClick={copyRoomId} className="ml-2 hover:text-indigo-600 transition-colors">
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <Button variant="ghost" size="icon" onClick={logoutHandler} disabled={loading} className="text-slate-500 hover:text-red-600 hover:bg-red-50">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-10"
        >
          {/* Welcome Header */}
          <header className="space-y-2">
            <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, <span className="text-indigo-600">User</span>
            </motion.h2>

          </header>

          {/* Core Actions Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Device Control Card */}
            <motion.div variants={itemVariants}>
              <Link to={`/admin/dashboard/${roomId}/device-setup`} className="group block h-full">
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <LayoutDashboard className="w-24 h-24" />
                  </div>
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Key className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle>Device Hub</CardTitle>
                    <CardDescription>Register and monitor your smart home hardware components.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="text-sm font-semibold text-blue-600 group-hover:translate-x-1 inline-flex items-center transition-transform">
                      Manage Devices →
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>

            {/* Smart Kitchen Card */}
            <motion.div variants={itemVariants}>
              <Link to={`/admin/dashboard/${roomId}/recipes`} className="group block h-full">
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <ChefHat className="w-24 h-24" />
                  </div>
                  <CardHeader>
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <ChefHat className="w-6 h-6 text-emerald-600" />
                    </div>
                    <CardTitle>AI Kitchen</CardTitle>
                    <CardDescription>Generate and manage smart recipes with AI.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="text-sm font-semibold text-emerald-600 group-hover:translate-x-1 inline-flex items-center transition-transform">
                      Assistant →
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>

            {/* Account Settings Card */}
            <motion.div variants={itemVariants}>
              <Card className="h-full border-slate-200 dark:border-slate-800 relative shadow-sm">
                <CardHeader>
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center mb-2">
                    <Settings className="w-6 h-6 text-slate-600" />
                  </div>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Quick access to your profile and security settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 hover:bg-indigo-50 hover:text-indigo-600 border-slate-200"
                    onClick={() => navigate(`/admin/${user?._id}`)}
                  >
                    <UserIcon className="w-4 h-4" />
                    User Profile
                  </Button>

                  <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2 hover:bg-indigo-50 hover:text-indigo-600 border-slate-200"
                      >
                        <Lock className="w-4 h-4" />
                        Change Password
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[400px] rounded-2xl">
                      <DialogHeader>
                        <DialogTitle>Update Password</DialogTitle>
                        <DialogDescription>
                          Enter your current and new password to update security.
                        </DialogDescription>
                      </DialogHeader>
                      <ChangePassword onSuccess={() => setIsPasswordModalOpen(false)} />
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </motion.div>
          </section>

          {/* Mood Based Music Recommendation Section */}
          <motion.section variants={itemVariants} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                <Music className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight">Mood Based Music Recommendation</h3>
            </div>
            <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-lg bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20">
              <CardContent className="p-12 text-center space-y-6">
                <div className="mx-auto w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl shadow-md flex items-center justify-center animate-bounce">
                  <Music className="w-10 h-10 text-pink-500" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold">Ready to sync your mood?</h4>
                  <p className="text-slate-500 max-w-md mx-auto">
                    The Mood-Based Music System works best in a dedicated window to ensure your playback is uninterrupted and secure.
                  </p>
                </div>
                <Button
                  onClick={() => window.open("https://mood-based-music-playback-system.vercel.app/home", "_blank")}
                  className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-6 rounded-2xl text-lg font-bold shadow-lg shadow-pink-200 dark:shadow-none transition-all hover:scale-105"
                >
                  Launch Music Player
                </Button>
              </CardContent>
            </Card>
          </motion.section>


        </motion.div>
      </main>
    </div>
  );
};

export default DashboardAdmin;
import { User as UserIcon, Mail, Home, LogOut, CornerUpLeft, Crown, Minus, Shield, BadgeCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/redux/authSlice';
import { persistStore } from 'redux-persist';
import store from '@/redux/store';
import { toast } from 'sonner';
import axios from "axios";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { GET_USER_DETAILS_API, LOGOUT_API, REMOVE_MEMBER_API } from "@/utils/constants";
import { motion } from 'framer-motion';

const AdminUserDetails = () => {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState({});
    const { userId } = useParams();
    const user1 = useSelector((state) => state.auth.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    let persistor = persistStore(store);

    const logoutHandler = async () => {
        setLoading(true);
        try {
            if (user1._id === userId) {
                const res = await axios.post(`${LOGOUT_API}`, {}, { withCredentials: true });
                if (res.data.success) {
                    dispatch(logout());
                    persistor.purge();
                    navigate('/login');
                    toast.success('Logged out successfully');
                }
            } else {
                toast.error('Session mismatch');
                navigate('/login');
            }
        } catch (error) {
            toast.error('Logout failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await axios.get(`${GET_USER_DETAILS_API}/${userId}`, { withCredentials: true });
                if (res.data.success) {
                    setUser(res.data.user);
                }
            } catch (error) {
                toast.error('Failed to load user details');
            }
        }
        fetchDetails();
    }, [userId]);

    const userDetails = [
        { icon: UserIcon, label: "USER ID", value: user.username, color: "text-blue-600", bg: "bg-blue-100" },
        { icon: Mail, label: "Email Address", value: user.email, color: "text-indigo-600", bg: "bg-indigo-100" },
        { icon: Home, label: "Associated Room", value: user.room || 'No Room Assigned', color: "text-emerald-600", bg: "bg-emerald-100" },
        { icon: Crown, label: "Account Role", value: user.role, color: "text-amber-600", bg: "bg-amber-100" }
    ];

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
            {/* Consistent Top Navbar */}
            <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md dark:bg-slate-950/80">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors">
                            <CornerUpLeft className="w-5 h-5 text-indigo-600" />
                        </button>
                        <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />
                        <span className="font-bold text-xl tracking-tight">Admin Profile</span>
                    </div>

                    {user1._id === userId && (
                        <Button variant="ghost" size="icon" onClick={logoutHandler} disabled={loading} className="text-slate-500 hover:text-red-600 hover:bg-red-50">
                            <LogOut className="w-5 h-5" />
                        </Button>
                    )}
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-4 py-12">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="space-y-8"
                >
                    <header className="text-center space-y-4">
                        <div className="relative inline-block">
                            <div className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl mb-4 mx-auto">
                                <UserIcon className="w-12 h-12 text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-green-500 border-4 border-white dark:border-slate-950 w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
                                <BadgeCheck className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-extrabold tracking-tight">Account Overview</h2>
                        <p className="text-slate-500 dark:text-slate-400">View and manage your personal administrative details.</p>
                    </header>

                    <section className="grid gap-4">
                        {userDetails.map(({ icon: Icon, label, value, color, bg }) => (
                            <motion.div
                                key={label}
                                whileHover={{ scale: 1.01 }}
                                className="group flex items-center p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                <div className={`p-3 ${bg} dark:bg-opacity-10 rounded-xl transition-transform group-hover:scale-110`}>
                                    <Icon className={`h-6 w-6 ${color}`} />
                                </div>
                                <div className="ml-5 flex-1">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                                        {label}
                                    </h3>
                                    <p className={`text-lg font-semibold text-slate-900 dark:text-slate-100 ${label === "Email Address" ? "" : "capitalize"}`}>
                                        {value}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </section>

                    {user1._id !== userId && user.role === 'member' && (
                        <div className="pt-8">
                            <Button
                                variant="destructive"
                                className="w-full py-6 rounded-2xl text-lg font-bold shadow-lg hover:shadow-red-500/20"
                                onClick={async () => {
                                    try {
                                        const res = await axios.delete(`${REMOVE_MEMBER_API}/${user1.room}`, {
                                            data: { memberId: userId },
                                            withCredentials: true
                                        });
                                        if (res.data.success) {
                                            toast.success('Member removed');
                                            navigate(-1);
                                        }
                                    } catch (e) {
                                        toast.error('Failed to remove member');
                                    }
                                }}
                            >
                                <Minus className="h-5 w-5 mr-2" />
                                Remove Admin from Hub
                            </Button>
                        </div>
                    )}
                </motion.div>
            </main>
        </div>
    );
};

export default AdminUserDetails;

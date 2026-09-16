import { useAuth } from "@/hooks/useAuth";
import { Redirect, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FcGoogle } from "react-icons/fc";
import { useEffect, useState } from "react";
import { Loader2, Eye, EyeOff, Moon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Footer } from "@/components/footer";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const loginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function AuthPage() {
    const { user, loginMutation, loginLocalMutation, registerMutation } = useAuth();
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [showPassword, setShowPassword] = useState(false);
    const [activeTab, setActiveTab] = useState<"login" | "register">("login");

    // Redirect after successful login
    useEffect(() => {
        if (user) {
            setLocation("/");
        }
    }, [user, setLocation]);

    const loginForm = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const registerForm = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
        },
    });

    if (user) {
        return <Redirect to="/" />;
    }

    const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
        loginLocalMutation.mutate(values);
    };

    const onRegisterSubmit = (values: z.infer<typeof registerSchema>) => {
        registerMutation.mutate(values);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="min-h-screen relative flex flex-col bg-transparent overflow-hidden">
            {/* Ambient Background Gradient for Auth Page */}
            <div className="fixed inset-0 z-0 bg-[#020617]">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#020617] to-[#020617] opacity-80" />
                <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-900/30 via-[#020617] to-transparent opacity-60" />
                
                {/* Subtle animated stars overlay */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-screen" />
            </div>

            {/* Main Content Area - Split Layout */}
            <div className="flex-1 flex flex-col lg:flex-row relative z-10 w-full max-w-7xl mx-auto items-stretch px-4 py-8 lg:py-0">
                
                {/* Left Side: Hero / Brand messaging */}
                <div className="flex-1 flex flex-col justify-center px-4 lg:px-12 py-12 lg:py-0 text-center lg:text-left">
                    <motion.div 
                        initial="hidden" 
                        animate="visible" 
                        variants={containerVariants}
                        className="max-w-xl mx-auto lg:mx-0"
                    >
                        <motion.div variants={itemVariants} className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                                <Moon className="w-6 h-6 text-indigo-400" />
                            </div>
                            <span className="text-3xl font-bold tracking-wider text-white uppercase">Nocturne</span>
                        </motion.div>
                        
                        <motion.h1 variants={itemVariants} className="text-4xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                            Where the <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">night</span> comes alive.
                        </motion.h1>
                        
                        <motion.p variants={itemVariants} className="text-lg lg:text-xl text-indigo-200/70 mb-8 leading-relaxed font-light">
                            Step into an exclusive social ecosystem designed for the restless, the dreamers, and the midnight thinkers. Curate your ambient vibe and connect when the rest of the world goes quiet.
                        </motion.p>
                        
                        <motion.div variants={itemVariants} className="hidden lg:flex items-center gap-6 text-sm text-indigo-300/50">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                                <span>3,402 Night Owls Online</span>
                            </div>
                            <span>•</span>
                            <span>End-to-End Encrypted Whispers</span>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Right Side: Auth Form */}
                <div className="flex-1 flex items-center justify-center px-4 lg:px-12">
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
                        className="w-full max-w-md"
                    >
                        <Card className="w-full relative z-10 bg-[#0a0f1d]/60 backdrop-blur-2xl border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] text-white overflow-hidden rounded-3xl">
                            {/* Decorative top gradient line */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                            
                            <CardHeader className="text-center pt-8 pb-4">
                                <CardTitle className="text-2xl font-bold text-white">
                                    {activeTab === "login" ? "Welcome Back" : "Create Account"}
                                </CardTitle>
                                <CardDescription className="text-indigo-200/60 mt-2">
                                    {activeTab === "login" 
                                        ? "Enter your credentials to access the night." 
                                        : "Join the sanctuary for midnight thinkers."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-8 pb-8">
                                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")} className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 bg-black/40 border border-white/5 rounded-xl p-1 mb-8">
                                        <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white transition-all text-gray-400 py-2">
                                            Log In
                                        </TabsTrigger>
                                        <TabsTrigger value="register" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white transition-all text-gray-400 py-2">
                                            Register
                                        </TabsTrigger>
                                    </TabsList>

                                    <div className="relative min-h-[300px]">
                                        <TabsContent value="login" className="mt-0 absolute inset-0 w-full transition-all">
                                            <Form {...loginForm}>
                                                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                                                    <FormField
                                                        control={loginForm.control}
                                                        name="username"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-gray-300 text-xs uppercase tracking-wider">Username</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="NightPersona"
                                                                        {...field}
                                                                        className="bg-black/30 border-white/10 text-white placeholder:text-gray-600 focus:border-indigo-500/50 focus:ring-indigo-500/20 h-11 rounded-xl"
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-xs text-red-400" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={loginForm.control}
                                                        name="password"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <div className="flex items-center justify-between">
                                                                    <FormLabel className="text-gray-300 text-xs uppercase tracking-wider">Password</FormLabel>
                                                                    <button type="button" onClick={() => toast({ title: "Coming Soon", description: "Password reset is not yet available." })} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                                                                        Forgot?
                                                                    </button>
                                                                </div>
                                                                <FormControl>
                                                                    <div className="relative">
                                                                        <Input
                                                                            type={showPassword ? "text" : "password"}
                                                                            placeholder="••••••••"
                                                                            {...field}
                                                                            className="bg-black/30 border-white/10 text-white placeholder:text-gray-600 focus:border-indigo-500/50 focus:ring-indigo-500/20 h-11 rounded-xl pr-10"
                                                                        />
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-500 hover:text-white transition-colors"
                                                                            onClick={() => setShowPassword(!showPassword)}
                                                                        >
                                                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                                        </Button>
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage className="text-xs text-red-400" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <Button
                                                        type="submit"
                                                        className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/50 shadow-[0_0_20px_rgba(79,70,229,0.3)] text-white font-medium h-11 rounded-xl transition-all group"
                                                        disabled={loginLocalMutation.isPending}
                                                    >
                                                        {loginLocalMutation.isPending ? (
                                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Authenticating...</>
                                                        ) : (
                                                            <span className="flex items-center justify-center gap-2">
                                                                Enter Nocturne 
                                                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                                                            </span>
                                                        )}
                                                    </Button>
                                                </form>
                                            </Form>
                                        </TabsContent>

                                        <TabsContent value="register" className="mt-0 absolute inset-0 w-full transition-all">
                                            <Form {...registerForm}>
                                                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                                                    <FormField
                                                        control={registerForm.control}
                                                        name="username"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-gray-300 text-xs uppercase tracking-wider">Username</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="NightPersona"
                                                                        {...field}
                                                                        className="bg-black/30 border-white/10 text-white placeholder:text-gray-600 focus:border-indigo-500/50 focus:ring-indigo-500/20 h-11 rounded-xl"
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-xs text-red-400" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={registerForm.control}
                                                        name="email"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-gray-300 text-xs uppercase tracking-wider">Email (Optional)</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="email"
                                                                        placeholder="owl@midnight.com"
                                                                        {...field}
                                                                        className="bg-black/30 border-white/10 text-white placeholder:text-gray-600 focus:border-indigo-500/50 focus:ring-indigo-500/20 h-11 rounded-xl"
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-xs text-red-400" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={registerForm.control}
                                                        name="password"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-gray-300 text-xs uppercase tracking-wider">Password</FormLabel>
                                                                <FormControl>
                                                                    <div className="relative">
                                                                        <Input
                                                                            type={showPassword ? "text" : "password"}
                                                                            placeholder="••••••••"
                                                                            {...field}
                                                                            className="bg-black/30 border-white/10 text-white placeholder:text-gray-600 focus:border-indigo-500/50 focus:ring-indigo-500/20 h-11 rounded-xl pr-10"
                                                                        />
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-500 hover:text-white transition-colors"
                                                                            onClick={() => setShowPassword(!showPassword)}
                                                                        >
                                                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                                        </Button>
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage className="text-xs text-red-400" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <Button
                                                        type="submit"
                                                        className="w-full mt-6 bg-purple-600 hover:bg-purple-500 border border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)] text-white font-medium h-11 rounded-xl transition-all"
                                                        disabled={registerMutation.isPending}
                                                    >
                                                        {registerMutation.isPending ? (
                                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Identity...</>
                                                        ) : (
                                                            "Embrace the Night"
                                                        )}
                                                    </Button>
                                                </form>
                                            </Form>
                                        </TabsContent>
                                    </div>
                                </Tabs>

                                <div className="relative my-6 mt-12">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-white/5" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-[#0a0f1d] px-4 text-gray-500">
                                            Or continue with
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    className="w-full bg-white/[0.03] border-white/10 hover:bg-white/10 hover:text-white transition-all text-gray-300 h-11 rounded-xl"
                                    onClick={() => loginMutation.mutate()}
                                    disabled={loginMutation.isPending}
                                >
                                    <FcGoogle className="mr-3 h-5 w-5" />
                                    {loginMutation.isPending ? "Connecting..." : "Google"}
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
            
            {/* Detailed Footer positioned absolutely or normally based on scroll? 
                For a premium feel, the footer sits at the bottom of the scroll. */}
            <Footer />
        </div>
    );
}

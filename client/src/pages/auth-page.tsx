import { useAuth } from "@/hooks/useAuth";
import { Redirect, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { useEffect } from "react";

export default function AuthPage() {
    const { user, loginMutation } = useAuth();
    const [, setLocation] = useLocation();

    // Redirect after successful login
    useEffect(() => {
        if (loginMutation.isSuccess && user) {
            setLocation("/");
        }
    }, [loginMutation.isSuccess, user, setLocation]);

    if (user) {
        return <Redirect to="/" />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-gray-900/50 border-gray-800 backdrop-blur-sm text-white">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
                        Nocturne
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                        Join the night circle. Connect with your fellow night owls.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <Button
                        variant="outline"
                        className="w-full py-6 text-lg bg-white/5 border-white/10 hover:bg-white/10 hover:text-white transition-all duration-300"
                        onClick={() => loginMutation.mutate()}
                        disabled={loginMutation.isPending}
                    >
                        <FcGoogle className="mr-3 h-6 w-6" />
                        {loginMutation.isPending ? "Connecting..." : "Sign in with Google"}
                    </Button>

                    <div className="text-center text-sm text-gray-500 mt-4">
                        By continuing, you agree to our Terms of Service and Privacy Policy.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

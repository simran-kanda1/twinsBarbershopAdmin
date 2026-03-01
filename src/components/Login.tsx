import { useState } from "react";
import { auth } from "../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface LoginProps {
    onLoginSuccess: () => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            onLoginSuccess();
        } catch (err: any) {
            console.error("Login Error:", err);
            setError("Invalid email or password.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-zinc-100">Twins Barbershop</h1>
                    <p className="text-zinc-400 mt-2">Admin Dashboard Portal</p>
                </div>

                <Card className="bg-zinc-900 border-zinc-800 shadow-2xl">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl text-zinc-100">Sign in</CardTitle>
                        <CardDescription className="text-zinc-400">
                            Enter your credentials to access the admin portal
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            {error && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-zinc-300">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@example.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-zinc-950/50 border-white/10 text-white focus-visible:ring-zinc-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-zinc-300">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-zinc-950/50 border-white/10 text-white focus-visible:ring-zinc-500"
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                type="submit"
                                className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium"
                                disabled={isLoading}
                            >
                                {isLoading ? "Signing in..." : "Sign in"}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}

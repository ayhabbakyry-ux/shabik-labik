
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Phone, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useUser } from "@/lib/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AuthPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useUser();
  const router = useRouter();

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 10) {
      login(phone);
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="mb-8 text-center">
        <div className="bg-primary p-4 rounded-3xl inline-block shadow-xl mb-4">
          <ShieldCheck className="h-12 w-12 text-white" />
        </div>
        <h1 className="text-3xl font-bold font-headline text-primary">Shabik Labik</h1>
        <p className="text-muted-foreground font-medium">Your Legacy Digital Portal</p>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-none">
        <Tabs defaultValue="login" className="w-full">
          <CardHeader>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <CardTitle className="text-xl">Welcome Back</CardTitle>
            <CardDescription>Enter your mobile number to access your wallet.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Mobile Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="phone" 
                    placeholder="09xx xxx xxx" 
                    className="pl-10 h-11" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Security Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10 h-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-11 text-base font-semibold">
                Sign In to Platform <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <p className="text-xs text-center text-muted-foreground">
              By logging in, you agree to our Terms of Digital Service.
            </p>
          </CardFooter>
        </Tabs>
      </Card>
      
      <div className="mt-8 text-center text-xs text-muted-foreground">
        © 2024 Shabik Labik Digital. Secure & Encrypted.
      </div>
    </div>
  );
}

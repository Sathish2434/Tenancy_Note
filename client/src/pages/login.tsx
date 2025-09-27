import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { setAuth } from "@/lib/auth";

const testAccounts = [
  { label: "Acme Admin", email: "admin@acme.test", password: "password" },
  { label: "Acme User", email: "user@acme.test", password: "password" },
  { label: "Globex Admin", email: "admin@globex.test", password: "password" },
  { label: "Globex User", email: "user@globex.test", password: "password" },
];

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const authData = await api.login(email, password);
      setAuth(authData);
      toast({ title: "Login successful!" });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (testEmail: string, testPassword: string) => {
    setEmail(testEmail);
    setPassword(testPassword);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-foreground">Welcome to NotesApp</h2>
          <p className="mt-2 text-muted-foreground">Sign in to your account</p>
        </div>
        
        <Card>
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    data-testid="input-email"
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    data-testid="input-password"
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
            
            {/* Test Accounts */}
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-sm font-medium text-foreground mb-4">Test Accounts:</p>
              <div className="grid grid-cols-2 gap-2">
                {testAccounts.map((account) => (
                  <Button
                    key={account.email}
                    variant="secondary"
                    size="sm"
                    className="h-auto p-3 text-left flex flex-col items-start"
                    onClick={() => fillCredentials(account.email, account.password)}
                    data-testid={`button-test-${account.label.toLowerCase().replace(' ', '-')}`}
                  >
                    <div className="font-medium text-xs">{account.label}</div>
                    <div className="text-xs opacity-75">{account.email}</div>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { LoginForm } from "@/components/auth/client-login-form";

export const metadata = {
  title: "Login | DSMS",
  description: "Log in to your DSMS account",
};

export default function LoginPage() {
  return (
    <div className="container py-8 flex justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Log in to DSMS</h1>
          <p className="text-muted-foreground mt-2">
            Enter your credentials to access your account
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
} 
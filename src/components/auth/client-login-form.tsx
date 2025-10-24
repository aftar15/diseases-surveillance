"use client";

import dynamic from "next/dynamic";

// Dynamically load the login form component
const LoginForm = dynamic(
  () => import("@/components/auth/login-form"),
  { ssr: false, loading: () => <div className="w-full h-[400px] bg-muted animate-pulse rounded-md" /> }
);

export { LoginForm }; 
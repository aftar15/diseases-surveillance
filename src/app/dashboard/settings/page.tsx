"use client";

import { useEffect } from 'react';
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useActionState } from 'react';
import { ProfileFormState, updateProfileName, updateProfilePassword } from '@/actions/profile-actions'; 
import { toast } from "sonner";

// Schema for name update form
const nameFormSchema = z.object({
  name: z.string().min(1, "Name is required."),
});

// Schema for password update form
const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(8, "New password must be at least 8 characters."),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords do not match",
  path: ["confirmPassword"],
});

// Initial state for actions
const initialFormState: ProfileFormState = { message: "", success: false, errors: undefined };

// --- Name Update Form Component ---
function NameUpdateForm({ userId, currentName }: { userId: string; currentName: string }) {
  const [state, submitAction, isPending] = useActionState<ProfileFormState, FormData>(updateProfileName, initialFormState);

  const form = useForm<z.infer<typeof nameFormSchema>>({
    resolver: zodResolver(nameFormSchema),
    defaultValues: {
      name: currentName || '',
    },
  });

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      // Optionally update name in auth context if needed
    } else if (state.message && !state.success) {
      toast.error(state.message);
      // Set form errors from state
      if (state.errors?.name) {
          form.setError('name', { type: 'manual', message: state.errors.name.join(', ') });
      }
      if (state.errors?._form) {
          // Display general errors if needed
      }
    }
  }, [state, form]);

  return (
    <Form {...form}>
      <form action={submitAction} className="space-y-4">
        <input type="hidden" name="userId" value={userId} />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
}

// --- Password Update Form Component ---
function PasswordUpdateForm({ userId }: { userId: string }) {
  const [state, submitAction, isPending] = useActionState<ProfileFormState, FormData>(updateProfilePassword, initialFormState);

  const form = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      form.reset(); // Clear form on success
    } else if (state.message && !state.success) {
      toast.error(state.message);
      // Set form errors from state
       if (state.errors?.currentPassword) {
          form.setError('currentPassword', { type: 'manual', message: state.errors.currentPassword.join(', ') });
      }
      if (state.errors?.newPassword) {
          form.setError('newPassword', { type: 'manual', message: state.errors.newPassword.join(', ') });
      }
      if (state.errors?.confirmPassword) {
          form.setError('confirmPassword', { type: 'manual', message: state.errors.confirmPassword.join(', ') });
      }
       if (state.errors?._form) {
          // Display general errors if needed
      }
    }
  }, [state, form]);

  return (
    <Form {...form}>
      <form action={submitAction} className="space-y-4">
        <input type="hidden" name="userId" value={userId} />
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Changing..." : "Change Password"}
        </Button>
      </form>
    </Form>
  );
}

// --- Main Settings Page Component ---
export default function SettingsPage() {
  const { user, isLoading } = useAuth(); // Get current user

  if (isLoading) {
      return <div>Loading user information...</div>; // Or a proper skeleton loader
  }

  if (!user) {
      return <div>User not found or not logged in.</div>; // Handle case where user is not available
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your personal information and security settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your name and view your email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div>
               <Label className="text-sm font-medium text-muted-foreground">Email</Label>
               <p className="text-sm font-mono bg-muted p-2 rounded-md mt-1">{user.email}</p>
           </div>
           <NameUpdateForm userId={user.id} currentName={user.name || ''} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your account password.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <PasswordUpdateForm userId={user.id} />
        </CardContent>
      </Card>
      
    </div>
  );
} 
"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useActionState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogClose
} from "@/components/ui/dialog";
import { createUser, updateUser, UserFormState } from '@/actions/user-actions';
import { toast } from "sonner";

// Define the structure for user data passed as props
interface UserData {
  id: string;
  name: string;
  email: string;
  role: string; // Keep as string here, validation is via schema
  organization?: string | null;
  createdAt: Date;
}

// Define the form schema using Zod
const userFormSchema = z.object({
  id: z.string().optional(), // Include id for updates
  name: z.string().min(1, { message: "Name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  role: z.enum(["admin", "health_worker", "researcher", "public"]), // Use the correct roles
  organization: z.string().optional(),
  // Add password fields
  password: z.string().min(8, { message: "Password must be at least 8 characters." }).optional(), // Optional initially
  confirmPassword: z.string().optional(), // Optional initially
}).refine((data) => {
  // If ID exists (editing), password is not required unless provided
  if (data.id && !data.password) {
    return true;
  }
  // If no ID (creating), password is required
  if (!data.id && !data.password) {
      // Set an error on the password field manually if needed, though required fields are usually handled by refine context
      // For simplicity, we rely on the required nature when creating
      return false; 
  }
  // If password is provided, confirmPassword must match
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  // Refinement message for password mismatch
  message: "Passwords do not match",
  path: ["confirmPassword"], // Apply error specifically to confirmPassword field
}).refine((data) => {
    // Refinement to make password required only when creating (no id)
    if (!data.id && !data.password) {
        return false;
    }
    return true;
}, {
    message: "Password is required when creating a user",
    path: ["password"],
});

interface UserFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  userData: UserData | null; // Use the UserData interface
}

const initialState: UserFormState = { 
  message: "", 
  success: false, 
  errors: undefined // Match initial state type from imported UserFormState if needed
};

export function UserForm({ isOpen, setIsOpen, userData }: UserFormProps) {
  const isEditing = !!userData?.id;
  const serverAction = isEditing ? updateUser : createUser;

  // Use the imported UserFormState type
  const [state, submitAction] = useActionState<UserFormState, FormData>(serverAction, initialState);

  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      id: userData?.id || undefined, 
      name: userData?.name || '',
      email: userData?.email || '',
      // Assign role directly if it exists, let resolver validate
      role: userData?.role as z.infer<typeof userFormSchema>['role'] | undefined,
      organization: userData?.organization || '',
      password: '', 
      confirmPassword: '', 
    },
  });

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || (isEditing ? 'User updated successfully!' : 'User created successfully!'));
      form.reset(); // Reset form on success
      setIsOpen(false);
    } else if (state.message && !state.success) {
      toast.error(state.message || 'An error occurred.');
      if (state.errors) {
        Object.entries(state.errors).forEach(([key, value]) => {
          // Check if value is an array before joining
          if (key !== '_form' && Array.isArray(value)) { // Exclude _form errors here
            form.setError(key as keyof z.infer<typeof userFormSchema>, {
              type: 'manual',
              message: value.join(', ')
            });
          }
        });
         // Optionally display _form errors separately
        if (state.errors._form) {
          toast.error(state.errors._form.join(', '));
        }
      }
    }
  // Add form to dependency array as we call form.setError and form.reset
  }, [state, setIsOpen, form, isEditing]); 

  // Wrap server action call in a function for handleSubmit
  const processForm = async (data: z.infer<typeof userFormSchema>) => {
    // Create FormData
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Ensure boolean values are converted to string if needed by server action
        formData.append(key, String(value)); 
      }
    });
    // If editing, ensure ID is appended (if not already in data)
    if (isEditing && userData?.id && !formData.has('id')) {
      formData.append('id', userData.id);
    }
    
    // Directly call the server action instead of submitAction
    // Pass initialState and formData. useActionState will still catch the result.
    // Note: This assumes serverAction can handle this invocation pattern.
    // It might be better to ensure serverAction correctly handles (prevState, formData)
    // and stick to submitAction(formData) if the type error can be fixed otherwise.
    await serverAction(initialState, formData); 
    
    // Remove the previous call: submitAction(formData); 
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit User' : 'Create New User'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the user details.' : 'Fill in the details to create a new user.'}
          </DialogDescription>
        </DialogHeader>
        {/* Pass form control */}
        <Form {...form}>
          {/* Use form element with react-hook-form's handleSubmit */}
          <form onSubmit={form.handleSubmit(processForm)} className="space-y-4">
            {/* Form Fields using <FormField> */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="health_worker">Health Worker</SelectItem>
                      <SelectItem value="researcher">Researcher</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ministry of Health" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password {isEditing ? '(Optional - Leave blank to keep current)' : ''}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password Field */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Display general form errors from state._form maybe? */}
            {state.errors?._form && (
               <p className="text-sm font-medium text-destructive">
                 {state.errors._form.join(', ')}
               </p>
             )}

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : (isEditing ? 'Update User' : 'Create User')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 
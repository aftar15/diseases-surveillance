"use server";

import { z } from "zod";
// Remove unused db import
// import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcryptjs';
import { UserRole } from "@/types"; // Import the UserRole enum

const prisma = new PrismaClient();

// Schema for creating a user (password required)
const createUserSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Invalid email address."),
  // Validate role against the UserRole enum
  role: z.nativeEnum(UserRole, { // Use z.nativeEnum
    errorMap: () => ({ message: "Invalid role selected." }),
  }),
  organization: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters."), // Password required
});

// Schema for updating a user (password optional)
const updateUserSchema = z.object({
  id: z.string(), // ID is required for update
  name: z.string().min(1, "Name is required.").optional(),
  email: z.string().email("Invalid email address.").optional(),
  // Validate optional role against the UserRole enum
  role: z.nativeEnum(UserRole, { // Use z.nativeEnum
    errorMap: () => ({ message: "Invalid role selected." }),
  }).optional(),
  organization: z.string().nullable().optional(),
  password: z.string().min(8, "Password must be at least 8 characters.").optional(), // Password optional
});

// Define the state structure returned by actions
export interface UserFormState {
  message: string;
  success: boolean;
  errors?: {
    name?: string[];
    email?: string[];
    role?: string[];
    organization?: string[];
    password?: string[]; // Add password errors
    _form?: string[]; // For general form errors
  };
}

// Helper function to handle validation and error formatting
function validateAndFormatErrors<T extends z.ZodTypeAny>(
  schema: T, 
  data: unknown
): { validatedData: z.infer<T> | null; errors: UserFormState['errors'] | undefined } {
  const validationResult = schema.safeParse(data);
  if (!validationResult.success) {
    return {
      validatedData: null,
      errors: validationResult.error.flatten().fieldErrors as UserFormState['errors'] ?? undefined,
    };
  }
  return { validatedData: validationResult.data, errors: undefined };
}

// Server Action: Create User
export async function createUser(
  prevState: UserFormState, 
  formData: FormData
): Promise<UserFormState> {
  const rawData = Object.fromEntries(formData.entries());

  // Validate data
  const { validatedData, errors } = validateAndFormatErrors(createUserSchema, rawData);

  if (!validatedData) {
    return {
      message: "Validation failed. Please check the fields.",
      success: false,
      errors: errors,
    };
  }

  try {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    if (existingUser) {
      return { message: "Email already exists.", success: false, errors: { email: ["Email already in use."] } };
    }

    // Ensure password is a string before hashing
    if (typeof validatedData.password !== 'string') {
       return { message: "Invalid password provided.", success: false, errors: { password: ["Password must be a string."] } };
    }
    const hashedPassword = await bcrypt.hash(validatedData.password, 10); // Salt rounds = 10

    // Create user in database
    await prisma.user.create({
      data: {
        ...validatedData,
        password: hashedPassword, // Use hashed password
        organization: validatedData.organization || null,
      },
    });

    revalidatePath('/dashboard/users'); // Revalidate the users page cache
    return { message: "User created successfully!", success: true };

  } catch (error) {
    console.error("Create User Error:", error);
    return { message: "Database error: Failed to create user.", success: false, errors: { _form: ["An unexpected error occurred."] } };
  }
}

// Server Action: Update User
export async function updateUser(
  prevState: UserFormState, 
  formData: FormData
): Promise<UserFormState> {
  const rawData = Object.fromEntries(formData.entries());

  // Validate data
   const { validatedData, errors } = validateAndFormatErrors(updateUserSchema, rawData);

  if (!validatedData) {
    return {
      message: "Validation failed. Please check the fields.",
      success: false,
      errors: errors,
    };
  }

  const { id, ...updateData } = validatedData;

  try {
    // Check if email is being changed and if the new email already exists
    if (updateData.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: updateData.email },
      });
      // Allow update if the found email belongs to the user being updated
      if (existingUser && existingUser.id !== id) {
        return { message: "Email already exists.", success: false, errors: { email: ["Email already in use by another user."] } };
      }
    }

    // Hash password ONLY if it was provided and is a string
    const dataToUpdate: Record<string, unknown> = { ...updateData }; // Use const and Record<string, unknown> instead of any
    if (updateData.password && typeof updateData.password === 'string') {
      dataToUpdate.password = await bcrypt.hash(updateData.password, 10);
    } else {
      // Explicitly remove password field if not provided or not a string
      delete dataToUpdate.password; 
    }

    // Handle potentially null organization
    if ('organization' in dataToUpdate) {
      dataToUpdate.organization = dataToUpdate.organization || null;
    }

    // Update user in database
    await prisma.user.update({
      where: { id: id }, 
      data: dataToUpdate,
    });

    revalidatePath('/dashboard/users'); // Revalidate the users page cache
    return { message: "User updated successfully!", success: true };

  } catch (error) {
    console.error("Update User Error:", error);
    return { message: "Database error: Failed to update user.", success: false, errors: { _form: ["An unexpected error occurred."] } };
  }
}

// Server Action: Delete User
export async function deleteUser(id: string): Promise<{ success: boolean; message: string }> {
  try {
    await prisma.user.delete({
      where: { id },
    });
    revalidatePath('/dashboard/users');
    return { success: true, message: 'User deleted successfully.' };
  } catch (error) {
    console.error("Delete User Error:", error);
    return { success: false, message: 'Database error: Failed to delete user.' };
  }
} 
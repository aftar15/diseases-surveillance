"use server";

import { z } from 'zod';
import { db } from "@/lib/db";
import bcrypt from 'bcryptjs';

// Define state structure for profile actions
export interface ProfileFormState {
  message: string;
  success: boolean;
  errors?: {
    name?: string[];
    currentPassword?: string[];
    newPassword?: string[];
    confirmPassword?: string[];
    _form?: string[];
  };
}

// Schema for name update
const updateNameSchema = z.object({
  userId: z.string(),
  name: z.string().min(1, "Name cannot be empty."),
});

// Schema for password update
const updatePasswordSchema = z.object({
  userId: z.string(),
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(8, "New password must be at least 8 characters."),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords do not match",
  path: ["confirmPassword"],
});


// --- Update Profile Name Action ---
export async function updateProfileName(
  prevState: ProfileFormState, 
  formData: FormData
): Promise<ProfileFormState> {
  const rawData = Object.fromEntries(formData.entries());
  const validationResult = updateNameSchema.safeParse(rawData);

  if (!validationResult.success) {
    return {
      message: "Validation failed.",
      success: false,
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  const { userId, name } = validationResult.data;

  try {
    await db.user.update({
      where: { id: userId },
      data: { name: name },
    });
    // Consider revalidating paths if the name is displayed elsewhere
    // revalidatePath('/some/path');
    return { message: "Name updated successfully!", success: true };
  } catch (error) {
    console.error("Update Name Error:", error);
    return { message: "Failed to update name.", success: false, errors: { _form: ["Database error."] } };
  }
}

// --- Update Profile Password Action ---
export async function updateProfilePassword(
  prevState: ProfileFormState, 
  formData: FormData
): Promise<ProfileFormState> {
  const rawData = Object.fromEntries(formData.entries());
  const validationResult = updatePasswordSchema.safeParse(rawData);

  if (!validationResult.success) {
    return {
      message: "Validation failed.",
      success: false,
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  const { userId, currentPassword, newPassword } = validationResult.data;

  try {
    const user = await db.user.findUnique({ where: { id: userId } });

    if (!user || !user.password) {
      return { message: "User not found or password not set.", success: false, errors: { _form: ["An error occurred."] } };
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return { message: "Incorrect current password.", success: false, errors: { currentPassword: ["Incorrect password."] } };
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    await db.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { message: "Password updated successfully!", success: true };
  } catch (error) {
    console.error("Update Password Error:", error);
    return { message: "Failed to update password.", success: false, errors: { _form: ["Database error."] } };
  }
} 
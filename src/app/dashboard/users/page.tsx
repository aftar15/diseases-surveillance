import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db"; // Import Prisma client
import { Badge } from "@/components/ui/badge"; // For displaying roles
import { UserTable } from "@/components/dashboard/users/user-table"; // Import the new client component
import { ProtectedPage } from "@/components/auth/protected-page";
import { UserRole } from "@/types";

// Define the structure for user data we want to display
interface UserDisplayData {
  id: string;
  name: string;
  email: string;
  role: string;
  organization?: string | null;
  createdAt: Date;
}

// Function to fetch user data
async function getUsers(): Promise<UserDisplayData[]> {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organization: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    // Infer type for the user data selected
    type UserDataType = typeof users[number];

    // Ensure role is returned as a string if it's an enum
    // Add inferred type to parameter
    return users.map((user: UserDataType) => ({ ...user, role: String(user.role) }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

// Define metadata for the page (optional, can be done in layout too)
export const metadata = {
  title: "User Management | DSMS Dashboard",
  description: "Manage users and roles for the Disease Monitoring System.",
};

// Make page component async
export default async function UserManagementPage() {
  // Fetch users server-side
  const users = await getUsers();

  return (
    <ProtectedPage requiredRole={UserRole.Admin} redirectTo="/unauthorized">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-muted-foreground">
            View, edit, and manage user accounts and roles.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User List ({users.length})</CardTitle>
            <CardDescription>
              List of all registered users in the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Render the UserTable client component, passing users */}
            <UserTable users={users} />
          </CardContent>
        </Card>
      </div>
    </ProtectedPage>
  );
} 
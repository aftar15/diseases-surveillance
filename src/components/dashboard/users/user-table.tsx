"use client";

import React, { useState, useTransition } from 'react';
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PencilIcon, TrashIcon, PlusCircleIcon } from 'lucide-react';
import { format } from "date-fns";
import { UserForm } from './user-form';
import { deleteUser } from '@/actions/user-actions';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface UserDisplayData {
  id: string;
  name: string;
  email: string;
  role: string;
  organization?: string | null;
  createdAt: Date;
}

interface UserTableProps {
  users: UserDisplayData[];
}

export function UserTable({ users }: UserTableProps) {
  const [isPending, startTransition] = useTransition();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDisplayData | null>(null);

  const handleAdd = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };
  
  const handleEdit = (user: UserDisplayData) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = (user: UserDisplayData) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = () => {
    if (!selectedUser) return;

    startTransition(async () => {
      const result = await deleteUser(selectedUser.id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    });
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={handleAdd}>
           <PlusCircleIcon className="mr-2 h-4 w-4" />
           Add User
        </Button>
      </div>
      <Table>
        <TableCaption>A list of registered users.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Organization</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin' ? 'destructive' : 'outline'}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>{user.organization || 'N/A'}</TableCell>
                <TableCell>{format(user.createdAt, 'PPP')}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleEdit(user)}>
                        <PencilIcon className="mr-2 h-4 w-4" />
                        Edit User
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive focus:bg-destructive/10"
                        onClick={() => handleDeleteConfirm(user)}
                      >
                        <TrashIcon className="mr-2 h-4 w-4" />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <UserForm 
        key={selectedUser?.id ?? 'new'}
        isOpen={isFormOpen} 
        setIsOpen={setIsFormOpen} 
        userData={selectedUser} 
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user 
              <span className='font-medium'>{selectedUser?.name ? `"${selectedUser.name}"` : ''}</span> 
              and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedUser(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeDelete}
              disabled={isPending} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Deleting..." : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 
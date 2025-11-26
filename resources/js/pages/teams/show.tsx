import { HeaderSection } from "@/components/header-section";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from "@/layouts/app-layout";
import { type Team, type User } from "@/types";
import { Link, router, useForm } from "@inertiajs/react";
import { ArrowLeft, Edit, Trash2, UserPlus, Users } from "lucide-react";
import { useState } from "react";

interface TeamsShowProps {
    team: Team;
    isAdmin?: boolean;
}

const ROLE_COLORS: Record<string, string> = {
    admin: "bg-red-50 text-red-700 border-red-200",
    product_owner: "bg-purple-50 text-purple-700 border-purple-200",
    scrum_master: "bg-blue-50 text-blue-700 border-blue-200",
    developer: "bg-green-50 text-green-700 border-green-200",
};

const ROLE_LABELS: Record<string, string> = {
    admin: "Admin",
    product_owner: "Product Owner",
    scrum_master: "Scrum Master",
    developer: "Developer",
};

export default function TeamsShow({ team, isAdmin = false }: TeamsShowProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
    });
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedRole, setSelectedRole] = useState<string>("developer");

    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/teams/${team.id}/members`, {
            onSuccess: () => reset(),
        });
    };

    const handleRemoveMember = (user: User) => {
        if (confirm(`Are you sure you want to remove ${user.name} from this team?`)) {
            router.delete(`/teams/${team.id}/members/${user.id}`);
        }
    };

    const handleOpenRoleDialog = (user: User) => {
        setSelectedUser(user);
        const userRole = (user as any).pivot?.role || "developer";
        setSelectedRole(userRole);
        setRoleDialogOpen(true);
    };

    const handleUpdateRole = () => {
        if (!selectedUser) return;
        router.put(
            `/teams/${team.id}/members/${selectedUser.id}/role`,
            { role: selectedRole },
            {
                onSuccess: () => {
                    setRoleDialogOpen(false);
                    setSelectedUser(null);
                },
            },
        );
    };

    const getUserRole = (user: User): string => {
        return (user as any).pivot?.role || "developer";
    };

    return (
        <AppLayout>
            <div className="mt-6">
                <Link
                    href="/teams"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Teams
                </Link>
            </div>

            <HeaderSection title={`${team.name} Team`} description="Manage your team's projects." className="mt-0" />

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Add Member */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5" />
                            Add Member
                        </CardTitle>
                        <CardDescription>Invite a new member to join this team.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddMember} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData("email", e.target.value)}
                                    placeholder="Enter member's email"
                                    className={errors.email ? "border-destructive" : ""}
                                />
                                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                            </div>
                            <Button type="submit" disabled={processing}>
                                {processing ? "Adding..." : "Add Member"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Członkowie */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Team Members
                        </CardTitle>
                        <CardDescription>
                            {team.users?.length || 0} member{(team.users?.length || 0) !== 1 ? "s" : ""}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {team.users?.map((user) => {
                                const role = getUserRole(user);
                                return (
                                    <div key={user.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={user.avatar} alt={user.name} />
                                                <AvatarFallback className="text-xs">
                                                    {user.name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")
                                                        .toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium">{user.name}</p>
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-xs ${ROLE_COLORS[role] || ROLE_COLORS.developer}`}
                                                    >
                                                        {ROLE_LABELS[role] || ROLE_LABELS.developer}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {isAdmin && (
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleOpenRoleDialog(user)}
                                                    title="Change role"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {isAdmin && (
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleRemoveMember(user)}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {(!team.users || team.users.length === 0) && (
                                <p className="text-center text-sm text-muted-foreground">No members yet</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-6">
                <Link href={`/teams/${team.id}/edit`}>
                    <Button variant="outline">
                        <Users className="mr-2 h-4 w-4" />
                        Edit Team Settings
                    </Button>
                </Link>
            </div>

            {roleDialogOpen && selectedUser && (
                <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Change Role for {selectedUser.name}</DialogTitle>
                            <DialogDescription>Select a new role for this team member.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label htmlFor="role">Role</Label>
                                <Select value={selectedRole} onValueChange={setSelectedRole}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="developer">Developer</SelectItem>
                                        <SelectItem value="scrum_master">Scrum Master</SelectItem>
                                        <SelectItem value="product_owner">Product Owner</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdateRole}>Update Role</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </AppLayout>
    );
}

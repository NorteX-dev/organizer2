import { HeaderSection } from "@/components/header-section";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from "@/layouts/app-layout";
import { type Team, type User } from "@/types";
import { Link, router, useForm } from "@inertiajs/react";
import { ArrowLeft, Trash2, UserPlus, Users } from "lucide-react";

interface TeamsShowProps {
    team: Team;
}

export default function TeamsShow({ team }: TeamsShowProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
    });

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

                {/* Team Members */}
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
                            {team.users?.map((user) => (
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
                                            <p className="text-sm font-medium">{user.name}</p>
                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleRemoveMember(user)}
                                        className="text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
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
        </AppLayout>
    );
}

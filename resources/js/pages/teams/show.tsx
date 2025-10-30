import { AppHeader } from "@/components/app-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import teams from "@/routes/teams";
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
        post(teams.members.add.url({ team: team.id }), {
            onSuccess: () => reset(),
        });
    };

    const handleRemoveMember = (user: User) => {
        if (confirm(`Are you sure you want to remove ${user.name} from this team?`)) {
            router.delete(teams.members.remove.url({ team: team.id, user: user.id }));
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <AppHeader />
            <div className="mx-auto max-w-4xl px-4 py-8">
                <div className="mb-8">
                    <Link
                        href={teams.index.url()}
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Teams
                    </Link>
                </div>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
                    <p className="text-muted-foreground">Manage team members and settings.</p>
                </div>

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
                    <Link href={teams.edit.url({ team: team.id })}>
                        <Button variant="outline">
                            <Users className="mr-2 h-4 w-4" />
                            Edit Team Settings
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

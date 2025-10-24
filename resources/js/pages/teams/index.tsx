import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type Team } from '@/types';
import { Link, router } from '@inertiajs/react';
import { Plus, Users, Settings, Trash2 } from 'lucide-react';
import teams from '@/routes/teams';

interface TeamsIndexProps {
    teams: Team[];
    currentTeam?: Team | null;
}

export default function TeamsIndex({ teams: teamsData, currentTeam }: TeamsIndexProps) {
    const handleDeleteTeam = (team: Team) => {
        if (confirm(`Are you sure you want to delete "${team.name}"? This action cannot be undone.`)) {
            router.delete(teams.destroy.url({ team: team.id }));
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <AppHeader />
            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
                        <p className="text-muted-foreground">
                            Manage your teams and collaborate with others.
                        </p>
                    </div>
                    <Link href={teams.create.url()}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Team
                        </Button>
                    </Link>
                </div>

                {teamsData.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Users className="mb-4 h-12 w-12 text-muted-foreground" />
                            <h3 className="mb-2 text-lg font-semibold">No teams yet</h3>
                            <p className="mb-4 text-center text-muted-foreground">
                                Create your first team to start collaborating with others.
                            </p>
                            <Link href={teams.create.url()}>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Team
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {teamsData.map((team) => (
                            <Card key={team.id} className="relative">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            {team.name}
                                        </CardTitle>
                                        {currentTeam?.id === team.id && (
                                            <span className="rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
                                                Current
                                            </span>
                                        )}
                                    </div>
                                    <CardDescription>
                                        {team.users?.length || 0} member{(team.users?.length || 0) !== 1 ? 's' : ''}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-2">
                                        <Link href={teams.show.url({ team: team.id })} className="flex-1">
                                            <Button variant="outline" className="w-full">
                                                <Settings className="mr-2 h-4 w-4" />
                                                Manage
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleDeleteTeam(team)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

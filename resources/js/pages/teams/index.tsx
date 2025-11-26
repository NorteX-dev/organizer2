import { HeaderSection } from "@/components/header-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { type Team } from "@/types";
import { Link, router } from "@inertiajs/react";
import { Plus, Settings, Trash2, Users } from "lucide-react";

interface TeamsIndexProps {
    teams: Team[];
    currentTeam?: Team | null;
}

export default function TeamsIndex({ teams: teamsData, currentTeam }: TeamsIndexProps) {
    const handleDeleteTeam = (team: Team) => {
        if (confirm(`Czy na pewno chcesz usunąć "${team.name}"? Tej akcji nie można cofnąć.`)) {
            router.delete(`/teams/${team.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: "Projekty", href: "/projects" }]}>
            <HeaderSection
                title="Zespoły"
                description="Zarządzaj zespołami i współpracuj z innymi."
                rightHandItem={
                    <Link href="/teams/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Utwórz zespół
                        </Button>
                    </Link>
                }
            />
            <div>
                {teamsData.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Users className="mb-4 h-12 w-12 text-muted-foreground" />
                            <h3 className="mb-2 text-lg font-semibold">Brak zespołów</h3>
                            <p className="mb-4 text-center text-muted-foreground">
                                Utwórz swój pierwszy zespół, aby rozpocząć współpracę z innymi.
                            </p>
                            <Link href="/teams/create">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Utwórz zespół
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
                                                Aktualny
                                            </span>
                                        )}
                                    </div>
                                    <CardDescription>
                                        {team.users?.length || 0} {team.users?.length === 1 ? "członek" : team.users?.length === 0 || (team.users?.length || 0) % 10 >= 2 && (team.users?.length || 0) % 10 <= 4 && ((team.users?.length || 0) % 100 < 10 || (team.users?.length || 0) % 100 >= 20) ? "członków" : "członków"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-2">
                                        <Link href={`/teams/${team.id}`} className="flex-1">
                                            <Button variant="outline" className="w-full">
                                                <Settings className="mr-2 h-4 w-4" />
                                                Zarządzaj
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
        </AppLayout>
    );
}

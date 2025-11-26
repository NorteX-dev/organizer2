import { DropdownMenuGroup, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Team } from "@/types";
import { router } from "@inertiajs/react";
import { Edit, Plus, Users } from "lucide-react";

interface TeamSelectorProps {
    teams: Team[];
    currentTeam?: Team | null;
}

export function TeamSelector({ teams: teamsData, currentTeam }: TeamSelectorProps) {
    const handleTeamSwitch = (value: string) => {
        if (value === "create-new") {
            router.visit("/teams/create");
            return;
        }

        if (value === "edit-team" && currentTeam) {
            router.visit(`/teams/${currentTeam.id}`);
            return;
        }

        const team = teamsData.find((t) => t.id === parseInt(value));
        if (team) {
            router.post(
                `/teams/${team.id}/switch`,
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }
    };

    return (
        <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    Zespoły
                </DropdownMenuLabel>
                <div className="px-2 py-1">
                    <Select value={currentTeam?.id?.toString() || ""} onValueChange={handleTeamSwitch}>
                        <SelectTrigger className="h-8 w-full">
                            <SelectValue placeholder="Wybierz zespół">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span className="truncate">{currentTeam?.name || "Wybierz zespół"}</span>
                                </div>
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {teamsData.length === 0 ? (
                                <>
                                    {currentTeam && (
                                        <SelectItem value="edit-team">
                                            <div className="flex items-center gap-2">
                                                <Edit className="h-4 w-4" />
                                                <span>Edytuj zespół</span>
                                            </div>
                                        </SelectItem>
                                    )}
                                    <SelectItem value="create-new">
                                        <div className="flex items-center gap-2">
                                            <Plus className="h-4 w-4" />
                                            <span>Utwórz nowy zespół</span>
                                        </div>
                                    </SelectItem>
                                </>
                            ) : (
                                <>
                                    {teamsData.map((team) => (
                                        <SelectItem key={team.id} value={team.id.toString()}>
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                <span>{team.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                    {currentTeam && (
                                        <SelectItem value="edit-team">
                                            <div className="flex items-center gap-2">
                                                <Edit className="h-4 w-4" />
                                                <span>Edytuj zespół</span>
                                            </div>
                                        </SelectItem>
                                    )}
                                    <SelectItem value="create-new">
                                        <div className="flex items-center gap-2">
                                            <Plus className="h-4 w-4" />
                                            <span>Utwórz nowy zespół</span>
                                        </div>
                                    </SelectItem>
                                </>
                            )}
                        </SelectContent>
                    </Select>
                </div>
            </DropdownMenuGroup>
        </>
    );
}

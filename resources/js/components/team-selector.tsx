import { DropdownMenuGroup, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Team } from "@/types";
import { router } from "@inertiajs/react";
import { Users } from "lucide-react";

interface TeamSelectorProps {
    teams: Team[];
    currentTeam?: Team | null;
}

export function TeamSelector({ teams: teamsData, currentTeam }: TeamSelectorProps) {
    const handleTeamSwitch = (teamId: string) => {
        const team = teamsData.find((t) => t.id === parseInt(teamId));
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

    if (teamsData.length === 0) {
        return null;
    }

    return (
        <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    Teams
                </DropdownMenuLabel>
                <div className="px-2 py-1">
                    <Select value={currentTeam?.id?.toString() || ""} onValueChange={handleTeamSwitch}>
                        <SelectTrigger className="h-8 w-full">
                            <SelectValue placeholder="Select team">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span className="truncate">{currentTeam?.name || "Select team"}</span>
                                </div>
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {teamsData.map((team) => (
                                <SelectItem key={team.id} value={team.id.toString()}>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        <span>{team.name}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </DropdownMenuGroup>
        </>
    );
}

import { TeamSelector } from "@/components/team-selector";
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { UserInfo } from "@/components/user-info";
import { useMobileNavigation } from "@/hooks/use-mobile-navigation";
import { type SharedData, type User } from "@/types";
import { Link, router, usePage } from "@inertiajs/react";
import { LogOut } from "lucide-react";

interface UserMenuContentProps {
    user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();
    const page = usePage<SharedData>();
    const { teams, currentTeam } = page.props;

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <TeamSelector teams={teams || []} currentTeam={currentTeam} />
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link
                    className="block w-full"
                    href="/logout"
                    as="button"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <LogOut className="mr-2" />
                    Wyloguj się
                </Link>
            </DropdownMenuItem>
        </>
    );
}

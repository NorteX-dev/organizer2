import { HeaderSection } from "@/components/header-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from "@/layouts/app-layout";
import type { Project, ProjectActivity, User } from "@/types";
import { router } from "@inertiajs/react";
import { Activity, Filter, User as UserIcon } from "lucide-react";
import { useMemo, useState } from "react";

interface ActivitiesPageProps {
    project: Project;
    activities: {
        data: ProjectActivity[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    users: User[];
    filters: {
        action?: string;
        user_id?: string;
        date_from?: string;
        date_to?: string;
    };
    availableActions: string[];
}

const ACTION_LABELS: Record<string, string> = {
    "task.created": "Utworzono zadanie",
    "task.updated": "Zaktualizowano zadanie",
    "task.deleted": "Usunięto zadanie",
    "task.added_to_sprint": "Dodano zadanie do sprintu",
    "task.moved_to_backlog": "Przeniesiono zadanie do backlogu",
    "task.subtask_created": "Utworzono podzadanie",
    "sprint.created": "Utworzono sprint",
    "sprint.updated": "Zaktualizowano sprint",
    "sprint.deleted": "Usunięto sprint",
    "project.created": "Utworzono projekt",
    "project.updated": "Zaktualizowano projekt",
    "project.deleted": "Usunięto projekt",
};

const ACTION_COLORS: Record<string, string> = {
    "task.created": "bg-green-50 text-green-700 border-green-200",
    "task.updated": "bg-blue-50 text-blue-700 border-blue-200",
    "task.deleted": "bg-red-50 text-red-700 border-red-200",
    "task.added_to_sprint": "bg-purple-50 text-purple-700 border-purple-200",
    "task.moved_to_backlog": "bg-orange-50 text-orange-700 border-orange-200",
    "task.subtask_created": "bg-indigo-50 text-indigo-700 border-indigo-200",
    "sprint.created": "bg-green-50 text-green-700 border-green-200",
    "sprint.updated": "bg-blue-50 text-blue-700 border-blue-200",
    "sprint.deleted": "bg-red-50 text-red-700 border-red-200",
    "project.created": "bg-green-50 text-green-700 border-green-200",
    "project.updated": "bg-blue-50 text-blue-700 border-blue-200",
    "project.deleted": "bg-red-50 text-red-700 border-red-200",
};

function formatActivityDescription(activity: ProjectActivity): string {
    const metadata = activity.metadata || {};
    const action = activity.action;

    switch (action) {
        case "task.created":
        case "task.updated":
        case "task.deleted":
        case "task.added_to_sprint":
        case "task.moved_to_backlog":
        case "task.subtask_created":
            const title = (metadata.title as string) || "Zadanie";
            if (action === "task.updated" && metadata.status_changed) {
                const statusChange = metadata.status_changed as { from: string; to: string };
                return `${title} - zmiana statusu z "${statusChange.from}" na "${statusChange.to}"`;
            }
            if (action === "task.updated" && metadata.assigned_changed) {
                return `${title} - zmiana przypisania`;
            }
            if (action === "task.subtask_created" && metadata.parent_task_title) {
                return `${title} (podzadanie: ${metadata.parent_task_title as string})`;
            }
            if (action === "task.added_to_sprint" && metadata.sprint_name) {
                return `${title} → ${metadata.sprint_name as string}`;
            }
            if (action === "task.moved_to_backlog" && metadata.sprint_name) {
                return `${title} ← ${metadata.sprint_name as string}`;
            }
            return title;

        case "sprint.created":
        case "sprint.updated":
        case "sprint.deleted":
            return (metadata.name as string) || "Sprint";

        case "project.created":
        case "project.updated":
        case "project.deleted":
            return (metadata.name as string) || "Projekt";

        default:
            return "Aktywność";
    }
}

export default function ActivitiesPage({
    project,
    activities,
    users,
    filters: initialFilters,
    availableActions,
}: ActivitiesPageProps) {
    const [filters, setFilters] = useState({
        action: initialFilters.action && initialFilters.action !== "" ? initialFilters.action : "all",
        user_id: initialFilters.user_id && initialFilters.user_id !== "" ? initialFilters.user_id : "all",
        date_from: initialFilters.date_from || "",
        date_to: initialFilters.date_to || "",
    });

    function handleFilterChange(key: string, value: string) {
        const newFilters = { ...filters, [key]: value === "all" ? "" : value };
        const displayFilters = { ...filters, [key]: value };
        setFilters(displayFilters);
        router.get(`/projects/${project.id}/activities`, newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    }

    function clearFilters() {
        const emptyFilters = {
            action: "all",
            user_id: "all",
            date_from: "",
            date_to: "",
        };
        setFilters(emptyFilters);
        router.get(
            `/projects/${project.id}/activities`,
            {
                action: "",
                user_id: "",
                date_from: "",
                date_to: "",
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    }

    function formatDate(dateString: string): string {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("pl-PL", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    }

    const hasActiveFilters = useMemo(() => {
        return (
            filters.action !== "all" || filters.user_id !== "all" || filters.date_from !== "" || filters.date_to !== ""
        );
    }, [filters]);

    return (
        <AppLayout>
            <div className="space-y-6">
                <HeaderSection
                    title="Historia aktywności"
                    description={`Historia wszystkich aktywności w projekcie ${project.name}`}
                />

                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <div className="mb-4 flex items-center gap-4">
                                <Filter className="h-5 w-5 text-neutral-500" />
                                <h3 className="text-lg font-semibold">Filtry</h3>
                                {hasActiveFilters && (
                                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                                        Wyczyść filtry
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div className="space-y-2">
                                    <Label htmlFor="action">Typ aktywności</Label>
                                    <Select
                                        value={filters.action}
                                        onValueChange={(value) => handleFilterChange("action", value)}
                                    >
                                        <SelectTrigger id="action">
                                            <SelectValue placeholder="Wszystkie" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Wszystkie</SelectItem>
                                            {availableActions.map((action) => (
                                                <SelectItem key={action} value={action}>
                                                    {ACTION_LABELS[action] || action}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="user_id">Użytkownik</Label>
                                    <Select
                                        value={filters.user_id}
                                        onValueChange={(value) => handleFilterChange("user_id", value)}
                                    >
                                        <SelectTrigger id="user_id">
                                            <SelectValue placeholder="Wszyscy" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Wszyscy</SelectItem>
                                            {users.map((user) => (
                                                <SelectItem key={user.id} value={String(user.id)}>
                                                    {user.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="date_from">Data od</Label>
                                    <Input
                                        id="date_from"
                                        type="date"
                                        value={filters.date_from}
                                        onChange={(e) => handleFilterChange("date_from", e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="date_to">Data do</Label>
                                    <Input
                                        id="date_to"
                                        type="date"
                                        value={filters.date_to}
                                        onChange={(e) => handleFilterChange("date_to", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {activities.data.length === 0 ? (
                                <div className="py-12 text-center">
                                    <Activity className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
                                    <p className="text-neutral-500">Brak aktywności do wyświetlenia</p>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-3">
                                        {activities.data.map((activity) => (
                                            <div
                                                key={activity.id}
                                                className="flex items-start gap-4 rounded-lg border border-neutral-200 p-4 transition-colors hover:bg-neutral-50"
                                            >
                                                <div className="mt-1 flex-shrink-0">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
                                                        <Activity className="h-5 w-5 text-neutral-600" />
                                                    </div>
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="mb-1 flex items-center gap-2">
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                ACTION_COLORS[activity.action] ||
                                                                "border-neutral-200 bg-neutral-50 text-neutral-700"
                                                            }
                                                        >
                                                            {ACTION_LABELS[activity.action] || activity.action}
                                                        </Badge>
                                                        <span className="text-sm text-neutral-500">
                                                            {formatDate(activity.created_at)}
                                                        </span>
                                                    </div>

                                                    <p className="mb-1 text-sm font-medium text-neutral-900">
                                                        {formatActivityDescription(activity)}
                                                    </p>

                                                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                                                        {activity.user && (
                                                            <div className="flex items-center gap-1">
                                                                <UserIcon className="h-3 w-3" />
                                                                <span>{activity.user.name}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {activities.last_page > 1 && (
                                        <div className="flex items-center justify-between border-t pt-4">
                                            <div className="text-sm text-neutral-500">
                                                Strona {activities.current_page} z {activities.last_page} (
                                                {activities.total} aktywności)
                                            </div>
                                            <div className="flex gap-2">
                                                {activities.current_page > 1 && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            router.get(
                                                                `/projects/${project.id}/activities`,
                                                                { ...filters, page: activities.current_page - 1 },
                                                                { preserveState: true },
                                                            )
                                                        }
                                                    >
                                                        Poprzednia
                                                    </Button>
                                                )}
                                                {activities.current_page < activities.last_page && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            router.get(
                                                                `/projects/${project.id}/activities`,
                                                                { ...filters, page: activities.current_page + 1 },
                                                                { preserveState: true },
                                                            )
                                                        }
                                                    >
                                                        Następna
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

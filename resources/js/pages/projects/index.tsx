import { HeaderSection } from "@/components/header-section";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from "@/layouts/app-layout";
import type { Project } from "@/types";
import { Head, Link, router } from "@inertiajs/react";
import { PencilIcon, SearchIcon, Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";

interface ProjectsPaginated {
    data: Project[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export default function ProjectsIndexPage({
    projects,
    search: initialSearch = "",
}: {
    projects: ProjectsPaginated;
    search?: string;
}) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ name: "", status: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState(initialSearch);

    function handleSubmit(e: any) {
        e.preventDefault();
        setLoading(true);
        router.post("/projects", form, {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                setLoading(false);
                setForm({ name: "", status: "" });
            },
            onError: () => {
                setLoading(false);
                setError("Wystąpił błąd podczas tworzenia projektu.");
            },
        });
    }

    function handleDeleteProject(e: any, projectId: number) {
        e.preventDefault();
        if (!confirm("Czy na pewno chcesz usunąć ten projekt?")) return;
        setLoading(true);
        setError(null);
        router.delete(`/projects/${projectId}`, {
            preserveScroll: true,
            onError: () => {
                setError("Wystąpił błąd podczas usuwania projektu.");
                setLoading(false);
            },
            onSuccess: () => {
                setLoading(false);
            },
        });
    }

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (search !== initialSearch) {
                router.get(
                    "/projects",
                    { search: search || "" },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                    },
                );
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search, initialSearch]);

    function formatDate(dateString: string): string {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("pl-PL", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }).format(date);
    }

    function translateStatus(status: string): string {
        const statusMap: { [key: string]: string } = {
            active: "Aktywny",
            archived: "Zarchiwizowany",
            paused: "Wstrzymany",
        };
        return statusMap[status?.toLowerCase()] || status;
    }

    return (
        <AppLayout breadcrumbs={[{ title: "Projekty", href: "/projects" }]}>
            <Head title="Projekty" />
            <HeaderSection
                title="Projekty"
                description="Zarządzaj projektami swojego zespołu."
                rightHandItem={
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <SearchIcon className="absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Szukaj po nazwie..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-64 pl-8"
                            />
                        </div>
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button variant="default">Nowy projekt</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Nowy projekt</DialogTitle>
                                </DialogHeader>
                                <form className="space-y-4" onSubmit={handleSubmit}>
                                    <div>
                                        <Label className="mb-2 block text-sm font-medium">Nazwa</Label>
                                        <Input
                                            className="input w-full"
                                            required
                                            value={form.name}
                                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label className="mb-2 block text-sm font-medium">Status</Label>
                                        <Input
                                            className="input w-full"
                                            value={form.status}
                                            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                                        />
                                    </div>
                                    {error && <div className="text-sm text-red-500">{error}</div>}
                                    <Button type="submit" disabled={loading}>
                                        Utwórz
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                }
            />
            <div>
                <div className="grid gap-2">
                    {projects.data.length === 0 ? (
                        <div className="text-muted-foreground">Nie znaleziono projektów.</div>
                    ) : (
                        <>
                            <table className="w-full rounded bg-white shadow">
                                <thead>
                                    <tr>
                                        <th className="px-3 py-2 text-left">Nazwa</th>
                                        <th className="px-3 py-2 text-left">Status</th>
                                        <th className="px-3 py-2 text-left">Data utworzenia</th>
                                        <th className="w-6 px-3 py-2">Akcje</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projects.data.map((project: Project) => (
                                        <tr
                                            key={project.id}
                                            className="cursor-pointer border-b last:border-b-0 hover:bg-gray-50"
                                            onClick={() => router.visit(`/projects/${project.id}/sprints`)}
                                        >
                                            <td className="px-3 py-2">{project.name}</td>
                                            <td className="px-3 py-2">{translateStatus(project.status || "")}</td>
                                            <td className="px-3 py-2">{formatDate(project.created_at)}</td>
                                            <td className="flex justify-center space-x-2 px-3 py-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Link href={`/projects/${project.id}/edit`}>
                                                        <PencilIcon />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteProject(e, project.id);
                                                    }}
                                                >
                                                    <Trash2Icon />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {projects.last_page > 1 && (
                                <div className="flex items-center justify-between pt-4">
                                    <div className="text-sm text-muted-foreground">
                                        Strona {projects.current_page} z {projects.last_page} ({projects.total}{" "}
                                        projektów)
                                    </div>
                                    <div className="flex gap-2">
                                        {projects.current_page > 1 && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    router.get(
                                                        "/projects",
                                                        { search, page: projects.current_page - 1 },
                                                        { preserveState: true, preserveScroll: true },
                                                    )
                                                }
                                            >
                                                Poprzednia
                                            </Button>
                                        )}
                                        {projects.current_page < projects.last_page && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    router.get(
                                                        "/projects",
                                                        { search, page: projects.current_page + 1 },
                                                        { preserveState: true, preserveScroll: true },
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
            </div>
        </AppLayout>
    );
}

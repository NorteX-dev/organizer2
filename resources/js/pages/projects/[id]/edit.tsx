import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import { Head, router, usePage } from "@inertiajs/react";
import { Github, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

interface Project {
    id: number;
    name: string;
    description?: string;
    github_repo?: string;
    default_sprint_length?: number;
    status?: string;
}

interface GithubSync {
    id: number;
    project_id: number;
    type: string;
    data: {
        name?: string;
        description?: string;
        stars?: number;
        forks?: number;
        language?: string;
        url?: string;
    };
    synced_at: string;
    created_at: string;
    updated_at: string;
}

interface PageProps {
    project: Project;
    latestGithubSync?: GithubSync | null;
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

export default function ProjectEditPage({ project: initial, latestGithubSync: initialSync }: PageProps) {
    const [project, setProject] = useState(initial);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [syncing, setSyncing] = useState(false);
    const [latestSync, setLatestSync] = useState(initialSync);
    const page = usePage();
    const urlParams = new URLSearchParams(window.location.search);
    const [activeTab, setActiveTab] = useState(urlParams.get("tab") || "details");

    useEffect(() => {
        (async () => {
            if (page.props.latestGithubSync) {
                setLatestSync(page.props.latestGithubSync as GithubSync);
            }
        })();
    }, [page.props.latestGithubSync]);

    useEffect(() => {
        const currentParams = new URLSearchParams(window.location.search);
        const tabParam = currentParams.get("tab");
        if (!tabParam) {
            const url = new URL(window.location.href);
            url.searchParams.set("tab", "details");
            router.visit(url.toString(), {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }
    }, []);

    useEffect(() => {
        const handlePopState = () => {
            const urlParams = new URLSearchParams(window.location.search);
            const tabParam = urlParams.get("tab") || "details";
            setActiveTab(tabParam);
        };
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    function handleTabChange(value: string) {
        setActiveTab(value);
        const url = new URL(window.location.href);
        url.searchParams.set("tab", value);
        window.history.replaceState({}, "", url.toString());
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const { name, value } = e.target;
        setProject((p) => ({ ...p, [name]: value }));
    }
    function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const payload = {
            name: project.name,
            description: project.description,
            github_repo: project.github_repo,
            default_sprint_length: project.default_sprint_length,
            status: project.status,
        };
        router.put(`/projects/${project.id}`, payload, {
            onFinish: () => setLoading(false),
            onError: () => setError("Błąd podczas aktualizacji projektu."),
        });
    }
    function handleDelete() {
        if (!confirm("Usunąć ten projekt?")) return;
        setLoading(true);
        router.delete(`/projects/${project.id}`, {
            onSuccess: () => router.visit("/projects"),
            onError: () => setError("Błąd podczas usuwania projektu."),
        });
    }

    function handleSyncGithub() {
        if (!project.github_repo) {
            setError("Najpierw wprowadź adres URL repozytorium GitHub.");
            return;
        }

        setSyncing(true);
        setError(null);
        router.post(
            `/projects/${project.id}/sync-github`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload({
                        only: ["latestGithubSync"],
                        onSuccess: (page) => {
                            setLatestSync(page.props.latestGithubSync as GithubSync | null);
                            setSyncing(false);
                        },
                    });
                },
                onError: (errors) => {
                    setError(errors.error || "Nie udało się zsynchronizować repozytorium GitHub.");
                    setSyncing(false);
                },
            },
        );
    }
    return (
        <AppLayout
            breadcrumbs={[
                { title: "Projekty", href: "/projects" },
                { title: project.name, href: `/projects/${project.id}/edit` },
            ]}
        >
            <Head title={`Edytuj projekt: ${project.name}`} />
            <div className="mt-8">
                <h1 className="mb-4 text-2xl font-bold">Edytuj projekt</h1>
                <form className="space-y-5" onSubmit={handleSave}>
                    <Tabs value={activeTab} onValueChange={handleTabChange}>
                        <TabsList>
                            <TabsTrigger value="details">Szczegóły</TabsTrigger>
                            <TabsTrigger value="integration">Integracja</TabsTrigger>
                        </TabsList>
                        <TabsContent value="details" className="space-y-5 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nazwa</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={project.name ?? ""}
                                    onChange={handleChange}
                                    required
                                    placeholder="Wprowadź nazwę projektu"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Opis</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={project.description ?? ""}
                                    onChange={handleChange}
                                    placeholder="Wprowadź opis projektu"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="default_sprint_length">Domyślna długość sprintu</Label>
                                <Input
                                    id="default_sprint_length"
                                    name="default_sprint_length"
                                    type="number"
                                    value={project.default_sprint_length ?? ""}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={project.status ?? "active"}
                                    onValueChange={(value) => setProject((p) => ({ ...p, status: value }))}
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Wybierz status..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Aktywny</SelectItem>
                                        <SelectItem value="archived">Zarchiwizowany</SelectItem>
                                        <SelectItem value="paused">Wstrzymany</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </TabsContent>
                        <TabsContent value="integration" className="space-y-5 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="github_repo">Repozytorium GitHub</Label>
                                <Input
                                    id="github_repo"
                                    name="github_repo"
                                    value={project.github_repo ?? ""}
                                    placeholder="https://github.com/your-username/your-repo"
                                    onChange={handleChange}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Obsługiwane są tylko publiczne repozytoria
                                </p>
                            </div>
                            {project.github_repo && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label>Status synchronizacji GitHub</Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleSyncGithub}
                                            disabled={syncing}
                                        >
                                            <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
                                            {syncing ? "Synchronizowanie..." : "Synchronizuj teraz"}
                                        </Button>
                                    </div>
                                    {latestSync ? (
                                        <div className="rounded-lg border bg-muted/50 p-4">
                                            <div className="flex items-center gap-2">
                                                <Github className="h-5 w-5 text-muted-foreground" />
                                                <div className="flex-1">
                                                    <div className="font-medium">
                                                        {latestSync.data?.name || "Zsynchronizowane repozytorium"}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        Ostatnia synchronizacja: {formatDate(latestSync.synced_at)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                                            Brak danych synchronizacji. Kliknij "Synchronizuj teraz", aby pobrać
                                            informacje o repozytorium.
                                        </div>
                                    )}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                    {error && <div className="text-sm text-red-500">{error}</div>}
                    <div className="flex gap-2 pt-2">
                        <Button type="submit" disabled={loading}>
                            Zapisz
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={loading}
                            onClick={handleDelete}
                            className="cursor-pointer"
                        >
                            Usuń
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import { Head, router, usePage } from "@inertiajs/react";
import { format } from "date-fns";
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
            onError: () => setError("Error updating project."),
        });
    }
    function handleDelete() {
        if (!confirm("Delete this project?")) return;
        setLoading(true);
        router.delete(`/projects/${project.id}`, {
            onSuccess: () => router.visit("/projects"),
            onError: () => setError("Error deleting project."),
        });
    }

    function handleSyncGithub() {
        if (!project.github_repo) {
            setError("Please enter a GitHub repository URL first.");
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
                    setError(errors.error || "Failed to sync GitHub repository.");
                    setSyncing(false);
                },
            },
        );
    }
    return (
        <AppLayout
            breadcrumbs={[
                { title: "Projects", href: "/projects" },
                { title: project.name, href: `/projects/${project.id}/edit` },
            ]}
        >
            <Head title={`Edit Project: ${project.name}`} />
            <div className="mt-8">
                <h1 className="mb-4 text-2xl font-bold">Edit Project</h1>
                <form className="space-y-5" onSubmit={handleSave}>
                    <Tabs value={activeTab} onValueChange={handleTabChange}>
                        <TabsList>
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="integration">Integration</TabsTrigger>
                        </TabsList>
                        <TabsContent value="details" className="space-y-5 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={project.name ?? ""}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter a name for the project"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={project.description ?? ""}
                                    onChange={handleChange}
                                    placeholder="Enter a description for the project"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="default_sprint_length">Default Sprint Length</Label>
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
                                <Input
                                    id="status"
                                    name="status"
                                    value={project.status ?? ""}
                                    onChange={handleChange}
                                    placeholder="Enter a status for the project"
                                />
                            </div>
                        </TabsContent>
                        <TabsContent value="integration" className="space-y-5 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="github_repo">GitHub Repo</Label>
                                <Input
                                    id="github_repo"
                                    name="github_repo"
                                    value={project.github_repo ?? ""}
                                    placeholder="https://github.com/your-username/your-repo"
                                    onChange={handleChange}
                                />
                                <p className="text-xs text-muted-foreground">Only public repositories are supported</p>
                            </div>
                            {project.github_repo && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label>GitHub Sync Status</Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleSyncGithub}
                                            disabled={syncing}
                                        >
                                            <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
                                            {syncing ? "Syncing..." : "Sync Now"}
                                        </Button>
                                    </div>
                                    {latestSync ? (
                                        <div className="rounded-lg border bg-muted/50 p-4">
                                            <div className="flex items-center gap-2">
                                                <Github className="h-5 w-5 text-muted-foreground" />
                                                <div className="flex-1">
                                                    <div className="font-medium">
                                                        {latestSync.data?.name || "Synced repository"}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        Last synced: {format(new Date(latestSync.synced_at), "PPpp")}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                                            No sync data yet. Click "Sync Now" to fetch repository information.
                                        </div>
                                    )}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                    {error && <div className="text-sm text-red-500">{error}</div>}
                    <div className="flex gap-2 pt-2">
                        <Button type="submit" disabled={loading}>
                            Save
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={loading}
                            onClick={handleDelete}
                            className="cursor-pointer"
                        >
                            Delete
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

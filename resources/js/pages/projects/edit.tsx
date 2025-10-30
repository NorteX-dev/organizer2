import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";

interface Project {
    id: number;
    name: string;
    description?: string;
    github_repo?: string;
    default_sprint_length?: number;
    status?: string;
}

interface PageProps {
    project: Project;
}

export default function ProjectEditPage({ project: initial }: PageProps) {
    const [project, setProject] = useState(initial);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
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
    return (
        <AppLayout
            breadcrumbs={[
                { title: "Projects", href: "/projects" },
                { title: project.name, href: `/projects/${project.id}/edit` },
            ]}
        >
            <Head title={`Edit Project: ${project.name}`} />
            <div className="mx-auto max-w-xl p-4">
                <h1 className="mb-4 text-2xl font-bold">Edit Project</h1>
                <form className="space-y-5" onSubmit={handleSave}>
                    <div>
                        <label className="mb-1 block font-medium">Name</label>
                        <input
                            name="name"
                            value={project.name ?? ""}
                            onChange={handleChange}
                            className="input w-full"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-1 block font-medium">Description</label>
                        <textarea
                            name="description"
                            value={project.description ?? ""}
                            onChange={handleChange}
                            className="input min-h-[3rem] w-full"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block font-medium">GitHub Repo</label>
                        <input
                            name="github_repo"
                            value={project.github_repo ?? ""}
                            onChange={handleChange}
                            className="input w-full"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block font-medium">Default Sprint Length</label>
                        <input
                            name="default_sprint_length"
                            type="number"
                            value={project.default_sprint_length ?? ""}
                            onChange={handleChange}
                            className="input w-full"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block font-medium">Status</label>
                        <input
                            name="status"
                            value={project.status ?? ""}
                            onChange={handleChange}
                            className="input w-full"
                        />
                    </div>
                    {error && <div className="text-sm text-red-500">{error}</div>}
                    <div className="flex gap-2 pt-2">
                        <Button type="submit" variant="default" disabled={loading}>
                            Save
                        </Button>
                        <Button type="button" variant="destructive" disabled={loading} onClick={handleDelete}>
                            Delete
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

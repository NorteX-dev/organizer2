import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AppLayout from "@/layouts/app-layout";
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";

interface Project {
    id: number;
    name: string;
    status: string;
}

interface PageProps {
    projects: Project[];
    team: any;
}

export default function ProjectsIndexPage({ projects, team }: PageProps) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ name: "", status: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function handleSubmit(e: any) {
        e.preventDefault();
        setLoading(true);
        router.post("/projects", form, {
            preserveScroll: true,
            onSuccess: (page) => {
                setOpen(false);
                setLoading(false);
                setForm({ name: "", status: "" });
                // Find new project id and redirect
                if (page.props.projects && page.props.projects.length > 0) {
                    const maxId = Math.max(...page.props.projects.map((p: any) => p.id));
                    router.visit(`/projects/${maxId}/edit`);
                }
            },
            onError: (err) => {
                setLoading(false);
                setError("There was an error creating the project.");
            },
        });
    }
    return (
        <AppLayout breadcrumbs={[{ title: "Projects", href: "/projects" }]}>
            <Head title="Projects" />
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Projects</h1>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button variant="default">New Project</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New Project</DialogTitle>
                        </DialogHeader>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label className="mb-2 block text-sm font-medium">Name</label>
                                <input
                                    className="input w-full"
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium">Status</label>
                                <input
                                    className="input w-full"
                                    value={form.status}
                                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                                />
                            </div>
                            {error && <div className="text-sm text-red-500">{error}</div>}
                            <Button type="submit" disabled={loading}>
                                Create
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            <div>
                <div className="grid gap-2">
                    {projects.length === 0 ? (
                        <div className="text-muted-foreground">No projects found.</div>
                    ) : (
                        <table className="w-full rounded bg-white shadow">
                            <thead>
                                <tr>
                                    <th className="px-3 py-2 text-left">Name</th>
                                    <th className="px-3 py-2 text-left">Status</th>
                                    <th className="px-3 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.map((project: Project) => (
                                    <tr
                                        key={project.id}
                                        className="cursor-pointer border-b last:border-b-0 hover:bg-gray-50"
                                        onClick={() => router.visit(`/projects/${project.id}/edit`)}
                                    >
                                        <td className="px-3 py-2">{project.name}</td>
                                        <td className="px-3 py-2">{project.status}</td>
                                        <td className="px-3 py-2">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/projects/${project.id}/edit`}>Edit</Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

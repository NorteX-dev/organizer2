import { HeaderSection } from "@/components/header-section";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from "@/layouts/app-layout";
import type { Project, Team } from "@/types";
import { Head, Link, router } from "@inertiajs/react";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

export default function ProjectsIndexPage({ projects, team }: { projects: Project[]; team: Team }) {
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
            },
            onError: (err) => {
                setLoading(false);
                setError("There was an error creating the project.");
            },
        });
    }

    function handleDeleteProject(e: any, projectId: number) {
        e.preventDefault();
        if (!confirm("Are you sure you want to delete this project?")) return;
        setLoading(true);
        setError(null);
        router.delete(`/projects/${projectId}`, {
            preserveScroll: true,
            onError: () => {
                setError("There was an error deleting the project.");
                setLoading(false);
            },
            onSuccess: () => {
                setLoading(false);
            },
        });
    }

    return (
        <AppLayout breadcrumbs={[{ title: "Projects", href: "/projects" }]}>
            <Head title="Projects" />
            <HeaderSection
                title="Projects"
                description="Manage your team's projects."
                rightHandItem={
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
                                    <Label className="mb-2 block text-sm font-medium">Name</Label>
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
                                    Create
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                }
            />
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
                                    <th className="w-6 px-3 py-2">Actions</th>
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
                                        <td className="flex justify-center space-x-2 px-3 py-2">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/projects/${project.id}/edit`}>
                                                    <PencilIcon />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={(e) => handleDeleteProject(e, project.id)}
                                            >
                                                <Trash2Icon />
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

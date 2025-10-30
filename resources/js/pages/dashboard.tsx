import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import AppLayout from "@/layouts/app-layout";
import { projects } from "@/routes";
import { type BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Projects",
        href: projects().url,
    },
];

export default function ProjectsPage({ projects = [] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Projects" />
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Projects</h1>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="default">New Project</Button>
                    </DialogTrigger>
                    {/* Modal body will be implemented in next step */}
                </Dialog>
            </div>
            <div>
                {/* Projects list (table or grid stub) */}
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
                                {projects.map((project) => (
                                    <tr key={project.id} className="border-b last:border-b-0">
                                        <td className="px-3 py-2">{project.name}</td>
                                        <td className="px-3 py-2">{project.status}</td>
                                        <td className="px-3 py-2">
                                            {/* Edit/Delete actions - wire up later */}
                                            <Button size="sm" variant="outline">
                                                Edit
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

import { HeaderSection } from "@/components/header-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from "@/layouts/app-layout";
import type { Project, Sprint } from "@/types";
import { router } from "@inertiajs/react";
import { format, parseISO } from "date-fns";
import { Info, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

export default function SprintsPage({ project, sprints = [] }: { project: Project; sprints: Sprint[] }) {
    const [form, setForm] = useState({ name: "", goal: "", start_date: "", end_date: "", planned_points: "" });
    const [modalOpen, setModalOpen] = useState(false);

    function openCreate() {
        setForm({ name: "", goal: "", start_date: "", end_date: "", planned_points: "" });
        setModalOpen(true);
    }
    function handleSubmit(e: any) {
        e.preventDefault();
        router.post(`/projects/${project.id}/sprints`, form, {
            preserveScroll: true,
            onSuccess: () => setModalOpen(false),
        });
    }
    function handleDelete(sprintId: number) {
        if (!confirm("Delete this sprint?")) return;
        router.delete(`/projects/${project.id}/sprints/${sprintId}`);
    }
    const statusGroups: { [k: string]: Sprint[] } = { planned: [], active: [], completed: [] };
    (sprints || []).forEach((s: Sprint) => {
        (statusGroups[s.status] ??= []).push(s);
    });

    return (
        <AppLayout
            breadcrumbs={[
                { title: "Projects", href: "/projects" },
                { title: `Project ${project.id}`, href: `/projects/${project.id}/sprints` },
            ]}
        >
            <HeaderSection
                title="Sprints"
                rightHandItem={
                    <Button onClick={openCreate} className="cursor-pointer">
                        Create Sprint
                    </Button>
                }
            />
            <div className="grid grid-cols-3 gap-6">
                {Object.entries(statusGroups).map(([status, group]) => (
                    <div key={status}>
                        <h3 className="mb-2 font-semibold capitalize">{status}</h3>
                        <div className="space-y-2">
                            {group.map((sprint) => (
                                <Card key={sprint.id} className="gap-2 rounded-lg">
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle className="text-lg font-medium">{sprint.name}</CardTitle>
                                        <div className="flex gap-2">
                                            <Badge variant="outline">
                                                {format(parseISO(sprint.start_date), "MMM dd, yyyy")}
                                                {" - "}
                                                {format(parseISO(sprint.end_date), "MMM dd, yyyy")}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="text-sm text-neutral-600">
                                            {sprint.goal}
                                        </CardDescription>
                                    </CardContent>
                                    <CardFooter className="mt-3 flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="w-full cursor-pointer rounded-lg py-2 text-sm"
                                            onClick={() =>
                                                router.get(`/projects/${project.id}/sprints/${sprint.id}/edit`)
                                            }
                                        >
                                            <Pencil className="mr-2 size-4" />
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            className="w-full cursor-pointer rounded-lg py-2 text-sm"
                                            onClick={() => handleDelete(sprint.id)}
                                        >
                                            <Trash2 className="mr-2 size-4" />
                                            Delete
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="w-full cursor-pointer rounded-lg py-2 text-sm"
                                            onClick={() => router.get(`#/sprints/${sprint.id}`)}
                                        >
                                            <Info className="mr-2 size-4" />
                                            Details
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <form className="w-full max-w-md rounded bg-white p-6" onSubmit={handleSubmit}>
                        <h3 className="mb-4 text-lg font-bold">Create Sprint</h3>
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            className="input mb-2 w-full"
                            placeholder="Name"
                            required
                            value={form.name}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        />
                        <Label htmlFor="goal">Goal</Label>
                        <Input
                            id="goal"
                            className="input mb-2 w-full"
                            placeholder="Goal"
                            value={form.goal}
                            onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
                        />
                        <Label htmlFor="start_date">Start Date</Label>
                        <Input
                            id="start_date"
                            type="date"
                            className="input mb-2 w-full"
                            placeholder="Start Date"
                            required
                            value={form.start_date}
                            onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                        />
                        <Label htmlFor="end_date">End Date</Label>
                        <Input
                            id="end_date"
                            type="date"
                            className="input mb-2 w-full"
                            placeholder="End Date"
                            required
                            value={form.end_date}
                            onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                        />
                        <Label htmlFor="planned_points">Planned Points</Label>
                        <Input
                            id="planned_points"
                            className="input mb-2 w-full"
                            type="number"
                            placeholder="Planned Points"
                            value={form.planned_points}
                            onChange={(e) => setForm((f) => ({ ...f, planned_points: e.target.value }))}
                        />
                        <div className="flex justify-end gap-2">
                            <Button type="button" onClick={() => setModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="btn btn-primary">
                                Create
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </AppLayout>
    );
}

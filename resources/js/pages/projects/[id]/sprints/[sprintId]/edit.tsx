import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from "@/layouts/app-layout";
import type { Project, Sprint } from "@/types";
import { router } from "@inertiajs/react";
import { useState } from "react";

export default function SprintsEditPage({ project, sprint }: { project: Project; sprint: Sprint }) {
    const [form, setForm] = useState({
        name: sprint.name ?? "",
        goal: sprint.goal ?? "",
        start_date: sprint.start_date ?? "",
        end_date: sprint.end_date ?? "",
        planned_points: sprint.planned_points ?? "",
        completed_points: sprint.completed_points ?? "",
        status: sprint.status ?? "planned",
    });
    function handleSubmit(e: any) {
        e.preventDefault();
        router.patch(`/projects/${project.id}/sprints/${sprint.id}`, form);
    }
    return (
        <AppLayout
            breadcrumbs={[
                { title: "Projects", href: "/projects" },
                { title: `Project ${project.id}`, href: `/projects/${project.id}/sprints` },
                { title: sprint.name, href: `` },
            ]}
        >
            <h2 className="mb-4 text-2xl font-bold">Edit Sprint</h2>
            <form className="space-y-3" onSubmit={handleSubmit}>
                <Label htmlFor="name" className="text-right">
                    Name
                </Label>
                <Input
                    id="name"
                    className="col-span-3"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
                <Label htmlFor="goal" className="text-right">
                    Goal
                </Label>
                <Input
                    id="goal"
                    className="col-span-3"
                    value={form.goal}
                    onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
                />
                <Label htmlFor="start_date" className="text-right">
                    Start Date
                </Label>
                <Input
                    id="start_date"
                    type="date"
                    className="col-span-3"
                    value={form.start_date}
                    onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                />
                <Label htmlFor="end_date" className="text-right">
                    End Date
                </Label>
                <Input
                    id="end_date"
                    type="date"
                    className="col-span-3"
                    value={form.end_date}
                    onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                />
                <Label htmlFor="planned_points" className="text-right">
                    Planned Points
                </Label>
                <Input
                    id="planned_points"
                    type="number"
                    className="col-span-3"
                    value={form.planned_points}
                    onChange={(e) => setForm((f) => ({ ...f, planned_points: Number(e.target.value) }))}
                />
                <Label htmlFor="completed_points" className="text-right">
                    Completed Points
                </Label>
                <Input
                    id="completed_points"
                    type="number"
                    className="col-span-3"
                    value={form.completed_points}
                    onChange={(e) => setForm((f) => ({ ...f, completed_points: Number(e.target.value) }))}
                />
                <Label htmlFor="status" className="text-right">
                    Status
                </Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select status..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                </Select>
                <Button className="col-span-3" type="submit">
                    Save Changes
                </Button>
            </form>
        </AppLayout>
    );
}


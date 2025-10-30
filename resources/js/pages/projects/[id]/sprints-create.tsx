import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from "@/layouts/app-layout";
import type { Project } from "@/types";
import { router } from "@inertiajs/react";
import { useState } from "react";

export default function SprintsCreatePage({ project }: { project: Project }) {
    const [form, setForm] = useState({
        name: "",
        goal: "",
        start_date: new Date().toISOString().slice(0, 10),
        end_date: "",
        planned_points: "",
    });
    function handleSubmit(e: any) {
        e.preventDefault();
        router.post(`/projects/${project.id}/sprints`, form);
    }
    return (
        <AppLayout
            breadcrumbs={[
                { title: "Projects", href: "/projects" },
                { title: `Project ${project.id}`, href: `/projects/${project.id}/sprints` },
                { title: "Create Sprint", href: "" },
            ]}
        >
            <h2 className="mb-4 text-2xl font-bold">Create Sprint</h2>
            <form className="max-w-md space-y-3" onSubmit={handleSubmit}>
                <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        placeholder="Name"
                        required
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="goal">Goal</Label>
                    <Input
                        id="goal"
                        placeholder="Goal"
                        value={form.goal}
                        onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                        id="start_date"
                        type="date"
                        className="input w-full"
                        placeholder="Start Date"
                        required
                        value={form.start_date}
                        onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                        id="end_date"
                        type="date"
                        className="input w-full"
                        placeholder="End Date"
                        required
                        value={form.end_date}
                        onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                    />
                </div>
                <Button className="btn btn-primary" type="submit">
                    Create Sprint
                </Button>
            </form>
        </AppLayout>
    );
}

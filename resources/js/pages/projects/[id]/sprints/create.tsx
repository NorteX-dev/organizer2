import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from "@/layouts/app-layout";
import type { Project, Task } from "@/types";
import { router } from "@inertiajs/react";
import { useMemo, useState } from "react";

const PRIORITY_COLORS = {
    low: "bg-green-50 text-green-700 border-green-200",
    medium: "bg-blue-50 text-blue-700 border-blue-200",
    high: "bg-orange-50 text-orange-700 border-orange-200",
    critical: "bg-red-50 text-red-700 border-red-200",
};

const TYPE_COLORS = {
    story: "bg-purple-50 text-purple-700 border-purple-200",
    task: "bg-blue-50 text-blue-700 border-blue-200",
    bug: "bg-red-50 text-red-700 border-red-200",
    epic: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

interface SprintsCreatePageProps {
    project: Project;
    backlogTasks?: Task[];
}

export default function SprintsCreatePage({ project, backlogTasks = [] }: SprintsCreatePageProps) {
    const [form, setForm] = useState({
        name: "",
        goal: "",
        start_date: new Date().toISOString().slice(0, 10),
        end_date: "",
        planned_points: "",
    });
    const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);

    const selectedTasks = useMemo(() => {
        return backlogTasks.filter((task) => selectedTaskIds.includes(task.id));
    }, [backlogTasks, selectedTaskIds]);

    const totalStoryPoints = useMemo(() => {
        return selectedTasks.reduce((sum, task) => sum + (task.story_points || 0), 0);
    }, [selectedTasks]);

    const toggleTask = (taskId: number) => {
        setSelectedTaskIds((prev) => (prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]));
    };

    const toggleAll = () => {
        if (selectedTaskIds.length === backlogTasks.length) {
            setSelectedTaskIds([]);
        } else {
            setSelectedTaskIds(backlogTasks.map((task) => task.id));
        }
    };

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        router.post(`/projects/${project.id}/sprints`, {
            ...form,
            task_ids: selectedTaskIds.length > 0 ? selectedTaskIds : undefined,
        });
    }

    const hasCapacityWarning = form.planned_points && totalStoryPoints > parseInt(form.planned_points);

    return (
        <AppLayout
            breadcrumbs={[
                { title: "Projects", href: "/projects" },
                { title: project.name, href: `/projects/${project.id}/sprints` },
                { title: "Create Sprint", href: "" },
            ]}
        >
            <div className="grid gap-6 lg:grid-cols-2">
                <div>
                    <h2 className="mb-4 text-2xl font-bold">Create Sprint</h2>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="grid gap-2">
                            <Label htmlFor="name">
                                Name <span className="text-red-500">*</span>
                            </Label>
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
                            <Label htmlFor="start_date">
                                Start Date <span className="text-red-500">*</span>
                            </Label>
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
                            <Label htmlFor="end_date">
                                End Date <span className="text-red-500">*</span>
                            </Label>
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
                        <div className="grid gap-2">
                            <Label htmlFor="planned_points">Planned Points</Label>
                            <Input
                                id="planned_points"
                                type="number"
                                min="0"
                                className="input w-full"
                                placeholder="Planned Points"
                                value={form.planned_points}
                                onChange={(e) => setForm((f) => ({ ...f, planned_points: e.target.value }))}
                            />
                        </div>
                        {selectedTaskIds.length > 0 && (
                            <div className="rounded-lg border p-4">
                                <div className="mb-2 text-sm font-medium">Selected Tasks Summary</div>
                                <div className="text-sm text-neutral-600">
                                    <div>Tasks: {selectedTaskIds.length}</div>
                                    <div>
                                        Total Story Points: <strong>{totalStoryPoints}</strong>
                                    </div>
                                    {form.planned_points && (
                                        <div>
                                            Planned Capacity: <strong>{form.planned_points}</strong>
                                        </div>
                                    )}
                                    {hasCapacityWarning && (
                                        <div className="mt-2 text-orange-600">
                                            ⚠️ Selected tasks exceed planned capacity!
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        <Button className="btn btn-primary w-full" type="submit">
                            Create Sprint
                        </Button>
                    </form>
                </div>

                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-xl font-semibold">Product Backlog</h3>
                        {backlogTasks.length > 0 && (
                            <Button type="button" variant="outline" size="sm" onClick={toggleAll}>
                                {selectedTaskIds.length === backlogTasks.length ? "Deselect All" : "Select All"}
                            </Button>
                        )}
                    </div>
                    {backlogTasks.length === 0 ? (
                        <Card>
                            <CardContent className="py-8 text-center text-neutral-500">
                                No tasks available in backlog
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="max-h-[600px] space-y-3 overflow-y-auto">
                            {backlogTasks.map((task) => (
                                <Card key={task.id} className="rounded-lg">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start gap-3">
                                            <Checkbox
                                                checked={selectedTaskIds.includes(task.id)}
                                                onCheckedChange={() => toggleTask(task.id)}
                                                className="mt-1"
                                            />
                                            <div className="flex-1">
                                                <CardTitle className="text-base font-medium">{task.title}</CardTitle>
                                                {task.description && (
                                                    <p className="mt-1 line-clamp-2 text-sm text-neutral-600">
                                                        {task.description}
                                                    </p>
                                                )}
                                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-xs ${TYPE_COLORS[task.type]}`}
                                                    >
                                                        {task.type}
                                                    </Badge>
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-xs ${PRIORITY_COLORS[task.priority]}`}
                                                    >
                                                        {task.priority}
                                                    </Badge>
                                                    {task.story_points && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {task.story_points} pts
                                                        </Badge>
                                                    )}
                                                    {task.assigned_user && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {task.assigned_user.name}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

import { HeaderSection } from "@/components/header-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import type { Project, Task, User } from "@/types";
import { router } from "@inertiajs/react";
import { ArrowDown, ArrowUp, Pencil, Plus, Search, Trash2, X } from "lucide-react";
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

interface BacklogPageProps {
    project: Project;
    tasks: Task[];
    users: User[];
}

export default function BacklogPage({ project, tasks = [], users = [] }: BacklogPageProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<string>("all");
    const [filterPriority, setFilterPriority] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [form, setForm] = useState({
        title: "",
        description: "",
        type: "task" as "story" | "task" | "bug" | "epic",
        priority: "medium" as "low" | "medium" | "high" | "critical",
        story_points: "",
        assigned_to: "unassigned",
    });

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const matchesSearch =
                searchQuery === "" ||
                task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesType = filterType === "all" || task.type === filterType;
            const matchesPriority = filterPriority === "all" || task.priority === filterPriority;
            const matchesStatus = filterStatus === "all" || task.status === filterStatus;

            return matchesSearch && matchesType && matchesPriority && matchesStatus;
        });
    }, [tasks, searchQuery, filterType, filterPriority, filterStatus]);

    function openCreate() {
        setForm({
            title: "",
            description: "",
            type: "task",
            priority: "medium",
            story_points: "",
            assigned_to: "unassigned",
        });
        setEditingTask(null);
        setModalOpen(true);
    }

    function openEdit(task: Task) {
        setForm({
            title: task.title,
            description: task.description || "",
            type: task.type,
            priority: task.priority,
            story_points: task.story_points?.toString() || "",
            assigned_to: task.assigned_to?.toString() || "unassigned",
        });
        setEditingTask(task);
        setModalOpen(true);
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const data = {
            ...form,
            story_points: form.story_points ? parseInt(form.story_points) : null,
            assigned_to: form.assigned_to && form.assigned_to !== "unassigned" ? parseInt(form.assigned_to) : null,
        };

        if (editingTask) {
            router.put(`/projects/${project.id}/backlog/${editingTask.id}`, data, {
                preserveScroll: true,
                onSuccess: () => setModalOpen(false),
            });
        } else {
            router.post(`/projects/${project.id}/backlog`, data, {
                preserveScroll: true,
                onSuccess: () => setModalOpen(false),
            });
        }
    }

    function handleDelete(taskId: number) {
        if (!confirm("Delete this task?")) return;
        router.delete(`/projects/${project.id}/backlog/${taskId}`, {
            preserveScroll: true,
        });
    }

    function handleMoveUp(taskId: number) {
        router.post(`/projects/${project.id}/backlog/${taskId}/move-up`, {}, { preserveScroll: true });
    }

    function handleMoveDown(taskId: number) {
        router.post(
            `/projects/${project.id}/backlog/${taskId}/move-down`,
            {},
            {
                preserveScroll: true,
            },
        );
    }

    function getTaskPosition(task: Task) {
        const sortedTasks = [...tasks].sort((a, b) => a.position - b.position);
        return sortedTasks.findIndex((t) => t.id === task.id);
    }

    return (
        <AppLayout
            breadcrumbs={[
                { title: "Projects", href: "/projects" },
                { title: project.name, href: `/projects/${project.id}/edit` },
                { title: "Backlog", href: `/projects/${project.id}/backlog` },
            ]}
        >
            <HeaderSection
                title="Product Backlog"
                rightHandItem={
                    <Button onClick={openCreate} className="cursor-pointer">
                        <Plus className="mr-2 size-4" />
                        Create Task
                    </Button>
                }
            />

            <div className="mb-6 space-y-4">
                <div className="flex flex-wrap gap-4">
                    <div className="min-w-[200px] flex-1">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
                            <Input
                                placeholder="Search tasks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="story">Story</SelectItem>
                            <SelectItem value="task">Task</SelectItem>
                            <SelectItem value="bug">Bug</SelectItem>
                            <SelectItem value="epic">Epic</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={filterPriority} onValueChange={setFilterPriority}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Priorities</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="Planned">Planned</SelectItem>
                            <SelectItem value="Backlog">Backlog</SelectItem>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setSearchQuery("");
                            setFilterType("all");
                            setFilterPriority("all");
                            setFilterStatus("all");
                        }}
                    >
                        <X className="mr-2 size-4" />
                        Clear
                    </Button>
                </div>
            </div>

            <div className="space-y-3">
                {filteredTasks.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-neutral-500">No tasks found in backlog.</p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredTasks
                        .sort((a, b) => a.position - b.position)
                        .map((task) => {
                            const position = getTaskPosition(task);
                            const isFirst = position === 0;
                            const isLast = position === tasks.length - 1;

                            return (
                                <Card key={task.id} className="rounded-lg">
                                    <CardHeader className="flex flex-row items-start justify-between pb-3">
                                        <div className="flex-1">
                                            <div className="mb-2 flex items-start gap-3">
                                                <div className="mt-1 flex gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-7 w-7 p-0"
                                                        onClick={() => handleMoveUp(task.id)}
                                                        disabled={isFirst}
                                                        title="Move up"
                                                    >
                                                        <ArrowUp className="size-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-7 w-7 p-0"
                                                        onClick={() => handleMoveDown(task.id)}
                                                        disabled={isLast}
                                                        title="Move down"
                                                    >
                                                        <ArrowDown className="size-4" />
                                                    </Button>
                                                </div>
                                                <div className="flex-1">
                                                    <CardTitle className="text-lg font-medium">{task.title}</CardTitle>
                                                    {task.description && (
                                                        <CardDescription className="mt-1">
                                                            {task.description}
                                                        </CardDescription>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="ml-12 flex flex-wrap items-center gap-2">
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
                                                <Badge variant="outline" className="text-xs">
                                                    {task.status}
                                                </Badge>
                                                {task.assigned_user && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {task.assigned_user.name}
                                                    </Badge>
                                                )}
                                                {task.labels && task.labels.length > 0 && (
                                                    <div className="flex gap-1">
                                                        {task.labels.map((label) => (
                                                            <Badge
                                                                key={label.id}
                                                                variant="outline"
                                                                className="text-xs"
                                                                style={{ borderColor: label.color }}
                                                            >
                                                                {label.name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="secondary" onClick={() => openEdit(task)}>
                                                <Pencil className="mr-2 size-4" />
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleDelete(task.id)}
                                            >
                                                <Trash2 className="mr-2 size-4" />
                                                Delete
                                            </Button>
                                        </div>
                                    </CardHeader>
                                </Card>
                            );
                        })
                )}
            </div>

            {modalOpen && (
                <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingTask ? "Edit Task" : "Create Task"}</DialogTitle>
                            <DialogDescription>
                                {editingTask
                                    ? "Update the task details below."
                                    : "Add a new task to the product backlog."}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4 py-4">
                                <div>
                                    <Label htmlFor="title">
                                        Title <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="title"
                                        className="mt-1"
                                        placeholder="Task title"
                                        required
                                        value={form.title}
                                        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        className="mt-1"
                                        placeholder="Task description"
                                        rows={4}
                                        value={form.description}
                                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="type">Type</Label>
                                        <Select
                                            value={form.type}
                                            onValueChange={(value: "story" | "task" | "bug" | "epic") =>
                                                setForm((f) => ({ ...f, type: value }))
                                            }
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="story">Story</SelectItem>
                                                <SelectItem value="task">Task</SelectItem>
                                                <SelectItem value="bug">Bug</SelectItem>
                                                <SelectItem value="epic">Epic</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="priority">Priority</Label>
                                        <Select
                                            value={form.priority}
                                            onValueChange={(value: "low" | "medium" | "high" | "critical") =>
                                                setForm((f) => ({ ...f, priority: value }))
                                            }
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                                <SelectItem value="critical">Critical</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="story_points">Story Points</Label>
                                        <Input
                                            id="story_points"
                                            type="number"
                                            min="0"
                                            className="mt-1"
                                            placeholder="0"
                                            value={form.story_points}
                                            onChange={(e) => setForm((f) => ({ ...f, story_points: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="assigned_to">Assign To</Label>
                                        <Select
                                            value={form.assigned_to}
                                            onValueChange={(value) => setForm((f) => ({ ...f, assigned_to: value }))}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Unassigned" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                                {users.map((user) => (
                                                    <SelectItem key={user.id} value={user.id.toString()}>
                                                        {user.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">{editingTask ? "Update" : "Create"}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </AppLayout>
    );
}

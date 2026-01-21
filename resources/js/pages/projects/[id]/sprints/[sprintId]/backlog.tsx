import { HeaderSection } from "@/components/header-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { Project, Sprint, Task, User } from "@/types";
import { router } from "@inertiajs/react";
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Pencil, Plus, Search, Split, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

const PRIORITY_COLORS = {
    low: "bg-green-50 text-green-700 border-green-200",
    medium: "bg-blue-50 text-blue-700 border-blue-200",
    high: "bg-orange-50 text-orange-700 border-orange-200",
    critical: "bg-red-50 text-red-700 border-red-200",
};

const PRIORITY_LABELS: Record<string, string> = {
    low: "Niski",
    medium: "Średni",
    high: "Wysoki",
    critical: "Krytyczny",
};

const TYPE_COLORS = {
    story: "bg-purple-50 text-purple-700 border-purple-200",
    task: "bg-blue-50 text-blue-700 border-blue-200",
    bug: "bg-red-50 text-red-700 border-red-200",
    epic: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

const TYPE_LABELS: Record<string, string> = {
    story: "Story",
    task: "Zadanie",
    bug: "Błąd / Bug",
    epic: "Epic",
};

interface SprintBacklogPageProps {
    project: Project;
    sprint: Sprint;
    tasks: TasksPaginated;
    productBacklogTasks?: Task[];
    users: User[];
    search?: string;
    type?: string;
    priority?: string;
    status?: string;
}

interface TasksPaginated {
    data: Task[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export default function SprintBacklogPage({
    project,
    sprint,
    tasks,
    productBacklogTasks = [],
    users = [],
    search: initialSearch = "",
    type: initialType = "all",
    priority: initialPriority = "all",
    status: initialStatus = "all",
}: SprintBacklogPageProps) {
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [filterType, setFilterType] = useState<string>(initialType);
    const [filterPriority, setFilterPriority] = useState<string>(initialPriority);
    const [filterStatus, setFilterStatus] = useState<string>(initialStatus);
    const [modalOpen, setModalOpen] = useState(false);
    const [subtasksModalOpen, setSubtasksModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [parentTaskForSubtasks, setParentTaskForSubtasks] = useState<Task | null>(null);
    const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set());
    const [addFromProductBacklogOpen, setAddFromProductBacklogOpen] = useState(false);
    const [selectedProductBacklogTaskIds, setSelectedProductBacklogTaskIds] = useState<number[]>([]);
    const [form, setForm] = useState({
        title: "",
        description: "",
        type: "task" as "story" | "task" | "bug" | "epic",
        priority: "medium" as "low" | "medium" | "high" | "critical",
        story_points: "",
        assigned_to: "unassigned",
    });
    const [subtasksForm, setSubtasksForm] = useState<
        Array<{
            title: string;
            description: string;
            type: "story" | "task" | "bug";
            priority: "low" | "medium" | "high" | "critical";
            story_points: string;
            assigned_to: string;
        }>
    >([{ title: "", description: "", type: "task", priority: "medium", story_points: "", assigned_to: "unassigned" }]);

    const taskItems = tasks.data ?? [];

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (
                searchQuery !== initialSearch ||
                filterType !== initialType ||
                filterPriority !== initialPriority ||
                filterStatus !== initialStatus
            ) {
                router.get(
                    `/projects/${project.id}/sprints/${sprint.id}/backlog`,
                    {
                        search: searchQuery || "",
                        type: filterType,
                        priority: filterPriority,
                        status: filterStatus,
                        per_page: tasks.per_page,
                        page: 1,
                    },
                    { preserveState: true, preserveScroll: true, replace: true },
                );
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [
        searchQuery,
        filterType,
        filterPriority,
        filterStatus,
        initialSearch,
        initialType,
        initialPriority,
        initialStatus,
        project.id,
        sprint.id,
        tasks.per_page,
    ]);

    function toggleExpanded(taskId: number) {
        setExpandedTasks((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) {
                newSet.delete(taskId);
            } else {
                newSet.add(taskId);
            }
            return newSet;
        });
    }

    function getTotalStoryPoints(task: Task): number {
        const taskPoints = task.story_points || 0;
        const subtasksPoints = (task.sub_tasks || []).reduce((sum, subtask) => sum + (subtask.story_points || 0), 0);
        return taskPoints + subtasksPoints;
    }

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
            router.put(`/projects/${project.id}/sprints/${sprint.id}/backlog/${editingTask.id}`, data, {
                preserveScroll: true,
                onSuccess: () => setModalOpen(false),
            });
        } else {
            router.post(`/projects/${project.id}/sprints/${sprint.id}/backlog`, data, {
                preserveScroll: true,
                onSuccess: () => setModalOpen(false),
            });
        }
    }

    function handleDelete(taskId: number) {
        if (!confirm("Usunąć to zadanie?")) return;
        router.delete(`/projects/${project.id}/sprints/${sprint.id}/backlog/${taskId}`, {
            preserveScroll: true,
        });
    }

    function handleMoveUp(taskId: number) {
        router.post(
            `/projects/${project.id}/sprints/${sprint.id}/backlog/${taskId}/move-up`,
            {},
            { preserveScroll: true },
        );
    }

    function handleMoveDown(taskId: number) {
        router.post(
            `/projects/${project.id}/sprints/${sprint.id}/backlog/${taskId}/move-down`,
            {},
            {
                preserveScroll: true,
            },
        );
    }

    function openCreateSubtasks(task: Task) {
        setParentTaskForSubtasks(task);
        setSubtasksForm([
            {
                title: "",
                description: "",
                type: "task",
                priority: "medium",
                story_points: "",
                assigned_to: "unassigned",
            },
        ]);
        setSubtasksModalOpen(true);
    }

    function handleCreateSubtasks(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!parentTaskForSubtasks) return;

        const subtasks = subtasksForm
            .filter((st) => st.title.trim() !== "")
            .map((st) => ({
                title: st.title,
                description: st.description,
                type: st.type,
                priority: st.priority,
                story_points: st.story_points ? parseInt(st.story_points) : null,
                assigned_to: st.assigned_to && st.assigned_to !== "unassigned" ? parseInt(st.assigned_to) : null,
            }));

        router.post(
            `/projects/${project.id}/sprints/${sprint.id}/backlog/${parentTaskForSubtasks.id}/subtasks`,
            { subtasks },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSubtasksModalOpen(false);
                    setParentTaskForSubtasks(null);
                },
            },
        );
    }

    function addSubtaskField() {
        setSubtasksForm([
            ...subtasksForm,
            {
                title: "",
                description: "",
                type: "task",
                priority: "medium",
                story_points: "",
                assigned_to: "unassigned",
            },
        ]);
    }

    function removeSubtaskField(index: number) {
        setSubtasksForm(subtasksForm.filter((_, i) => i !== index));
    }

    function updateSubtaskField(index: number, field: string, value: string) {
        setSubtasksForm(subtasksForm.map((st, i) => (i === index ? { ...st, [field]: value } : st)));
    }

    function handleAddFromProductBacklog() {
        if (selectedProductBacklogTaskIds.length === 0) return;

        router.post(
            `/projects/${project.id}/sprints/${sprint.id}/backlog/add-from-product-backlog`,
            { task_ids: selectedProductBacklogTaskIds },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setAddFromProductBacklogOpen(false);
                    setSelectedProductBacklogTaskIds([]);
                },
            },
        );
    }

    function toggleProductBacklogTask(taskId: number) {
        setSelectedProductBacklogTaskIds((prev) =>
            prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId],
        );
    }

    function renderTask(task: Task, level: number = 0, index?: number) {
        const hasSubtasks = (task.sub_tasks || []).length > 0;
        const isExpanded = expandedTasks.has(task.id);
        const isFirst = level === 0 && index === 0 && tasks.current_page === 1;
        const isLast =
            level === 0 &&
            index === taskItems.length - 1 &&
            tasks.current_page === tasks.last_page &&
            taskItems.length > 0;
        const totalPoints = getTotalStoryPoints(task);

        return (
            <div key={task.id}>
                <Card className={`rounded-lg ${level > 0 ? "ml-8 border-l-2 border-l-blue-200" : ""}`}>
                    <CardHeader className="flex flex-row items-start justify-between pb-3">
                        <div className="flex-1">
                            <div className="mb-2 flex items-start gap-3">
                                <div className="mt-1 flex gap-1">
                                    {hasSubtasks && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 w-7 p-0"
                                            onClick={() => toggleExpanded(task.id)}
                                            title={isExpanded ? "Zwiń" : "Rozwiń"}
                                        >
                                            {isExpanded ? (
                                                <ChevronDown className="size-4" />
                                            ) : (
                                                <ChevronRight className="size-4" />
                                            )}
                                        </Button>
                                    )}
                                    {!hasSubtasks && level === 0 && <div className="h-7 w-7" />}
                                    {level === 0 && (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 w-7 p-0"
                                                onClick={() => handleMoveUp(task.id)}
                                                disabled={isFirst}
                                                title="Przenieś w górę"
                                            >
                                                <ArrowUp className="size-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 w-7 p-0"
                                                onClick={() => handleMoveDown(task.id)}
                                                disabled={isLast}
                                                title="Przenieś w dół"
                                            >
                                                <ArrowDown className="size-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <CardTitle className="text-lg font-medium">{task.title}</CardTitle>
                                    {task.description && (
                                        <CardDescription className="mt-1">{task.description}</CardDescription>
                                    )}
                                </div>
                            </div>
                            <div className={`ml-12 flex flex-wrap items-center gap-2`}>
                                <Badge variant="outline" className={`text-xs ${TYPE_COLORS[task.type]}`}>
                                    {TYPE_LABELS[task.type] || task.type}
                                </Badge>
                                <Badge variant="outline" className={`text-xs ${PRIORITY_COLORS[task.priority]}`}>
                                    {PRIORITY_LABELS[task.priority] || task.priority}
                                </Badge>
                                {totalPoints > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                        {totalPoints} pkt
                                        {hasSubtasks &&
                                            ` (${task.story_points || 0} + ${totalPoints - (task.story_points || 0)})`}
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
                            {(task.type === "epic" || task.type === "story") && level === 0 && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openCreateSubtasks(task)}
                                    title="Podziel na podzadania"
                                >
                                    <Split className="mr-2 size-4" />
                                    Podziel
                                </Button>
                            )}
                            <Button size="sm" variant="secondary" onClick={() => openEdit(task)}>
                                <Pencil className="mr-2 size-4" />
                                Edytuj
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(task.id)}>
                                <Trash2 className="mr-2 size-4" />
                                Usuń
                            </Button>
                        </div>
                    </CardHeader>
                </Card>
                {hasSubtasks && isExpanded && (
                    <div className="mt-2 space-y-2">
                        {(task.sub_tasks || []).map((subtask) => renderTask(subtask, level + 1))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <AppLayout
            breadcrumbs={[
                { title: "Projekty", href: "/projects" },
                { title: project.name, href: `/projects/${project.id}/edit` },
                { title: "Sprinty", href: `/projects/${project.id}/sprints` },
                { title: sprint.name, href: `/projects/${project.id}/sprints/${sprint.id}` },
                { title: "Backlog sprintowy", href: `/projects/${project.id}/sprints/${sprint.id}/backlog` },
            ]}
        >
            <HeaderSection
                title={`Backlog sprintowy: ${sprint.name}`}
                rightHandItem={
                    <div className="flex gap-2">
                        <Button onClick={() => setAddFromProductBacklogOpen(true)} variant="outline">
                            Dodaj z backlogu produktu
                        </Button>
                        <Button onClick={openCreate} className="cursor-pointer">
                            <Plus className="mr-2 size-4" />
                            Utwórz zadanie
                        </Button>
                    </div>
                }
            />

            <div className="mb-6 space-y-4">
                <div className="flex flex-wrap gap-4">
                    <div className="min-w-[200px] flex-1">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
                            <Input
                                placeholder="Szukaj zadań..."
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
                            <SelectItem value="all">Wszystkie typy</SelectItem>
                            <SelectItem value="story">Historia</SelectItem>
                            <SelectItem value="task">Zadanie</SelectItem>
                            <SelectItem value="bug">Błąd</SelectItem>
                            <SelectItem value="epic">Epic</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={filterPriority} onValueChange={setFilterPriority}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Wszystkie priorytety</SelectItem>
                            <SelectItem value="low">Niski</SelectItem>
                            <SelectItem value="medium">Średni</SelectItem>
                            <SelectItem value="high">Wysoki</SelectItem>
                            <SelectItem value="critical">Krytyczny</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Wszystkie statusy</SelectItem>
                            <SelectItem value="Planned">Zaplanowane</SelectItem>
                            <SelectItem value="Backlog">Backlog</SelectItem>
                            <SelectItem value="Active">Aktywne</SelectItem>
                            <SelectItem value="Completed">Zakończone</SelectItem>
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
                        Wyczyść
                    </Button>
                </div>
            </div>

            <div className="space-y-3">
                {taskItems.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-neutral-500">Nie znaleziono zadań w backlogu sprintowym.</p>
                        </CardContent>
                    </Card>
                ) : (
                    taskItems.map((task, index) => renderTask(task, 0, index))
                )}
            </div>

            {tasks.last_page > 1 && (
                <div className="flex items-center justify-between pt-6">
                    <div className="text-sm text-muted-foreground">
                        Strona {tasks.current_page} z {tasks.last_page} ({tasks.total} zadań)
                    </div>
                    <div className="flex gap-2">
                        {tasks.current_page > 1 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    router.get(
                                        `/projects/${project.id}/sprints/${sprint.id}/backlog`,
                                        {
                                            search: searchQuery || "",
                                            type: filterType,
                                            priority: filterPriority,
                                            status: filterStatus,
                                            per_page: tasks.per_page,
                                            page: tasks.current_page - 1,
                                        },
                                        { preserveState: true, preserveScroll: true },
                                    )
                                }
                            >
                                Poprzednia
                            </Button>
                        )}
                        {tasks.current_page < tasks.last_page && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    router.get(
                                        `/projects/${project.id}/sprints/${sprint.id}/backlog`,
                                        {
                                            search: searchQuery || "",
                                            type: filterType,
                                            priority: filterPriority,
                                            status: filterStatus,
                                            per_page: tasks.per_page,
                                            page: tasks.current_page + 1,
                                        },
                                        { preserveState: true, preserveScroll: true },
                                    )
                                }
                            >
                                Następna
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {modalOpen && (
                <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingTask ? "Edytuj zadanie" : "Utwórz zadanie"}</DialogTitle>
                            <DialogDescription>
                                {editingTask
                                    ? "Zaktualizuj szczegóły zadania poniżej."
                                    : "Dodaj nowe zadanie do backlogu sprintowego."}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4 py-4">
                                <div>
                                    <Label htmlFor="title">
                                        Tytuł <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="title"
                                        className="mt-1"
                                        placeholder="Tytuł zadania"
                                        required
                                        value={form.title}
                                        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="description">Opis</Label>
                                    <Textarea
                                        id="description"
                                        className="mt-1"
                                        placeholder="Opis zadania"
                                        rows={4}
                                        value={form.description}
                                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="type">Typ</Label>
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
                                                <SelectItem value="story">Historia</SelectItem>
                                                <SelectItem value="task">Zadanie</SelectItem>
                                                <SelectItem value="bug">Błąd</SelectItem>
                                                <SelectItem value="epic">Epic</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="priority">Priorytet</Label>
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
                                                <SelectItem value="low">Niski</SelectItem>
                                                <SelectItem value="medium">Średni</SelectItem>
                                                <SelectItem value="high">Wysoki</SelectItem>
                                                <SelectItem value="critical">Krytyczny</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="story_points">Punkty historii</Label>
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
                                        <Label htmlFor="assigned_to">Przypisz do</Label>
                                        <Select
                                            value={form.assigned_to}
                                            onValueChange={(value) => setForm((f) => ({ ...f, assigned_to: value }))}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Nieprzypisane" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="unassigned">Nieprzypisane</SelectItem>
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
                                    Anuluj
                                </Button>
                                <Button type="submit">{editingTask ? "Zaktualizuj" : "Utwórz"}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}

            {subtasksModalOpen && parentTaskForSubtasks && (
                <Dialog open={subtasksModalOpen} onOpenChange={setSubtasksModalOpen}>
                    <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Podziel: {parentTaskForSubtasks.title}</DialogTitle>
                            <DialogDescription>
                                Utwórz podzadania dla tego {parentTaskForSubtasks.type}. Możesz dodać wiele podzadań
                                jednocześnie.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateSubtasks}>
                            <div className="space-y-6 py-4">
                                {subtasksForm.map((subtask, index) => (
                                    <Card key={index} className="p-4">
                                        <div className="mb-4 flex items-center justify-between">
                                            <h3 className="font-semibold">Podzadanie {index + 1}</h3>
                                            {subtasksForm.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeSubtaskField(index)}
                                                >
                                                    <X className="size-4" />
                                                </Button>
                                            )}
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor={`subtask-title-${index}`}>
                                                    Tytuł <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id={`subtask-title-${index}`}
                                                    className="mt-1"
                                                    placeholder="Tytuł podzadania"
                                                    required
                                                    value={subtask.title}
                                                    onChange={(e) => updateSubtaskField(index, "title", e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor={`subtask-description-${index}`}>Opis</Label>
                                                <Textarea
                                                    id={`subtask-description-${index}`}
                                                    className="mt-1"
                                                    placeholder="Opis podzadania"
                                                    rows={2}
                                                    value={subtask.description}
                                                    onChange={(e) =>
                                                        updateSubtaskField(index, "description", e.target.value)
                                                    }
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor={`subtask-type-${index}`}>Typ</Label>
                                                    <Select
                                                        value={subtask.type}
                                                        onValueChange={(value: "story" | "task" | "bug") =>
                                                            updateSubtaskField(index, "type", value)
                                                        }
                                                    >
                                                        <SelectTrigger className="mt-1">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="task">Zadanie</SelectItem>
                                                            <SelectItem value="story">Historia</SelectItem>
                                                            <SelectItem value="bug">Błąd</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label htmlFor={`subtask-priority-${index}`}>Priorytet</Label>
                                                    <Select
                                                        value={subtask.priority}
                                                        onValueChange={(
                                                            value: "low" | "medium" | "high" | "critical",
                                                        ) => updateSubtaskField(index, "priority", value)}
                                                    >
                                                        <SelectTrigger className="mt-1">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="low">Niski</SelectItem>
                                                            <SelectItem value="medium">Średni</SelectItem>
                                                            <SelectItem value="high">Wysoki</SelectItem>
                                                            <SelectItem value="critical">Krytyczny</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor={`subtask-story-points-${index}`}>
                                                        Punkty historii
                                                    </Label>
                                                    <Input
                                                        id={`subtask-story-points-${index}`}
                                                        type="number"
                                                        min="0"
                                                        className="mt-1"
                                                        placeholder="0"
                                                        value={subtask.story_points}
                                                        onChange={(e) =>
                                                            updateSubtaskField(index, "story_points", e.target.value)
                                                        }
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`subtask-assigned-${index}`}>Przypisz do</Label>
                                                    <Select
                                                        value={subtask.assigned_to}
                                                        onValueChange={(value) =>
                                                            updateSubtaskField(index, "assigned_to", value)
                                                        }
                                                    >
                                                        <SelectTrigger className="mt-1">
                                                            <SelectValue placeholder="Nieprzypisane" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="unassigned">Nieprzypisane</SelectItem>
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
                                    </Card>
                                ))}
                                <Button type="button" variant="outline" onClick={addSubtaskField} className="w-full">
                                    <Plus className="mr-2 size-4" />
                                    Dodaj kolejne podzadanie
                                </Button>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setSubtasksModalOpen(false)}>
                                    Anuluj
                                </Button>
                                <Button type="submit">Utwórz podzadania</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}

            <Dialog open={addFromProductBacklogOpen} onOpenChange={setAddFromProductBacklogOpen}>
                <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Dodaj zadania z backlogu produktu</DialogTitle>
                        <DialogDescription>Wybierz zadania do dodania do backlogu sprintowego</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {productBacklogTasks.length === 0 ? (
                            <div className="py-8 text-center text-neutral-500">
                                Brak dostępnych zadań w backlogu produktu
                            </div>
                        ) : (
                            <div className="max-h-[400px] space-y-2 overflow-y-auto">
                                {productBacklogTasks.map((task) => (
                                    <Card key={task.id} className="rounded-lg">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start gap-3">
                                                <Checkbox
                                                    checked={selectedProductBacklogTaskIds.includes(task.id)}
                                                    onCheckedChange={() => toggleProductBacklogTask(task.id)}
                                                    className="mt-1"
                                                />
                                                <div className="flex-1">
                                                    <CardTitle className="text-base font-medium">
                                                        {task.title}
                                                    </CardTitle>
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
                                                            {TYPE_LABELS[task.type] || task.type}
                                                        </Badge>
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-xs ${PRIORITY_COLORS[task.priority]}`}
                                                        >
                                                            {PRIORITY_LABELS[task.priority] || task.priority}
                                                        </Badge>
                                                        {task.story_points && (
                                                            <Badge variant="outline" className="text-xs">
                                                                {task.story_points} pkt
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
                        {selectedProductBacklogTaskIds.length > 0 && (
                            <div className="rounded-lg border p-3 text-sm">
                                <div className="font-medium">Wybrano: {selectedProductBacklogTaskIds.length} zadań</div>
                                <div className="text-neutral-600">
                                    Łączne punkty historii:{" "}
                                    <strong>
                                        {productBacklogTasks
                                            .filter((t) => selectedProductBacklogTaskIds.includes(t.id))
                                            .reduce((sum, t) => sum + (t.story_points || 0), 0)}
                                    </strong>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddFromProductBacklogOpen(false)}>
                            Anuluj
                        </Button>
                        <Button
                            onClick={handleAddFromProductBacklog}
                            disabled={selectedProductBacklogTaskIds.length === 0}
                        >
                            Dodaj wybrane zadania
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

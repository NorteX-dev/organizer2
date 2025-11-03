import { HeaderSection } from "@/components/header-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
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
import AppLayout from "@/layouts/app-layout";
import type { GithubIssue, Project, Sprint, Task } from "@/types";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    closestCorners,
    useDroppable,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { router } from "@inertiajs/react";
import { format, parseISO } from "date-fns";
import { ExternalLink, Github, GripVertical, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

const KANBAN_COLUMNS = ["Planned", "Active", "Completed"] as const;

type StatusType = (typeof KANBAN_COLUMNS)[number];

interface KanbanTask extends Omit<Task, "id"> {
    id: number | string;
    isNew?: boolean;
}

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

function normalizeGithubUrl(repo: string | null | undefined): string | null {
    if (!repo) return null;

    let url = repo.trim();

    url = url.replace(/\.git$/, "");

    if (url.startsWith("http://") || url.startsWith("https://")) {
        if (url.includes("github.com")) {
            return url.replace(/\/$/, "");
        }
    }

    const match = url.match(/(?:github\.com[/:])?([^/]+)\/([^/\s]+)/);
    if (match) {
        return `https://github.com/${match[1]}/${match[2]}`;
    }

    if (/^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+$/.test(url)) {
        return `https://github.com/${url}`;
    }

    return url;
}

function TaskCard({
    task,
    project,
    sprint,
    onUpdate,
    onMoveToBacklog,
}: {
    task: KanbanTask;
    project: Project;
    sprint: Sprint;
    onUpdate: () => void;
    onMoveToBacklog?: () => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: task.id,
        data: { task },
    });

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [issues, setIssues] = useState<GithubIssue[]>([]);
    const [prs, setPrs] = useState<GithubIssue[]>([]);
    const [loadingRefs, setLoadingRefs] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState<string | undefined>(task.github_issue_number || undefined);
    const [selectedPR, setSelectedPR] = useState<string | undefined>(task.github_pr_number || undefined);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setSelectedIssue(task.github_issue_number || undefined);
        setSelectedPR(task.github_pr_number || undefined);
    }, [task.github_issue_number, task.github_pr_number]);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleOpenDialog = async () => {
        setEditDialogOpen(true);
        if (project.github_repo && (issues.length === 0 || prs.length === 0)) {
            setLoadingRefs(true);
            try {
                const response = await fetch(`/projects/${project.id}/github-issues-prs`);
                if (response.ok) {
                    const data = await response.json();
                    setIssues(data.issues || []);
                    setPrs(data.prs || []);
                }
            } catch (error) {
                console.error("Failed to fetch GitHub issues/PRs:", error);
            } finally {
                setLoadingRefs(false);
            }
        }
    };

    const handleSave = () => {
        if (typeof task.id !== "number") return;

        setSaving(true);
        router.put(
            `/projects/${project.id}/sprints/${sprint.id}/tasks/${task.id}`,
            {
                github_issue_number: selectedIssue || null,
                github_pr_number: selectedPR || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditDialogOpen(false);
                    setSaving(false);
                    onUpdate();
                },
                onError: () => {
                    setSaving(false);
                },
            },
        );
    };

    const allOptions = [
        ...issues.map((issue) => ({
            value: issue.number.toString(),
            label: `#${issue.number}: ${issue.title}`,
            type: "issue",
        })),
        ...prs.map((pr) => ({
            value: pr.number.toString(),
            label: `#${pr.number}: ${pr.title}`,
            type: "pr",
        })),
    ];

    const selectedIssueObj = issues.find((i) => i.number.toString() === selectedIssue);
    const selectedPRObj = prs.find((p) => p.number.toString() === selectedPR);

    return (
        <>
            <div ref={setNodeRef} style={style}>
                <Card className="cursor-grab transition-shadow hover:shadow-md active:cursor-grabbing">
                    <CardHeader className="pb-3">
                        <div className="mb-2 flex items-start justify-between gap-2">
                            <div className="flex flex-1 items-start gap-2">
                                <button
                                    className="mt-1 cursor-grab text-neutral-400 hover:text-neutral-600"
                                    {...attributes}
                                    {...listeners}
                                >
                                    <GripVertical className="h-4 w-4" />
                                </button>
                                <CardTitle className="flex-1 text-base leading-tight font-medium">
                                    {task.title}
                                </CardTitle>
                            </div>
                            {task.story_points && (
                                <Badge variant="outline" className="shrink-0 text-xs">
                                    {task.story_points} pts
                                </Badge>
                            )}
                        </div>
                        <div className="ml-6 flex flex-wrap gap-1.5">
                            <Badge variant="outline" className={`text-xs ${TYPE_COLORS[task.type]}`}>
                                {task.type}
                            </Badge>
                            <Badge variant="outline" className={`text-xs ${PRIORITY_COLORS[task.priority]}`}>
                                {task.priority}
                            </Badge>
                        </div>
                    </CardHeader>
                    {(task.description ||
                        task.assigned_user ||
                        (task.labels && task.labels.length > 0) ||
                        task.github_issue_number ||
                        task.github_pr_number) && (
                        <CardContent className="pt-0">
                            {task.description && (
                                <CardDescription className="mb-2 line-clamp-2 text-xs">
                                    {task.description}
                                </CardDescription>
                            )}
                            {task.assigned_user && (
                                <div className="mb-2 flex items-center gap-2 text-xs text-neutral-600">
                                    <span className="font-medium">Assigned to:</span>
                                    <span>{task.assigned_user.name}</span>
                                </div>
                            )}
                            {(task.github_issue_number || task.github_pr_number) && (
                                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                                    {task.github_issue_number &&
                                        (() => {
                                            const baseUrl = normalizeGithubUrl(project.github_repo);
                                            return baseUrl ? (
                                                <a
                                                    href={`${baseUrl}/issues/${task.github_issue_number}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Github className="h-3 w-3" />
                                                    Issue #{task.github_issue_number}
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-blue-600">
                                                    <Github className="h-3 w-3" />
                                                    Issue #{task.github_issue_number}
                                                </span>
                                            );
                                        })()}
                                    {task.github_pr_number &&
                                        (() => {
                                            const baseUrl = normalizeGithubUrl(project.github_repo);
                                            return baseUrl ? (
                                                <a
                                                    href={`${baseUrl}/pull/${task.github_pr_number}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-purple-600 hover:underline"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Github className="h-3 w-3" />
                                                    PR #{task.github_pr_number}
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-purple-600">
                                                    <Github className="h-3 w-3" />
                                                    PR #{task.github_pr_number}
                                                </span>
                                            );
                                        })()}
                                </div>
                            )}
                            {task.labels && task.labels.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {task.labels.map((label) => (
                                        <Badge
                                            key={label.id}
                                            variant="outline"
                                            className="text-xs"
                                            style={{
                                                backgroundColor: `${label.color}20`,
                                                borderColor: label.color,
                                                color: label.color,
                                            }}
                                        >
                                            {label.name}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                            {project.github_repo && (
                                <div className="mt-2">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 text-xs"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenDialog();
                                        }}
                                    >
                                        {task.github_issue_number || task.github_pr_number ? "Edit" : "Add"} GitHub
                                        References
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    )}
                    {project.github_repo &&
                        !task.description &&
                        !task.assigned_user &&
                        (!task.labels || task.labels.length === 0) &&
                        !task.github_issue_number &&
                        !task.github_pr_number && (
                            <CardContent className="pt-0">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 text-xs"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenDialog();
                                    }}
                                >
                                    Add GitHub References
                                </Button>
                            </CardContent>
                        )}
                    {onMoveToBacklog && typeof task.id === "number" && (
                        <CardContent className="pt-0">
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-xs text-neutral-600"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm("Move this task back to backlog?")) {
                                        onMoveToBacklog();
                                    }
                                }}
                            >
                                Move to Backlog
                            </Button>
                        </CardContent>
                    )}
                </Card>
            </div>

            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>GitHub References</DialogTitle>
                        <DialogDescription>Link this task to GitHub issues or pull requests.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>GitHub Issue</Label>
                            {loadingRefs ? (
                                <div className="text-sm text-muted-foreground">Loading issues...</div>
                            ) : (
                                <Combobox
                                    options={[
                                        { value: "", label: "None", type: undefined },
                                        ...allOptions.filter((opt) => opt.type === "issue"),
                                    ]}
                                    value={selectedIssue || ""}
                                    onSelect={setSelectedIssue}
                                    placeholder="Select an issue..."
                                    emptyText="No issues found"
                                />
                            )}
                            {selectedIssueObj && (
                                <a
                                    href={selectedIssueObj.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                >
                                    View on GitHub <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>GitHub Pull Request</Label>
                            {loadingRefs ? (
                                <div className="text-sm text-muted-foreground">Loading PRs...</div>
                            ) : (
                                <Combobox
                                    options={[
                                        { value: "", label: "None", type: undefined },
                                        ...allOptions.filter((opt) => opt.type === "pr"),
                                    ]}
                                    value={selectedPR || ""}
                                    onSelect={setSelectedPR}
                                    placeholder="Select a PR..."
                                    emptyText="No PRs found"
                                />
                            )}
                            {selectedPRObj && (
                                <a
                                    href={selectedPRObj.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                >
                                    View on GitHub <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={saving}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving || loadingRefs}>
                            {saving ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function DroppableColumn({
    status,
    tasks,
    addingToColumn,
    onAddTask,
    onCancelAdd,
    project,
    sprint,
    onMoveToBacklog,
}: {
    status: StatusType;
    tasks: KanbanTask[];
    addingToColumn: StatusType | null;
    onAddTask: (status: StatusType, title: string) => void;
    onCancelAdd: () => void;
    project: Project;
    sprint: Sprint;
    onMoveToBacklog?: (taskId: number) => void;
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: status,
    });

    return (
        <div key={status} className="flex flex-col">
            <div className="mb-3 flex items-center justify-between rounded-lg bg-neutral-50 px-4 py-2">
                <h3 className="font-semibold text-neutral-700">{status}</h3>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                        {tasks.length}
                    </Badge>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => onAddTask(status, "")}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                <div
                    ref={setNodeRef}
                    className={`min-h-[200px] space-y-3 rounded-lg p-2 transition-colors ${
                        isOver ? "bg-blue-50 ring-2 ring-blue-300" : ""
                    }`}
                >
                    {tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            project={project}
                            sprint={sprint}
                            onUpdate={() => router.reload({ only: ["tasks"] })}
                            onMoveToBacklog={
                                typeof task.id === "number" && onMoveToBacklog
                                    ? () => onMoveToBacklog(task.id as number)
                                    : undefined
                            }
                        />
                    ))}

                    {addingToColumn === status && (
                        <AddTaskForm onAdd={(title) => onAddTask(status, title)} onCancel={onCancelAdd} />
                    )}
                </div>
            </SortableContext>
        </div>
    );
}

function AddTaskForm({ onAdd, onCancel }: { onAdd: (title: string) => void; onCancel: () => void }) {
    const [title, setTitle] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            onAdd(title.trim());
            setTitle("");
        }
    };

    return (
        <Card className="border-2 border-dashed">
            <form onSubmit={handleSubmit}>
                <CardContent className="pt-4">
                    <Input
                        autoFocus
                        placeholder="Enter task title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mb-3"
                    />
                    <div className="flex gap-2">
                        <Button type="submit" size="sm" className="flex-1">
                            Add Task
                        </Button>
                        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </form>
        </Card>
    );
}

export default function SprintTasksPage({
    project,
    sprint,
    tasks = [],
    backlogTasks = [],
}: {
    project: Project;
    sprint: Sprint;
    tasks: Task[];
    backlogTasks?: Task[];
}) {
    const [localTasks, setLocalTasks] = useState<KanbanTask[]>(() =>
        tasks.filter((task) => task.status === "Planned" || task.status === "Active" || task.status === "Completed"),
    );
    const [activeId, setActiveId] = useState<string | number | null>(null);
    const [addingToColumn, setAddingToColumn] = useState<StatusType | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [addFromBacklogOpen, setAddFromBacklogOpen] = useState(false);
    const [selectedBacklogTaskIds, setSelectedBacklogTaskIds] = useState<number[]>([]);

    useEffect(() => {
        (async () => {
            const filteredTasks = tasks.filter(
                (task) => task.status === "Planned" || task.status === "Active" || task.status === "Completed",
            );
            const taskIds = new Set(filteredTasks.map((t) => t.id));
            const currentTaskIds = new Set(localTasks.map((t) => t.id));

            if (taskIds.size !== currentTaskIds.size || ![...taskIds].every((id) => currentTaskIds.has(id))) {
                setLocalTasks(filteredTasks);
            }
        })();
    }, [tasks, localTasks]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
    );

    const tasksByStatus = KANBAN_COLUMNS.reduce(
        (acc, status) => {
            acc[status] = localTasks.filter((task) => task.status === status);
            return acc;
        },
        {} as Record<StatusType, KanbanTask[]>,
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeTask = localTasks.find((t) => t.id === active.id);
        if (!activeTask) return;

        let newStatus: StatusType | null = null;
        const newTasks: KanbanTask[] = [...localTasks];

        if (KANBAN_COLUMNS.includes(over.id as StatusType)) {
            newStatus = over.id as StatusType;
        } else {
            const overTask = localTasks.find((t) => t.id === over.id);
            if (overTask && KANBAN_COLUMNS.includes(overTask.status as StatusType)) {
                newStatus = overTask.status as StatusType;
            }
        }

        if (!newStatus) return;

        const activeTaskIndex = newTasks.findIndex((t) => t.id === active.id);
        if (activeTaskIndex === -1) return;

        if (KANBAN_COLUMNS.includes(over.id as StatusType)) {
            newTasks[activeTaskIndex] = {
                ...newTasks[activeTaskIndex],
                status: newStatus,
            };
        } else {
            const overTaskIndex = newTasks.findIndex((t) => t.id === over.id);
            if (overTaskIndex === -1) return;

            const sameStatus = newStatus === activeTask.status;
            const movedTask = { ...newTasks[activeTaskIndex], status: newStatus };

            if (sameStatus) {
                newTasks.splice(activeTaskIndex, 1);
                const insertIndex = overTaskIndex > activeTaskIndex ? overTaskIndex : overTaskIndex + 1;
                newTasks.splice(insertIndex, 0, movedTask);
            } else {
                newTasks.splice(activeTaskIndex, 1);
                const tasksInNewStatus = newTasks.filter((t) => t.status === newStatus);
                const insertIndex = tasksInNewStatus.findIndex((t) => t.id === over.id);
                const finalInsertIndex =
                    insertIndex >= 0
                        ? newTasks.findIndex((t) => t.id === tasksInNewStatus[insertIndex].id) + 1
                        : newTasks.length;
                newTasks.splice(finalInsertIndex, 0, movedTask);
            }
        }

        const reorderedTasks = KANBAN_COLUMNS.flatMap((status) => {
            const tasksInStatus = newTasks.filter((t) => t.status === status);
            return tasksInStatus.map((task, index) => ({
                ...task,
                position: index,
            }));
        });

        setLocalTasks(reorderedTasks);
        setIsSaving(true);

        const tasksToReorder = reorderedTasks
            .filter((task) => typeof task.id === "number")
            .map((task) => ({
                id: task.id,
                status: task.status,
                position: task.position,
            }));

        router.post(
            `/projects/${project.id}/sprints/${sprint.id}/tasks/reorder`,
            { tasks: tasksToReorder },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSaving(false);
                    router.reload({ only: ["tasks"] });
                },
                onError: () => {
                    setIsSaving(false);
                    router.reload({ only: ["tasks"] });
                },
            },
        );
    };

    const handleAddTask = (status: StatusType, title: string) => {
        if (!title) {
            setAddingToColumn(status);
            return;
        }

        setIsSaving(true);
        setAddingToColumn(null);

        const tempId = `temp-${Date.now()}`;
        const newTask: KanbanTask = {
            id: tempId,
            project_id: project.id,
            sprint_id: sprint.id,
            assigned_to: null,
            title,
            description: null,
            type: "task",
            status,
            priority: "medium",
            story_points: null,
            position: 0,
            github_issue_number: null,
            github_pr_number: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            isNew: true,
        };

        setLocalTasks((tasks) => [...tasks, newTask]);

        router.post(
            `/projects/${project.id}/sprints/${sprint.id}/tasks`,
            {
                title,
                status,
                type: "task",
                priority: "medium",
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSaving(false);
                    router.reload({ only: ["tasks"] });
                },
                onError: () => {
                    setIsSaving(false);
                    setLocalTasks((tasks) => tasks.filter((t) => t.id !== tempId));
                    router.reload({ only: ["tasks"] });
                },
            },
        );
    };

    const activeTask = activeId ? localTasks.find((t) => t.id === activeId) : null;

    const totalStoryPoints = localTasks.reduce((sum, task) => sum + (task.story_points || 0), 0);
    const hasCapacityWarning = sprint.planned_points && totalStoryPoints > sprint.planned_points;

    const handleAddFromBacklog = () => {
        if (selectedBacklogTaskIds.length === 0) return;

        router.post(
            `/projects/${project.id}/sprints/${sprint.id}/tasks/add-from-backlog`,
            { task_ids: selectedBacklogTaskIds },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setAddFromBacklogOpen(false);
                    setSelectedBacklogTaskIds([]);
                    router.reload({ only: ["tasks", "backlogTasks"] });
                },
            },
        );
    };

    const handleMoveToBacklog = (taskId: number) => {
        router.post(
            `/projects/${project.id}/sprints/${sprint.id}/tasks/${taskId}/move-to-backlog`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload({ only: ["tasks", "backlogTasks"] });
                },
            },
        );
    };

    const toggleBacklogTask = (taskId: number) => {
        setSelectedBacklogTaskIds((prev) =>
            prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId],
        );
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: "Projects", href: "/projects" },
                { title: project.name, href: `/projects/${project.id}/edit` },
                { title: "Sprints", href: `/projects/${project.id}/sprints` },
                { title: sprint.name, href: `/projects/${project.id}/sprints/${sprint.id}` },
            ]}
        >
            <HeaderSection
                title={`${sprint.name} - Tasks`}
                description={`${format(parseISO(sprint.start_date), "MMM dd, yyyy")} - ${format(parseISO(sprint.end_date), "MMM dd, yyyy")}${sprint.goal ? ` • ${sprint.goal}` : ""}${isSaving ? " (Saving...)" : ""}`}
                rightHandItem={
                    <Button onClick={() => setAddFromBacklogOpen(true)} variant="outline">
                        Add from Backlog
                    </Button>
                }
            />

            {hasCapacityWarning && (
                <div className="mb-4 rounded-lg border border-orange-300 bg-orange-50 p-3 text-sm text-orange-800">
                    ⚠️ Sprint capacity warning: Total story points ({totalStoryPoints}) exceeds planned capacity (
                    {sprint.planned_points})
                </div>
            )}

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="mt-6 grid grid-cols-3 gap-4">
                    {KANBAN_COLUMNS.map((status) => (
                        <DroppableColumn
                            key={status}
                            status={status}
                            tasks={tasksByStatus[status]}
                            addingToColumn={addingToColumn}
                            onAddTask={handleAddTask}
                            onCancelAdd={() => setAddingToColumn(null)}
                            project={project}
                            sprint={sprint}
                            onMoveToBacklog={handleMoveToBacklog}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeTask ? (
                        <Card className="cursor-grabbing shadow-2xl">
                            <CardHeader className="pb-3">
                                <div className="mb-2 flex items-start justify-between gap-2">
                                    <div className="flex flex-1 items-start gap-2">
                                        <GripVertical className="mt-1 h-4 w-4 text-neutral-400" />
                                        <CardTitle className="flex-1 text-base leading-tight font-medium">
                                            {activeTask.title}
                                        </CardTitle>
                                    </div>
                                    {activeTask.story_points && (
                                        <Badge variant="outline" className="shrink-0 text-xs">
                                            {activeTask.story_points} pts
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                        </Card>
                    ) : null}
                </DragOverlay>
            </DndContext>

            <Dialog open={addFromBacklogOpen} onOpenChange={setAddFromBacklogOpen}>
                <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add Tasks from Backlog</DialogTitle>
                        <DialogDescription>Select tasks to add to this sprint</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {backlogTasks.length === 0 ? (
                            <div className="py-8 text-center text-neutral-500">No tasks available in backlog</div>
                        ) : (
                            <div className="max-h-[400px] space-y-2 overflow-y-auto">
                                {backlogTasks.map((task) => (
                                    <Card key={task.id} className="rounded-lg">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start gap-3">
                                                <Checkbox
                                                    checked={selectedBacklogTaskIds.includes(task.id)}
                                                    onCheckedChange={() => toggleBacklogTask(task.id)}
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
                        {selectedBacklogTaskIds.length > 0 && (
                            <div className="rounded-lg border p-3 text-sm">
                                <div className="font-medium">Selected: {selectedBacklogTaskIds.length} tasks</div>
                                <div className="text-neutral-600">
                                    Total Story Points:{" "}
                                    <strong>
                                        {backlogTasks
                                            .filter((t) => selectedBacklogTaskIds.includes(t.id))
                                            .reduce((sum, t) => sum + (t.story_points || 0), 0)}
                                    </strong>
                                </div>
                                {sprint.planned_points && (
                                    <div className="mt-1 text-neutral-600">
                                        Planned Capacity: <strong>{sprint.planned_points}</strong>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddFromBacklogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddFromBacklog} disabled={selectedBacklogTaskIds.length === 0}>
                            Add Selected Tasks
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

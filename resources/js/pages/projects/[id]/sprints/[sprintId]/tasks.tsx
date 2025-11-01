import { HeaderSection } from "@/components/header-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import AppLayout from "@/layouts/app-layout";
import type { Project, Sprint, Task } from "@/types";
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
import { format, parseISO } from "date-fns";
import { GripVertical, Plus, X } from "lucide-react";
import { useState } from "react";

const KANBAN_COLUMNS = ["Planned", "Backlog", "Active", "Completed"] as const;

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

function TaskCard({ task }: { task: KanbanTask }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: task.id,
        data: { task },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
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
                            <CardTitle className="flex-1 text-base leading-tight font-medium">{task.title}</CardTitle>
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
                {(task.description || task.assigned_user || task.labels?.length) && (
                    <CardContent className="pt-0">
                        {task.description && (
                            <CardDescription className="mb-2 line-clamp-2 text-xs">{task.description}</CardDescription>
                        )}
                        {task.assigned_user && (
                            <div className="mb-2 flex items-center gap-2 text-xs text-neutral-600">
                                <span className="font-medium">Assigned to:</span>
                                <span>{task.assigned_user.name}</span>
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
                    </CardContent>
                )}
            </Card>
        </div>
    );
}

function DroppableColumn({
    status,
    tasks,
    addingToColumn,
    onAddTask,
    onCancelAdd,
}: {
    status: StatusType;
    tasks: KanbanTask[];
    addingToColumn: StatusType | null;
    onAddTask: (status: StatusType, title: string) => void;
    onCancelAdd: () => void;
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
                        <TaskCard key={task.id} task={task} />
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
}: {
    project: Project;
    sprint: Sprint;
    tasks: Task[];
}) {
    const [localTasks, setLocalTasks] = useState<KanbanTask[]>(tasks);
    const [activeId, setActiveId] = useState<string | number | null>(null);
    const [addingToColumn, setAddingToColumn] = useState<StatusType | null>(null);

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

        if (KANBAN_COLUMNS.includes(over.id as StatusType)) {
            newStatus = over.id as StatusType;
        } else {
            const overTask = localTasks.find((t) => t.id === over.id);
            if (overTask) {
                newStatus = overTask.status;
            }
        }

        if (newStatus && newStatus !== activeTask.status) {
            setLocalTasks((tasks) =>
                tasks.map((task) => (task.id === active.id ? { ...task, status: newStatus } : task)),
            );
            return;
        }

        if (active.id !== over.id) {
            const activeIndex = localTasks.findIndex((t) => t.id === active.id);
            const overIndex = localTasks.findIndex((t) => t.id === over.id);

            if (activeIndex !== -1 && overIndex !== -1) {
                setLocalTasks((tasks) => {
                    const newTasks = [...tasks];
                    const [movedTask] = newTasks.splice(activeIndex, 1);
                    newTasks.splice(overIndex, 0, movedTask);
                    return newTasks;
                });
            }
        }
    };

    const handleAddTask = (status: StatusType, title: string) => {
        if (!title) {
            setAddingToColumn(status);
            return;
        }

        const newTask: KanbanTask = {
            id: `temp-${Date.now()}`,
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
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            isNew: true,
        };

        setLocalTasks((tasks) => [...tasks, newTask]);
        setAddingToColumn(null);
    };

    const activeTask = activeId ? localTasks.find((t) => t.id === activeId) : null;

    return (
        <AppLayout
            breadcrumbs={[
                { title: `Project ${project.id}`, href: `/projects/${project.id}/edit` },
                { title: "Sprints", href: `/projects/${project.id}/sprints` },
                { title: sprint.name, href: `/projects/${project.id}/sprints/${sprint.id}` },
            ]}
        >
            <HeaderSection
                title={`${sprint.name} - Tasks`}
                description={`${format(parseISO(sprint.start_date), "MMM dd, yyyy")} - ${format(parseISO(sprint.end_date), "MMM dd, yyyy")}${sprint.goal ? ` • ${sprint.goal}` : ""}`}
            />

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="mt-6 grid grid-cols-4 gap-4">
                    {KANBAN_COLUMNS.map((status) => (
                        <DroppableColumn
                            key={status}
                            status={status}
                            tasks={tasksByStatus[status]}
                            addingToColumn={addingToColumn}
                            onAddTask={handleAddTask}
                            onCancelAdd={() => setAddingToColumn(null)}
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
        </AppLayout>
    );
}

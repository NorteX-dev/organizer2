import { HeaderSection } from "@/components/header-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from "@/layouts/app-layout";
import type { Project, Sprint } from "@/types";
import { router } from "@inertiajs/react";
import { addDays, format, parseISO } from "date-fns";
import { Info, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

function getTodayString() {
    const today = new Date();
    return today.toISOString().slice(0, 10);
}
function getInSevenDaysString() {
    const date = addDays(new Date(), 7);
    return date.toISOString().slice(0, 10);
}

export default function SprintsPage({ project, sprints = [] }: { project: Project; sprints: Sprint[] }) {
    const initialForm = {
        name: "",
        goal: "",
        start_date: getTodayString(),
        end_date: getInSevenDaysString(),
        planned_points: "",
    };
    const [form, setForm] = useState(initialForm);
    const [modalOpen, setModalOpen] = useState(false);

    function openCreate() {
        setForm({
            name: "",
            goal: "",
            start_date: getTodayString(),
            end_date: getInSevenDaysString(),
            planned_points: "",
        });
        setModalOpen(true);
    }
    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        router.post(`/projects/${project.id}/sprints`, form, {
            preserveScroll: true,
            onSuccess: () => setModalOpen(false),
        });
    }
    function handleDelete(sprintId: number) {
        if (!confirm("Usunąć ten sprint?")) return;
        router.delete(`/projects/${project.id}/sprints/${sprintId}`);
    }
    const statusGroups: { [k: string]: Sprint[] } = { planned: [], active: [], completed: [] };
    (sprints || []).forEach((s: Sprint) => {
        (statusGroups[s.status] ??= []).push(s);
    });

    return (
        <AppLayout
            breadcrumbs={[
                { title: "Projekty", href: "/projects" },
                { title: project.name, href: `/projects/${project.id}/edit` },
                { title: `Sprinty`, href: `/projects/${project.id}/sprints` },
            ]}
        >
            <HeaderSection
                title="Sprinty"
                rightHandItem={
                    <Button onClick={openCreate} className="cursor-pointer">
                        Utwórz sprint
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
                                            Edytuj
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            className="w-full cursor-pointer rounded-lg py-2 text-sm"
                                            onClick={() => handleDelete(sprint.id)}
                                        >
                                            <Trash2 className="mr-2 size-4" />
                                            Usuń
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="w-full cursor-pointer rounded-lg py-2 text-sm"
                                            onClick={() => router.get(`/projects/${project.id}/sprints/${sprint.id}`)}
                                        >
                                            <Info className="mr-2 size-4" />
                                            Zadania
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
                        <h3 className="mb-6 text-lg font-bold">Utwórz sprint</h3>
                        <div className="mb-4">
                            <Label htmlFor="name" className="mb-1 block">
                                Nazwa <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                className="input w-full"
                                placeholder="Nazwa"
                                required
                                value={form.name}
                                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            />
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="goal" className="mb-1 block">
                                Cel
                            </Label>
                            <Input
                                id="goal"
                                className="input w-full"
                                placeholder="Cel"
                                value={form.goal}
                                onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
                            />
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="start_date" className="mb-1 block">
                                Data rozpoczęcia <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="start_date"
                                type="date"
                                className="input w-full"
                                placeholder="Data rozpoczęcia"
                                required
                                value={form.start_date}
                                onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                            />
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="end_date" className="mb-1 block">
                                Data zakończenia <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="end_date"
                                type="date"
                                className="input w-full"
                                placeholder="Data zakończenia"
                                required
                                value={form.end_date}
                                onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                            />
                        </div>
                        <div className="mb-6">
                            <Label htmlFor="planned_points" className="mb-1 block">
                                Zaplanowane punkty <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="planned_points"
                                className="input w-full"
                                type="number"
                                placeholder="Zaplanowane punkty"
                                value={form.planned_points}
                                onChange={(e) => setForm((f) => ({ ...f, planned_points: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <Button type="button" onClick={() => setModalOpen(false)}>
                                Anuluj
                            </Button>
                            <Button type="submit" className="btn btn-primary">
                                Utwórz
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </AppLayout>
    );
}

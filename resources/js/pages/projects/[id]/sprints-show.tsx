import AppLayout from "@/layouts/app-layout";
import type { Project, Sprint } from "@/types";

export default function SprintsShowPage({ project, sprint }: { project: Project; sprint: Sprint }) {
    return (
        <AppLayout breadcrumbs={[{ title: "Projects", href: "/projects" }, { title: `Project ${project.id}`, href: `/projects/${project.id}/sprints` }, { title: sprint.name, href: "" }]}>
            <div className="max-w-2xl mx-auto mt-10">
                <h2 className="text-3xl font-bold mb-4">{sprint.name}</h2>
                <div className="mb-2">Goal: {sprint.goal}</div>
                <div className="mb-2">Status: <span className="capitalize">{sprint.status}</span></div>
                <div className="mb-2">Start: {sprint.start_date}</div>
                <div className="mb-2">End: {sprint.end_date}</div>
                <div className="mb-2">Planned Points: {sprint.planned_points}</div>
                <div className="mb-2">Completed Points: {sprint.completed_points}</div>
            </div>
        </AppLayout>
    );
}

import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";
import type { Project, Sprint } from "@/types";
import { Link } from "@inertiajs/react";
import { ArrowRight } from "lucide-react";

export default function SprintsShowPage({ project, sprint }: { project: Project; sprint: Sprint }) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: "Projects", href: "/projects" },
                { title: `Project ${project.id}`, href: `/projects/${project.id}/sprints` },
                { title: sprint.name, href: "" },
            ]}
        >
            <div className="mx-auto mt-10 max-w-2xl">
                <h2 className="mb-4 text-3xl font-bold">{sprint.name}</h2>
                <div className="mb-2">Goal: {sprint.goal}</div>
                <div className="mb-2">
                    Status: <span className="capitalize">{sprint.status}</span>
                </div>
                <div className="mb-2">Start: {sprint.start_date}</div>
                <div className="mb-2">End: {sprint.end_date}</div>
                <div className="mb-2">Planned Points: {sprint.planned_points}</div>
                <div className="mb-2">Completed Points: {sprint.completed_points}</div>

                {sprint.status === "completed" && (
                    <div className="mt-6">
                        <Link href={`/projects/${project.id}/sprints/${sprint.id}/retrospective`}>
                            <Button>
                                View Retrospective
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

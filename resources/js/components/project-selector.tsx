import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Project } from "@/types";
import { router } from "@inertiajs/react";
import { LayoutGrid } from "lucide-react";

interface ProjectSelectorProps {
    projects: Project[];
    currentProject?: Project | null;
}

export function ProjectSelector({ projects, currentProject }: ProjectSelectorProps) {
    const handleProjectSwitch = (projectId: string) => {
        const project = projects.find((p) => p.id === parseInt(projectId));
        if (project) {
            router.post(
                `/projects/${project.id}/switch`,
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }
    };

    if (projects.length === 0) {
        return null;
    }

    return (
        <Select
            value={currentProject?.id?.toString() || ""}
            onValueChange={handleProjectSwitch}
        >
            <SelectTrigger className="h-9 w-[200px]">
                <SelectValue placeholder="Select project">
                    <div className="flex items-center gap-2">
                        <LayoutGrid className="h-4 w-4" />
                        <span className="truncate">{currentProject?.name || "Select project"}</span>
                    </div>
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                        <div className="flex items-center gap-2">
                            <LayoutGrid className="h-4 w-4" />
                            <span>{project.name}</span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}


import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Project } from "@/types";
import { router } from "@inertiajs/react";
import { Edit, LayoutGrid, Plus } from "lucide-react";

interface ProjectSelectorProps {
    projects: Project[];
    currentProject?: Project | null;
}

export function ProjectSelector({ projects, currentProject }: ProjectSelectorProps) {
    const handleProjectSwitch = (value: string) => {
        if (value === "create-new") {
            router.visit("/projects");
            return;
        }

        if (value === "edit-project" && currentProject) {
            router.visit(`/projects/${currentProject.id}/edit`);
            return;
        }

        const project = projects.find((p) => p.id === parseInt(value));
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

    return (
        <Select value={currentProject?.id?.toString() || ""} onValueChange={handleProjectSwitch}>
            <SelectTrigger className="h-9 w-[200px]">
                <SelectValue placeholder="Select project">
                    <div className="flex items-center gap-2">
                        <LayoutGrid className="h-4 w-4" />
                        <span className="truncate">{currentProject?.name || "Select project"}</span>
                    </div>
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                {projects.length === 0 ? (
                    <>
                        {currentProject && (
                            <SelectItem value="edit-project">
                                <div className="flex items-center gap-2">
                                    <Edit className="h-4 w-4" />
                                    <span>Edit project</span>
                                </div>
                            </SelectItem>
                        )}
                        <SelectItem value="create-new">
                            <div className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                <span>Create new project</span>
                            </div>
                        </SelectItem>
                    </>
                ) : (
                    <>
                        {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id.toString()}>
                                <div className="flex items-center gap-2">
                                    <LayoutGrid className="h-4 w-4" />
                                    <span>{project.name}</span>
                                </div>
                            </SelectItem>
                        ))}
                        {currentProject && (
                            <SelectItem value="edit-project">
                                <div className="flex items-center gap-2">
                                    <Edit className="h-4 w-4" />
                                    <span>Edit project</span>
                                </div>
                            </SelectItem>
                        )}
                        <SelectItem value="create-new">
                            <div className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                <span>Create new project</span>
                            </div>
                        </SelectItem>
                    </>
                )}
            </SelectContent>
        </Select>
    );
}

import { type Project, type SharedData, type Team } from "@/types";
import { usePage } from "@inertiajs/react";
import { createContext, useContext, type ReactNode } from "react";

interface ProjectTeamContextValue {
    teams: Team[];
    currentTeam: Team | null;
    projects: Project[];
    currentProject: Project | null;
}

const ProjectTeamContext = createContext<ProjectTeamContextValue | undefined>(undefined);

export function ProjectTeamProvider({ children }: { children: ReactNode }) {
    const page = usePage<SharedData>();
    const { teams = [], currentTeam = null, projects = [], currentProject = null } = page.props;

    return (
        <ProjectTeamContext.Provider
            value={{
                teams,
                currentTeam,
                projects,
                currentProject,
            }}
        >
            {children}
        </ProjectTeamContext.Provider>
    );
}

export function useProjectTeam() {
    const context = useContext(ProjectTeamContext);
    if (context === undefined) {
        throw new Error("useProjectTeam must be used within a ProjectTeamProvider");
    }
    return context;
}


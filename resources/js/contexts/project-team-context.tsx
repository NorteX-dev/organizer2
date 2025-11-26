import { type Project, type Team } from "@/types";
import { createContext, useContext, useMemo, type ReactNode } from "react";

interface ProjectTeamContextValue {
    teams: Team[];
    currentTeam: Team | null;
    projects: Project[];
    currentProject: Project | null;
}

const ProjectTeamContext = createContext<ProjectTeamContextValue | undefined>(undefined);

function getProjectTeamData(): ProjectTeamContextValue {
    const metaTag = document.querySelector('meta[name="project-team-data"]');
    if (!metaTag) {
        return {
            teams: [],
            currentTeam: null,
            projects: [],
            currentProject: null,
        };
    }

    try {
        const content = metaTag.getAttribute("content");
        if (!content) {
            return {
                teams: [],
                currentTeam: null,
                projects: [],
                currentProject: null,
            };
        }

        const data = JSON.parse(content);
        return {
            teams: data.teams || [],
            currentTeam: data.currentTeam || null,
            projects: data.projects || [],
            currentProject: data.currentProject || null,
        };
    } catch (error) {
        return {
            teams: [],
            currentTeam: null,
            projects: [],
            currentProject: null,
        };
    }
}

export function ProjectTeamProvider({ children }: { children: ReactNode }) {
    const data = useMemo(() => getProjectTeamData(), []);

    return <ProjectTeamContext.Provider value={data}>{children}</ProjectTeamContext.Provider>;
}

export function useProjectTeam() {
    const context = useContext(ProjectTeamContext);
    if (context === undefined) {
        throw new Error("useProjectTeam must be used within a ProjectTeamProvider");
    }
    return context;
}

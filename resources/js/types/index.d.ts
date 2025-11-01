import { InertiaLinkProps } from "@inertiajs/react";
import { LucideIcon } from "lucide-react";

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps["href"]>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    teams?: Team[];
    currentTeam?: Team | null;
    projects?: Project[];
    currentProject?: Project | null;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Team {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    users?: User[];
}

export interface Project {
    id: number;
    name: string;
    status: string;
}

export interface Sprint {
    id: number;
    project_id: number;
    name: string;
    goal: string;
    start_date: string;
    end_date: string;
    status: string;
    planned_points: number;
    completed_points: number;
    created_at: string;
    updated_at: string;
}

export interface Task {
    id: number;
    project_id: number;
    sprint_id: number | null;
    assigned_to: number | null;
    title: string;
    description: string | null;
    type: "story" | "task" | "bug" | "epic";
    status: "Planned" | "Backlog" | "Active" | "Completed";
    priority: "low" | "medium" | "high" | "critical";
    story_points: number | null;
    position: number;
    github_issue_number: string | null;
    created_at: string;
    updated_at: string;
    assigned_user?: User;
    labels?: Label[];
}

export interface Label {
    id: number;
    name: string;
    color: string;
}

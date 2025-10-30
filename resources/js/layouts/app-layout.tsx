import { AppHeader } from "@/components/app-header";
import { type BreadcrumbItem } from "@/types";
import { type ReactNode } from "react";

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs }: AppLayoutProps) => (
    <div className="flex min-h-screen w-full flex-col">
        <AppHeader breadcrumbs={breadcrumbs} />
        <main className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-4 rounded-xl">{children}</main>
    </div>
);

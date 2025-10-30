import { AppHeader } from "@/components/app-header";
import { cn } from "@/lib/utils";
import { type BreadcrumbItem } from "@/types";
import { type ReactNode } from "react";

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    container?: boolean;
}

export default ({ children, breadcrumbs, container = true }: AppLayoutProps) => (
    <div className="flex min-h-screen w-full flex-col">
        <AppHeader breadcrumbs={breadcrumbs} />
        <main
            className={cn("flex h-full w-full flex-1 flex-col gap-4 rounded-xl", {
                container,
                "px-8 py-4": !container,
            })}
        >
            {children}
        </main>
    </div>
);

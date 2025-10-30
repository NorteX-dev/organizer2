import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface HeaderSectionProps {
    title: string;
    description?: string;
    rightHandItem?: ReactNode;
    className?: string;
}

export function HeaderSection({ title, description, rightHandItem, className }: HeaderSectionProps) {
    return (
        <div className={cn("my-8 flex items-center justify-between", className)}>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                {description && <p className="text-muted-foreground">{description}</p>}
            </div>
            {rightHandItem && <div>{rightHandItem}</div>}
        </div>
    );
}

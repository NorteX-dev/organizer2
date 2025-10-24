import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import { AppHeader } from '@/components/app-header';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs }: AppLayoutProps) => (
    <AppShell>
        <AppHeader breadcrumbs={breadcrumbs} />
        <AppContent>{children}</AppContent>
    </AppShell>
);

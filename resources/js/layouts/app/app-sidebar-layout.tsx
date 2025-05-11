import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';
import { Toaster } from 'sonner';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
    className = '',
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[]; className?: string }>) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar">
                <Toaster richColors position="top-right" />
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <div className={className}>{children}</div>
            </AppContent>
        </AppShell>
    );
}

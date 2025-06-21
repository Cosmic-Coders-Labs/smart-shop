import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BadgePlus, BoxIcon, Headphones, LayoutGrid, ShoppingCart } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
        icon: LayoutGrid,
        roles: ['customer', 'admin'],
    },
    {
        title: 'Products',
        href: route('products.dashboard'),
        icon: BoxIcon,
        roles: ['customer', 'admin'],
    },
    {
        title: 'Cart',
        href: route('cart.index'),
        icon: ShoppingCart,
        roles: ['customer'],
    },
    {
        title: 'Create',
        href: route('products.create'),
        icon: BadgePlus,
        roles: ['admin'],
    },
    {
        title: 'Support',
        href: route('chat.index'),
        icon: Headphones,
        roles: ['customer', 'admin'],
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

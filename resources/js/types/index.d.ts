import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

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
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    is_admin?: boolean;
    phone?: string;
    address?: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

// Models

export interface Category {
    id: number;
    name: string;
}

export interface Product {
    id: number;
    name: string;
    price: number;
    category: string; // Use category name for frontend compatibility
    image_url: string | null;
}

// Page Props

export interface LandingPageProps {
    featuredProducts: Array<{
        id: number;
        name: string;
        price: number;
        category: string;
        image_url: string;
    }>;
    auth: { name: string } | null;
    chatMessages: Array<{
        id: number;
        user_id: number;
        message: string;
        is_bot: boolean;
        user: { name: string };
    }>;
}

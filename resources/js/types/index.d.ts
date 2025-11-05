import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

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
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
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

export interface Specialization {
    id: number;
    name: string;
}

export interface Dentist {
    dentist_id: number;
    fname: string;
    mname: string | null;
    lname: string;
    specialization: string;
    contact_number: string | null;
    email: string;
    employment_status: string | null;
    hire_date: string | null;
}

export interface DentistDetail {
    id: number;
    fname: string;
    mname: string | null;
    lname: string;
    full_name: string;
    gender: string;
    email: string;
    contact_number: string | null;
    avatar_path: string | null;
    avatar_url: string | null;
    specializations: Specialization[];
    employment_status: string | null;
    hire_date: string | null;
    hire_date_formatted: string | null;
    archived_at: string | null;
    created_at: string;
    created_at_formatted: string;
    email_verified_at: string | null;
    must_change_password: boolean;
}

export interface DentistFormData {
    fname: string;
    mname: string;
    lname: string;
    gender: string;
    contact_number: string;
    email: string;
    avatar: File | null;
    specialization_ids: number[];
    employment_status: string;
    hire_date: string;
}

export interface DentistsTableProps {
    dentists: Dentist[];
}

export interface RegisterDentistProps {
    specializations: Specialization[];
    errors?: Record<string, string>;
}

export interface ViewDentistProps {
    dentist: DentistDetail;
}

export interface ChangePasswordProps {
    mustChangePassword: boolean;
}

import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
}

export interface ServiceCard {
  id: string;
  tag: string;
  title: string;
  description: string;
  features: string[];
  icon: LucideIcon;
}

export interface PricingTier {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  cta: string;
}

export interface PainPoint {
  icon: LucideIcon;
  title: string;
  description: string;
  bottomLabel: string;
  bottomIcon: LucideIcon;
}

export interface ProjectCard {
  id: string;
  name: string;
  url: string;
  image: string;
  description: string;
  tags: string[];
}

export interface ContactFormData {
  name: string;
  phone: string;
  website: string;
  message: string;
}

export interface LeadMagnetData {
  email: string;
}

export interface FormState {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

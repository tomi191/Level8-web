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
  icon: string;
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
  icon: string;
  title: string;
  description: string;
}

export interface ClientLogo {
  name: string;
  description: string;
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

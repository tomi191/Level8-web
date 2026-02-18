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
  mobileImage: string;
  description: string;
  tags: string[];
  result?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  company: string;
  role: string;
  quote: string;
  project?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface AboutStat {
  value: string;
  label: string;
}

export interface AboutValue {
  title: string;
  description: string;
  icon: string;
}

export interface CaseStudyMetric {
  value: string;
  label: string;
}

export interface CaseStudy {
  slug: string;
  name: string;
  tagline: string;
  heroImage: string;
  liveUrl: string;
  category: string;
  tags: string[];
  primaryMetric: CaseStudyMetric;
  challenge: {
    title: string;
    paragraphs: string[];
  };
  solution: {
    title: string;
    paragraphs: string[];
    features: string[];
  };
  techStack: string[];
  results: {
    title: string;
    description: string;
    metrics: CaseStudyMetric[];
  };
  testimonialId?: string;
  duration: string;
  year: string;
  metaTitle: string;
  metaDescription: string;
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

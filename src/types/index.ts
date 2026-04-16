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

  // Marks that the project is owned, built and operated by Level 8 itself
  isOwnProduct?: boolean;

  // ── Optional technical deep-dive fields (populated progressively per project) ──
  screenshots?: CaseScreenshot[];
  architecture?: CaseArchitecture;
  technicalDecisions?: TechnicalDecision[];
  techStackDetailed?: TechStackDetailed;
  challenges?: CaseChallenge[];
  performance?: CasePerformance;
  livingMetrics?: CaseLivingMetrics;
  lessonsLearned?: CaseLesson[];
  codeHighlights?: CaseCodeHighlight[];
}

export interface CaseScreenshot {
  src: string;
  alt: string;
  device: "desktop" | "mobile";
  caption?: string;
  /** Optional path for live iframe preview (e.g. "/horoscope"). Appended to liveUrl. */
  path?: string;
}

export type DiagramNodeType =
  | "actor"
  | "frontend"
  | "backend"
  | "database"
  | "external";

export interface DiagramNode {
  id: string;
  label: string;
  type: DiagramNodeType;
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
}

export interface CaseArchitecture {
  summary: string;
  diagram: {
    nodes: DiagramNode[];
    edges: DiagramEdge[];
  };
  dataFlow: string[];
}

export interface TechnicalDecision {
  question: string;
  chose: string;
  rejected: string[];
  reasoning: string;
  tradeoff: string;
}

export interface TechStackDetailed {
  frontend?: string[];
  backend?: string[];
  database?: string[];
  auth?: string[];
  payments?: string[];
  ai?: string[];
  astrology?: string[];
  email?: string[];
  infrastructure?: string[];
  monitoring?: string[];
  testing?: string[];
  ci?: string[];
}

export interface CaseChallenge {
  title: string;
  problem: string;
  solution: string;
  filesPaths?: string[];
}

export interface CasePerformance {
  notes?: string;
  lighthouse?: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  coreWebVitals?: {
    lcp: string;
    inp: string;
    cls: string;
  };
  bundleSize?: {
    firstLoadJs: string;
    largestRoute: string;
  };
}

export interface CaseLivingMetrics {
  notes?: string;
  [key: string]: string | undefined;
}

export interface CaseLesson {
  title: string;
  detail: string;
  wouldDoDifferently: string;
}

export interface CaseCodeHighlight {
  title: string;
  why: string;
  snippet: string;
  filePath: string;
}

export interface DesignTrend {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  whenToUse: string;
  tags: string[];
  category: "layout" | "aesthetic" | "interactive";
  year: string;
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

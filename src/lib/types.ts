// Core type definitions for configurable content across the site
// This provides scalable, reusable structures for services, trainings, SEO, contact, and socials.

export type CurrencyCode = 'NGN' | 'USD';

export interface Money {
  amount: number;
  currency: CurrencyCode;
}

export type DurationUnit = 'minute' | 'hour';

export interface Duration {
  min?: number; // minimum duration in unit
  max?: number; // maximum duration in unit
  unit?: DurationUnit;
}

export type ServiceTag =
  | 'lash'
  | 'brow'
  | 'training'
  | 'manicure'
  | 'pedicure'
  | 'studio'
  | 'at_home';
export interface ServiceVariant {
  id: string;
  name: string;
  price?: Money;
  duration?: Duration;
  notes?: string;
  bookingLink?: string; // optional deep link to book this variant
}

export interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  summary?: string;
  basePrice?: Money;
  duration?: Duration;
  variants?: ServiceVariant[];
  tags?: ServiceTag[];
  images?: string[]; // static asset paths or URLs
  bookingLink?: string; // optional deep link to book this service
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  services: ServiceItem[];
}
export interface TrainingLevel {
  id: string;
  name: string; // e.g., Beginner, Intermediate, Advanced
  duration?: Duration;
  price?: Money;
  syllabus?: string[]; // list of topics
}

export type TrainingType = 'internship' | 'workshop' | 'masterclass';

export interface TrainingProgram {
  id: string;
  name: string;
  type: TrainingType;
  description?: string;
  levels?: TrainingLevel[];
  scheduleNote?: string;
}
export interface Address {
  line1: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
  mapUrl?: string;
}

export interface ContactInfo {
  email: string;
  phone?: string;
  whatsapp?: string; // deep link to WhatsApp message
  address?: Address;
}

export type SocialPlatform =
  | 'instagram'
  | 'facebook'
  | 'whatsapp'
  | 'tiktok'
  | 'youtube'
  | 'twitter';

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
  handle?: string; // optional @handle or page name
}
export interface SEOConfig {
  defaultTitle: string;
  defaultDescription: string;
  siteName?: string;
  canonicalUrl?: string;
  og?: {
    type?: 'website';
    image?: string;
  };
  twitter?: {
    card?: 'summary' | 'summary_large_image';
    site?: string; // e.g., @lashbymotoke
  };
}

export interface SiteConfig {
  seo: SEOConfig;
  contact: ContactInfo;
  socials: SocialLink[];
}

// RBAC for Admin Portal
export type Role = 'admin' | 'manager' | 'staff' | 'viewer';
export type Permission =
  | 'users:read' | 'users:write' | 'users:delete'
  | 'services:read' | 'services:write'
  | 'trainings:read' | 'trainings:write'
  | 'applications:read' | 'applications:write' | 'applications:export'
  | 'bookings:read' | 'bookings:write'
  | 'analytics:read'
  | 'templates:read' | 'templates:write'
  | 'resources:read' | 'resources:write'
  | 'audit:read';

export interface User {
  _id?: string;
  email: string;
  name?: string;
  passwordHash: string;
  role: Role;
  permissions?: Permission[];
  createdAt?: string;
  updatedAt?: string;
}

// Audit log records for admin portal actions
export interface AuditLog {
  _id?: string;
  actorEmail: string;
  actorRole?: Role;
  action: string;
  resource?: string; // e.g., 'user','service','training','template'
  resourceId?: string;
  message?: string;
  details?: any; // optional structured payload
  createdAt: string;
}

// Resources (SEO content assets)
export type ResourceStatus = 'draft' | 'published' | 'archived';

export interface Resource {
  _id?: string;
  title: string;
  slug: string;
  summary?: string;
  content?: string; // HTML or Markdown
  heroImage?: string;
  category?: string; // e.g., Guides, Aftercare, Promotions
  tags?: string[];
  status?: ResourceStatus; // default: draft
  ctaLabel?: string;
  ctaHref?: string; // external link or internal route
  authorEmail?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Shared booking types
export type ServiceType = 'studio' | 'home';
export type HomeServiceLocation = 'mainland' | 'island-1' | 'island-2' | 'island-3';
export interface SessionBooking {
  serviceType: ServiceType;
  scheduleDate: string; // ISO yyyy-mm-dd
  scheduleTime: string; // HH:mm
  scheduleLocation?: HomeServiceLocation;
  scheduleDuration?: string; // e.g., "1hr", "1hr 30mins"
  specialRequest?: string;
  fullName: string;
  phoneNumber: string;
  emailAddress: string;
  homeAddress?: string;
}

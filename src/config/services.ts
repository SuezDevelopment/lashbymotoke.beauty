import type { ServiceCategory, TrainingProgram, Money, DurationUnit } from '@/lib/types';

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'lash',
    name: 'Lash Services',
    slug: 'lash-services',
    description: 'Premium lash extensions and refills.',
    services: [
      {
        id: 'classic-lash',
        name: 'Classic Lash Extension',
        slug: 'classic-lash-extension',
        summary: 'Natural, lightweight lash extension for everyday glam.',
        basePrice: { amount: 30000, currency: 'NGN' },
        duration: { min: 90, unit: 'minute' },
        tags: ['lash','studio'],
      },
      {
        id: 'volume-lash',
        name: 'Volume Lash Extension',
        slug: 'volume-lash-extension',
        summary: 'Fuller lash look with multiple extensions per natural lash.',
        basePrice: { amount: 45000, currency: 'NGN' },
        duration: { min: 120, unit: 'minute' },
        tags: ['lash','studio'],
      },
    ],
  },
  {
    id: 'brow',
    name: 'Brow Services',
    slug: 'brow-services',
    description: 'Shaping and tinting for bold, defined brows.',
    services: [
      {
        id: 'brow-shape',
        name: 'Brow Shaping',
        slug: 'brow-shaping',
        summary: 'Professional brow shaping and trimming.',
        basePrice: { amount: 8000, currency: 'NGN' },
        duration: { min: 30, unit: 'minute' },
        tags: ['brow','studio'],
      },
    ],
  },
];

export const TRAINING_PROGRAMS: TrainingProgram[] = [
  {
    id: 'internship-basic',
    name: 'Internship Program',
    type: 'internship',
    description: 'Hands-on studio internship learning multiple crafts.',
    scheduleNote: 'Ongoing enrollment; studio-only.',
    levels: [
      {
        id: 'int-beginner',
        name: 'Beginner Track',
        duration: { min: 40, unit: 'hour' },
        price: { amount: 120000, currency: 'NGN' },
        syllabus: ['Studio hygiene', 'Client handling basics', 'Intro to lash application'],
      },
      {
        id: 'int-advanced',
        name: 'Advanced Track',
        duration: { min: 60, unit: 'hour' },
        price: { amount: 200000, currency: 'NGN' },
        syllabus: ['Advanced volume techniques', 'Retention optimization', 'Client retention & aftercare'],
      },
    ],
  },
  {
    id: 'workshop-lash',
    name: 'Lash Workshop',
    type: 'workshop',
    description: 'Focused workshop on lash fundamentals and practice.',
    scheduleNote: 'Weekend sessions available.',
    levels: [
      {
        id: 'ws-beginner',
        name: 'Beginner',
        duration: { min: 8, unit: 'hour' },
        price: { amount: 50000, currency: 'NGN' },
        syllabus: ['Tools & setup', 'Classic application workflow', 'Aftercare basics'],
      },
    ],
  },
  {
    id: 'masterclass-beauty',
    name: 'Beauty Masterclass',
    type: 'masterclass',
    description: 'Masterclass covering lash and brow artistry for pros.',
    scheduleNote: 'Monthly masterclass with limited seats.',
    levels: [
      {
        id: 'mc-pro',
        name: 'Pro Level',
        duration: { min: 10, unit: 'hour' },
        price: { amount: 150000, currency: 'NGN' },
        syllabus: ['Advanced styling', 'Custom mapping', 'Client experience design'],
      },
    ],
  },
];
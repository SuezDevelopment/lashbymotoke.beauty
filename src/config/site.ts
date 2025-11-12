import { SiteConfig } from '@/lib/types';

export const SITE_CONFIG: SiteConfig = {
  seo: {
    defaultTitle: 'LashByMotoke | Lash & Beauty Services in Lagos',
    defaultDescription:
      'Premium lash extensions, refills, and beauty services in Lagos. Book studio or at-home sessions with LashByMotoke.',
    siteName: 'LashByMotoke',
    canonicalUrl: 'https://lashbymotoke.beauty',
    og: {
      type: 'website',
      image: '/mbe.png',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@lashbymotoke',
    },
  },
  contact: {
    email: 'hello@lashbymotoke.beauty',
    phone: '+2348000000000',
    whatsapp: 'https://wa.me/2348000000000',
    address: {
      line1: '133 Ahmadu Bello Way, Victoria Island',
      city: 'Lagos',
      region: 'LA',
      country: 'NG',
      postalCode: '100001',
      mapUrl: 'https://maps.google.com/?q=133+Ahmadu+Bello+Way,+Victoria+Island+Lagos',
    },
  },
  socials: [
    { platform: 'instagram', url: 'https://instagram.com/lashbymotoke', handle: '@lashbymotoke' },
    { platform: 'facebook', url: 'https://facebook.com/lashbymotoke' },
    { platform: 'tiktok', url: 'https://tiktok.com/@lashbymotoke' },
  ],
};
// The five core assessment dimensions (ابعاد پنج‌گانه ارزیابی), in fixed display order.
import {
  Users,
  Boxes,
  Compass,
  Gem,
  ShieldCheck,
} from 'lucide-react';

export const DIMENSIONS = [
  {
    key: 'customerFocus',
    label: 'تمرکز بر مشتری',
    shortLabel: 'مشتری',
    icon: Users,
    color: '#0E7C7B', // teal
  },
  {
    key: 'resourcesCapabilities',
    label: 'منابع و قابلیت‌ها',
    shortLabel: 'منابع',
    icon: Boxes,
    color: '#2E5266', // steel blue
  },
  {
    key: 'strategicVision',
    label: 'چشم‌انداز استراتژیک',
    shortLabel: 'چشم‌انداز',
    icon: Compass,
    color: '#B8763E', // amber/clay
  },
  {
    key: 'valueCreation',
    label: 'ارزش‌آفرینی',
    shortLabel: 'ارزش‌آفرینی',
    icon: Gem,
    color: '#6C4F77', // muted plum
  },
  {
    key: 'qualityFocus',
    label: 'تمرکز بر کیفیت',
    shortLabel: 'کیفیت',
    icon: ShieldCheck,
    color: '#3E7C4A', // forest green
  },
];

export const getDimensionByKey = (key) => DIMENSIONS.find((d) => d.key === key);

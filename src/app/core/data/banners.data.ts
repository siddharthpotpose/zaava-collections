import { Banner } from '../models/banner.model';

export const BANNERS: Banner[] = [
  {
    id: 1,
    title: 'Saree Festival 2026',
    subtitle: 'Exclusive handpicked silk and designer sarees with premium drape quality.',
    image: 'https://images.pexels.com/photos/1153838/pexels-photo-1153838.jpeg',
    ctaLabel: 'Shop Sarees',
    ctaLink: '/products?category=Saree'
  },
  {
    id: 2,
    title: 'Wedding Collection',
    subtitle: 'Banarasi and Kanjivaram picks for festive and wedding moments.',
    image: 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg',
    ctaLabel: 'View Collection',
    ctaLink: '/products?category=Banarasi%20Saree'
  },
  {
    id: 3,
    title: 'Elegant Everyday Styles',
    subtitle: 'Lightweight cotton sarees, salwar sets and trendy co-ord sets for daily wear.',
    image: 'https://images.pexels.com/photos/458766/pexels-photo-458766.jpeg',
    ctaLabel: 'Explore Now',
    ctaLink: '/products'
  }
];

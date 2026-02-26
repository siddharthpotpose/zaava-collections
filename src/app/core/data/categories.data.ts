import { Category } from '../models/category.model';

export const CATEGORIES: Category[] = [
  {
    id: 1,
    name: 'Saree',
    slug: 'saree',
    icon: 'fa-shirt',
    image: 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg',
    featured: true
  },
  {
    id: 2,
    name: 'Banarasi Saree',
    slug: 'banarasi-saree',
    icon: 'fa-gem',
    image: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg',
    parentCategory: 'Saree',
    featured: true
  },
  {
    id: 3,
    name: 'Kanjivaram Saree',
    slug: 'kanjivaram-saree',
    icon: 'fa-crown',
    image: 'https://images.pexels.com/photos/291762/pexels-photo-291762.jpeg',
    parentCategory: 'Saree',
    featured: true
  },
  {
    id: 4,
    name: 'Cotton Saree',
    slug: 'cotton-saree',
    icon: 'fa-leaf',
    image: 'https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg',
    parentCategory: 'Saree',
    featured: true
  },
  {
    id: 5,
    name: 'Salwar Suit',
    slug: 'salwar-suit',
    icon: 'fa-shirt',
    image: 'https://images.pexels.com/photos/9775882/pexels-photo-9775882.jpeg',
    featured: true
  },
  {
    id: 6,
    name: 'Co-ord Set',
    slug: 'co-ord-set',
    icon: 'fa-user-group',
    image: 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg',
    featured: true
  },
  {
    id: 7,
    name: 'Jewellery',
    slug: 'jewellery',
    icon: 'fa-gem',
    image: 'https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg',
    featured: true
  }
];


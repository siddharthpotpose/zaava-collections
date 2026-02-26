import { Order } from '../models/order.model';

export const ORDERS: Order[] = [
  {
    id: 1001,
    userName: 'Rahul Verma',
    email: 'rahul.verma@example.com',
    address: '221 Park Street, Bengaluru, Karnataka',
    products: [
      { productTitle: 'Royal Banarasi Zari Saree', quantity: 1, unitPrice: 4899 },
      { productTitle: 'Temple Motif Gold Plated Necklace', quantity: 1, unitPrice: 1799 }
    ],
    totalAmount: 6698,
    orderDate: '2026-01-18T10:30:00'
  },
  {
    id: 1002,
    userName: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    address: '55 Lake View Road, Mumbai, Maharashtra',
    products: [
      { productTitle: 'Zari Embroidered Salwar Suit Set', quantity: 1, unitPrice: 3299 },
      { productTitle: 'Soft Mulmul Cotton Saree', quantity: 1, unitPrice: 1699 }
    ],
    totalAmount: 4998,
    orderDate: '2026-01-21T15:15:00'
  },
  {
    id: 1003,
    userName: 'Ananya Singh',
    email: 'ananya.singh@example.com',
    address: '14 Green Avenue, Jaipur, Rajasthan',
    products: [
      { productTitle: 'Graceful Kanjivaram Bridal Saree', quantity: 1, unitPrice: 8999 }
    ],
    totalAmount: 8999,
    orderDate: '2026-02-03T12:45:00'
  }
];

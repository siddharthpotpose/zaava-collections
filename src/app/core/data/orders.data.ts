import { Order } from '../models/order.model';

export const ORDERS: Order[] = [
  {
    id: 1001,
    userName: 'Rahul Verma',
    phone: '9876543210',
    email: 'rahul.verma@example.com',
    address: '221 Park Street, Bengaluru, Karnataka',
    city: 'Bengaluru',
    note: '',
    products: [
      { productTitle: 'Royal Banarasi Zari Saree', quantity: 1, unitPrice: 4899, selectedSize: 'Free Size' },
      { productTitle: 'Temple Motif Gold Plated Necklace', quantity: 1, unitPrice: 1799, selectedSize: 'Standard' }
    ],
    totalAmount: 6698,
    orderDate: '2026-01-18T10:30:00',
    status: 'Delivered'
  },
  {
    id: 1002,
    userName: 'Priya Sharma',
    phone: '9123456780',
    email: 'priya.sharma@example.com',
    address: '55 Lake View Road, Mumbai, Maharashtra',
    city: 'Mumbai',
    note: 'Call before delivery.',
    products: [
      { productTitle: 'Zari Embroidered Salwar Suit Set', quantity: 1, unitPrice: 3299, selectedSize: 'M' },
      { productTitle: 'Soft Mulmul Cotton Saree', quantity: 1, unitPrice: 1699, selectedSize: 'Free Size' }
    ],
    totalAmount: 4998,
    orderDate: '2026-01-21T15:15:00',
    status: 'Pending'
  },
  {
    id: 1003,
    userName: 'Ananya Singh',
    phone: '9988776655',
    email: 'ananya.singh@example.com',
    address: '14 Green Avenue, Jaipur, Rajasthan',
    city: 'Jaipur',
    note: '',
    products: [
      { productTitle: 'Graceful Kanjivaram Bridal Saree', quantity: 1, unitPrice: 8999, selectedSize: 'Free Size' }
    ],
    totalAmount: 8999,
    orderDate: '2026-02-03T12:45:00',
    status: 'Pending'
  }
];

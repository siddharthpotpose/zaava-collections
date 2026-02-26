export interface OrderItem {
  productTitle: string;
  quantity: number;
  unitPrice: number;
  selectedSize?: string;
  image?: string;
}

export type OrderStatus = 'Pending' | 'Delivered';

export interface Order {
  id: number;
  userName: string;
  phone: string;
  email: string;
  address: string;
  city?: string;
  note?: string;
  products: OrderItem[];
  totalAmount: number;
  orderDate: string;
  status: OrderStatus;
}

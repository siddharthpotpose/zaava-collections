export interface OrderItem {
  productTitle: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: number;
  userName: string;
  email: string;
  address: string;
  products: OrderItem[];
  totalAmount: number;
  orderDate: string;
}

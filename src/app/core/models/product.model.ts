export interface Product {
  id: number;
  title: string;
  brand: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  description: string;
  images: string[];
  sizes: string[];
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
}

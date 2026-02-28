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


//  productId: any  
//  productSku: string 
//  productName: string 
//  productPrice: any 
//  productShortName: string 
//  productDescription: string 
//  createdDate: any
//  deliveryTimeSpan : any 
//  categoryId: any 
//  productImageUrl: any 
//  categoryName: any 




}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
}

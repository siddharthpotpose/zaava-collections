export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  image: string;
  parentCategory?: string;
  featured?: boolean;
}

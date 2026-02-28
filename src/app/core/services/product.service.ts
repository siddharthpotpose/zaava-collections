import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { PRODUCTS } from '../data/products.data';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';
import { apiName } from '../apis/apiName';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly productsSubject = new BehaviorSubject<Product[]>([...PRODUCTS]);
  private readonly productsCacheKey = 'zaava_all_products_cache';

  constructor(private http: HttpClient) { }



  getProduct() {
    return this.http.get(`${environment.apiUrl}/${apiName.GetAllProducts}`).pipe(
      tap((res: any) => {
        const products = Array.isArray(res?.data) ? res.data : [];
        if (products.length > 0) {
          this.setCachedApiProducts(products);
        }
      })
    );
  }
  createProductEntry(requestBody: any) {
    return this.http.post(`${environment.apiUrl}/${apiName.CreateProduct}`, requestBody)
  }
  UpdateProduct(requestBody: any) {
    return this.http.post(`${environment.apiUrl}/${apiName.UpdateProduct}`, requestBody)
  }
  GetProductById(productId: any) {
    const id = Number(productId);
    return this.http.get(`${environment.apiUrl}/${apiName.GetProductById}`, {
      params: { id: String(id) }
    })
  }
   GetAllProductsByCategoryId(productId: any) {
    const id = Number(productId);
    return this.http.get(`${environment.apiUrl}/${apiName.GetAllProductsByCategoryId}`, {
      params: { id: String(id) }
    })
  }
  DeleteProductById(productId: any) {
    const id = Number(productId);
    return this.http.get(`${environment.apiUrl}/${apiName.DeleteProductById}`, {
      params: { id: String(id) }
    })
  }






  // ----------------------------------------------------------


  getProducts(): Observable<Product[]> {
    return this.productsSubject.asObservable();
  }

  getProductsSnapshot(): Product[] {
    return this.productsSubject.getValue();
  }

  getProductById(id: number): Product | undefined {
    return this.productsSubject.getValue().find((product) => product.id === id);
  }

  addProduct(payload: Product): void {
    const nextList = [...this.productsSubject.getValue(), payload];
    this.productsSubject.next(nextList);
  }

  updateProduct(payload: Product): void {
    const nextList = this.productsSubject
      .getValue()
      .map((product) => (product.id === payload.id ? payload : product));
    this.productsSubject.next(nextList);
  }

  deleteProduct(id: number): void {
    const nextList = this.productsSubject.getValue().filter((product) => product.id !== id);
    this.productsSubject.next(nextList);
  }

  getCachedApiProducts<T = any>(): T[] {
    try {
      const raw = localStorage.getItem(this.productsCacheKey);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  getCachedApiProductById<T = any>(productId: number): T | undefined {
    const id = Number(productId);
    if (!id || Number.isNaN(id)) {
      return undefined;
    }

    return this.getCachedApiProducts<T & { productId: number }>().find(
      (item) => Number(item.productId) === id
    );
  }

  setCachedApiProducts(products: any[]): void {
    try {
      localStorage.setItem(this.productsCacheKey, JSON.stringify(products));
    } catch {
      // Ignore storage errors (quota/private mode).
    }
  }


}

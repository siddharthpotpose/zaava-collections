import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { PRODUCTS } from '../data/products.data';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';
import { apiName } from '../apis/apiName';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly productsSubject = new BehaviorSubject<Product[]>([...PRODUCTS]);

  constructor(private http: HttpClient) { }



  getProduct() {
    return this.http.get(`${environment.apiUrl}/${apiName.GetAllProducts}`)
  }
  createProductEntry(requestBody: any) {
    return this.http.post(`${environment.apiUrl}/${apiName.CreateProduct}`, requestBody)
  }
  UpdateProduct(requestBody: any) {
    return this.http.post(`${environment.apiUrl}/${apiName.UpdateProduct}`, requestBody)
  }
  DeleteProductById(productId: any) {
    const id = Number(productId);
    return this.http.get(`${environment.apiUrl}/${apiName.DeleteProductById}`,{
      params : {id:String(id)}
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


}

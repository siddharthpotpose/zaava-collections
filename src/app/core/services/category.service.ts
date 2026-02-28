import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CATEGORIES } from '../data/categories.data';
import { Category } from '../models/category.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';
import { apiName } from '../apis/apiName';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly categoriesSubject = new BehaviorSubject<Category[]>([...CATEGORIES]);

  constructor(private http: HttpClient){}


  getCategory(){
    return this.http.get(`${environment.apiUrl}/${apiName.GetAllCategory}`)
  }

  CreateNewCategory(requestBody:any){
    return this.http.post(`${environment.apiUrl}/${apiName.CreateNewCategory}`,requestBody)
  }


  DeleteCategoryById(categoryId:any){
    const id = Number(categoryId)
    return this.http.get(`${environment.apiUrl}/${apiName.DeleteCategoryById}`,{
      params : {id : String(id)}
    })
  }

  // ---------------------------------------------------------------------------------- 

  getCategories(): Observable<Category[]> {
    return this.categoriesSubject.asObservable();
  }

  getCategoriesSnapshot(): Category[] {
    return this.categoriesSubject.getValue();
  }

  addCategory(payload: Category): void {
    this.categoriesSubject.next([...this.categoriesSubject.getValue(), payload]);
  }

  updateCategory(payload: Category): void {
    const next = this.categoriesSubject
      .getValue()
      .map((category) => (category.id === payload.id ? payload : category));
    this.categoriesSubject.next(next);
  }

  deleteCategory(id: number): void {
    const next = this.categoriesSubject.getValue().filter((category) => category.id !== id);
    this.categoriesSubject.next(next);
  }

  getCategoryAndChildrenNames(categoryName: string): string[] {
    const all = this.categoriesSubject.getValue();
    const selected = all.find(
      (item) => item.name.toLowerCase() === categoryName.toLowerCase() || item.slug === categoryName
    );

    if (!selected) {
      return [categoryName];
    }

    const children = all
      .filter((item) => (item.parentCategory ?? '').toLowerCase() === selected.name.toLowerCase())
      .map((item) => item.name);

    return [selected.name, ...children];
  }

  getNextCategoryId(): number {
    const ids = this.categoriesSubject.getValue().map((category) => category.id);
    return (Math.max(...ids, 0) || 0) + 1;
  }
}

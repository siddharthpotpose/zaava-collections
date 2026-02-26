import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BANNERS } from '../data/banners.data';
import { Banner } from '../models/banner.model';

@Injectable({ providedIn: 'root' })
export class BannerService {
  private readonly bannersSubject = new BehaviorSubject<Banner[]>([...BANNERS]);

  getBanners(): Observable<Banner[]> {
    return this.bannersSubject.asObservable();
  }

  getBannersSnapshot(): Banner[] {
    return this.bannersSubject.getValue();
  }

  addBanner(payload: Banner): void {
    this.bannersSubject.next([...this.bannersSubject.getValue(), payload]);
  }

  updateBanner(payload: Banner): void {
    const next = this.bannersSubject
      .getValue()
      .map((banner) => (banner.id === payload.id ? payload : banner));
    this.bannersSubject.next(next);
  }

  deleteBanner(id: number): void {
    const next = this.bannersSubject.getValue().filter((banner) => banner.id !== id);
    this.bannersSubject.next(next);
  }

  getNextBannerId(): number {
    const ids = this.bannersSubject.getValue().map((banner) => banner.id);
    return (Math.max(...ids, 0) || 0) + 1;
  }
}

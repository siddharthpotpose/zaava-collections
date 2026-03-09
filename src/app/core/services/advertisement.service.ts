import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ADVERTISEMENTS } from '../data/advertisements.data';
import { Advertisement } from '../models/advertisement.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';
import { apiName } from '../apis/apiName';

@Injectable({ providedIn: 'root' })
export class AdvertisementService {
  private readonly storageKey = 'zaava_advertisements';
  private readonly advertisementsSubject = new BehaviorSubject<Advertisement[]>(
    this.restoreAdvertisements()
  );

  constructor(private http : HttpClient){}


  CreateNewOffer(requestBody : any){
    return this.http.post(`${environment.apiUrl}/${apiName.CreateNewOffer}`,requestBody)
  }

  GetAllOffers(){
    return this.http.get(`${environment.apiUrl}/${apiName.GetAllOffers}`)
  }


  getAdvertisements(): Observable<Advertisement[]> {
    return this.advertisementsSubject.asObservable();
  }

  getAdvertisementsSnapshot(): Advertisement[] {
    return this.advertisementsSubject.getValue();
  }

  addAdvertisement(payload: Advertisement): void {
    const next = [...this.advertisementsSubject.getValue(), payload];
    this.advertisementsSubject.next(next);
    this.persistAdvertisements(next);
  }

  updateAdvertisement(payload: Advertisement): void {
    const next = this.advertisementsSubject
      .getValue()
      .map((advertisement) => (advertisement.id === payload.id ? payload : advertisement));
    this.advertisementsSubject.next(next);
    this.persistAdvertisements(next);
  }

  deleteAdvertisement(id: number): void {
    const next = this.advertisementsSubject
      .getValue()
      .filter((advertisement) => advertisement.id !== id);
    this.advertisementsSubject.next(next);
    this.persistAdvertisements(next);
  }

  getNextAdvertisementId(): number {
    const ids = this.advertisementsSubject.getValue().map((advertisement) => advertisement.id);
    return (Math.max(...ids, 0) || 0) + 1;
  }

  getActiveAdvertisement(referenceDate = new Date()): Advertisement | null {
    const activeAds = this.advertisementsSubject
      .getValue()
      .filter((advertisement) => this.isActiveOnDate(advertisement, referenceDate))
      .sort((a, b) => this.compareAdvertisementPriority(a, b));

    return activeAds[0] ?? null;
  }

  private restoreAdvertisements(): Advertisement[] {
    try {
      const raw = localStorage.getItem(this.storageKey);

      if (!raw) {
        return [...ADVERTISEMENTS];
      }

      const parsed = JSON.parse(raw) as Advertisement[];

      if (!Array.isArray(parsed)) {
        return [...ADVERTISEMENTS];
      }

      return parsed;
    } catch {
      return [...ADVERTISEMENTS];
    }
  }

  private persistAdvertisements(advertisements: Advertisement[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(advertisements));
    } catch {
      // Ignore storage errors to keep app functional.
    }
  }

  private isActiveOnDate(advertisement: Advertisement, referenceDate: Date): boolean {
    if (!advertisement.enabled) {
      return false;
    }

    const start = this.toLocalDateTime(advertisement.startDate, false);
    const end = this.toLocalDateTime(advertisement.endDate, true);

    if (!start || !end) {
      return false;
    }

    const time = referenceDate.getTime();
    return time >= start.getTime() && time <= end.getTime();
  }

  private compareAdvertisementPriority(a: Advertisement, b: Advertisement): number {
    const aStart = this.toLocalDateTime(a.startDate, false)?.getTime() ?? 0;
    const bStart = this.toLocalDateTime(b.startDate, false)?.getTime() ?? 0;

    if (bStart !== aStart) {
      return bStart - aStart;
    }

    const aUpdatedAt = new Date(a.updatedAt).getTime() || 0;
    const bUpdatedAt = new Date(b.updatedAt).getTime() || 0;

    if (bUpdatedAt !== aUpdatedAt) {
      return bUpdatedAt - aUpdatedAt;
    }

    return b.id - a.id;
  }

  private toLocalDateTime(value: string, endOfDay: boolean): Date | null {
    const [yearRaw, monthRaw, dayRaw] = value.split('-');
    const year = Number(yearRaw);
    const month = Number(monthRaw);
    const day = Number(dayRaw);

    if (!year || !month || !day) {
      return null;
    }

    return endOfDay
      ? new Date(year, month - 1, day, 23, 59, 59, 999)
      : new Date(year, month - 1, day, 0, 0, 0, 0);
  }
}

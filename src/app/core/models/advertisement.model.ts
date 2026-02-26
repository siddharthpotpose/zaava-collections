export type AdvertisementLayout = 'vertical' | 'horizontal';

export interface Advertisement {
  id: number;
  layout: AdvertisementLayout;
  title: string;
  subtext: string;
  image: string;
  startDate: string;
  endDate: string;
  enabled: boolean;
  updatedAt: string;
}

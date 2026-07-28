
export interface BusinessHours {
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
}

export interface AdditionalAttributes {
  [key: string]: boolean;
}

export interface Business {
  id?: number;
  name: string;
  // businessName: string;
  address: string;
  city: string;
  phone: string;
  locationLink: string;
  lat: number;
  lng: number;
  category?: string;
  additionalAttributes: AdditionalAttributes;
  hours?: BusinessHours[];

  
}
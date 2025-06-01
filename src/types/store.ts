// types/store.ts

export type Store = {
  id: string;
  user_id: string;
  name: string;
  category?: string;
  description?: string;
  package: string;
  cover_url?: string;
  subdistrict_id: string;
  latitude: number | null;
  longtitude: number | null;
  created_at: string;
};

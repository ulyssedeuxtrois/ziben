export interface EventWithCategory {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate: string | null;
  location: string;
  address: string;
  lat: number;
  lng: number;
  price: number;
  isFree: boolean;
  imageUrl: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  city: string;
  capacity: number | null;
  rsvpCount: number;
  viewCount: number;
  clickCount: number;
  submitterName: string | null;
  submitterEmail: string | null;
  createdAt: string;
  categoryId: string;
  organizerId: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
    icon: string;
  };
  organizer: {
    id: string;
    name: string | null;
  } | null;
  sourceUrl: string | null;
  boosted: boolean;
  boostedUntil: string | null;
  _count?: {
    savedBy: number;
  };
}

export interface SearchFilters {
  query?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  isFree?: boolean;
  lat?: number;
  lng?: number;
  radius?: number;
  city?: string;
  period?: "ce-soir" | "ce-week-end" | "cette-semaine";
}

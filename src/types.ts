export type Language = 'en' | 'ml' | 'hi' | 'te';

export type UserType = 'farmer' | 'buyer';

export interface User {
  id: string;
  name: string;
  phone: string;
  type: UserType;
  village: string;
  aadharNumber: string;
  rating: number;
  totalReviews: number;
}

export type ProduceStatus = 'available' | 'sold' | 'pending';

export interface ProduceItem {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerVillage: string;
  cropName: string;
  quantity: number;
  pricePerKg: number;
  negotiable: boolean;
  status: ProduceStatus;
  imageUrl: string;
  postedDate: string;
}

export interface PriceAlert {
  id: string;
  buyerId: string;
  cropName: string;
  targetPrice: number;
  createdAt: string;
  active: boolean;
  lastTriggeredListingId?: string;
  lastNotifiedAt?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  cropName?: string;
  currentPrice?: number;
  targetPrice?: number;
  produceId?: string;
  timestamp: string;
  read: boolean;
  type: 'price_alert' | 'order' | 'system';
}

export interface GovernmentPrice {
  cropName: string;
  minPrice: number;
  maxPrice: number;
  averagePrice: number;
  market: string;
  date: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  message: string;
  timestamp: string;
  type?: 'text' | 'offer';
  offerAmount?: number;
  status?: 'pending' | 'accepted' | 'rejected';
}

export type Screen =
  | 'welcome'
  | 'onboarding'
  | 'farmer-dashboard'
  | 'buyer-marketplace'
  | 'add-produce'
  | 'listing-detail'
  | 'chat'
  | 'payment-escrow'
  | 'delivery-confirmation';

export interface LivesResponse {
  status: boolean;
  items: Live[];
  oldLives: OldLive[];
  hasMore: boolean;
  total: string;
}

export interface Live {
  id: string;
  live_id: string;
  shop_id: string;
  logo_mobile: string;
  name: string;
  attachment_path: null | string;
  video_poster: string;
  animated_poster_url: null;
  poster_small_url: string;
  live_broadcast: string;
  date: string;
  selmo_pro_active: string;
  live_views: string;
  agora_token: string;
  agora_channel: string;
  auctions: string;
  is_shop_followed: boolean;
  external_id: string;
  agora_stream: boolean;
  agora_app_id: string;
}

export interface OldLive {
  id: string;
  live_id: string;
  shop_id: string;
  logo_mobile: string;
  name: string;
  attachment_path: string;
  video_poster: string;
  animated_poster_url: null;
  poster_small_url: string;
  live_broadcast: string;
  date: string;
  facebook_post_id: string;
  auctions: string;
  is_shop_followed: boolean;
  current_order: null;
  external_id: string;
  total_products: number;
  comments_total: string;
  products: Product[];
}

export interface Product {}

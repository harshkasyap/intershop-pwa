export interface CookieBannerOptions {
  updatedAt: Date | string;
  options: {
    id: 'required' | 'marketing' | 'tracking';
    required: boolean;
    messageKeyTitle: string;
    messageKeyContent: string;
    features?: string[]; // todo: bind features to ids?!?
    whitelistedCookies?: string[];
  }[];
}

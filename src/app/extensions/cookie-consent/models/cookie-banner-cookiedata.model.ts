export interface CookieBannerCookiedata {
  updatedAt: Date | string;
  enabledCookies: string[]; // ids 'required' | 'marketing' | 'tracking'
}

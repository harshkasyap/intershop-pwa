import { ImageData } from '../image/image.interface';

export interface CategoryData {
  id: string;
  name: string;
  type: string;
  hasOnlineProducts: boolean;
  hasOnlineSubCategories: boolean;
  online: string;
  description: string;
  subCategoriesCount?: number;
  subCategories?: CategoryData[];
  images?: ImageData[];
  uri?: string;
}
// shared/types/catalog.ts

export interface CatalogItem {
  id: string | number;
  title: string;
  image: string;
  description: string;
  url: string;
  tags: string[];
}

export interface CatalogCategory {
  id: string | number;
  title: string;
  image: string;
  description: string;
  url: string;
  tags: string[];
  items: CatalogItem[];
  height: 'sm' | 'md' | 'lg';
}

export interface RawItem {
  id?: string | number;
  title?: string;
  name?: string;
  label?: string;
  image?: string;
  img?: string;
  photo?: string;
  thumbnail?: string;
  description?: string;
  desc?: string;
  text?: string;
  preview?: string;
  url?: string;
  link?: string;
  href?: string;
  tags?: string[];
  keywords?: string[];
  items?: RawItem[];
  products?: RawItem[];
  children?: RawItem[];
  elements?: RawItem[];
}

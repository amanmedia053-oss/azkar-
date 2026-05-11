export interface Zikr {
  id: string;
  arabic: string;
  pashto: string;
  english: string;
  title: string;
  titleNum: string;
  cat: string;
  fav: string;
  count?: number; 
}

export interface Category {
  id: string;
  title: string;
  icon: string;
  color: string;
}

export type View = 'home' | 'list' | 'counter' | 'tasbeeh' | 'favorites' | 'settings' | 'search';
export type ListMode = 'list' | 'pager';
export type GridMode = 1 | 2 | 3;

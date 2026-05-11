/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, ReactNode, MouseEvent } from 'react';
import { 
  Sun, Moon, Bed, 
  Home, Heart, Hash, Settings, 
  ChevronLeft, Play, RotateCcw,
  CheckCircle2, Volume2, Info,
  Search, Share2, Star, X,
  Cloud, Cookie, Plane, MoonStar,
  Users, Droplets, CloudRain, Shirt,
  Waves, Activity, PawPrint, Landmark,
  LayoutGrid, BookOpen, ChevronRight,
  Shield, Mail, MessageCircle, FileText,
  HelpCircle, ExternalLink, MessageSquare,
  Globe, Smartphone, ListCheck, Palette, Facebook
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Category, Zikr, View, ListMode, GridMode } from './types';
import azkarData from './assets/data.json';

const THEME_COLORS = [
  { id: 'teal', primary: '#0d9488', 50: '#f0fdfa', 100: '#ccfbf1', 500: '#14b8a6', 700: '#0f766e' },
  { id: 'blue', primary: '#2563eb', 50: '#eff6ff', 100: '#dbeafe', 500: '#3b82f6', 700: '#1d4ed8' },
  { id: 'indigo', primary: '#4f46e5', 50: '#eef2ff', 100: '#e0e7ff', 500: '#6366f1', 700: '#4338ca' },
  { id: 'purple', primary: '#9333ea', 50: '#faf5ff', 100: '#f3e8ff', 500: '#a855f7', 700: '#7e22ce' },
  { id: 'rose', primary: '#e11d48', 50: '#fff1f2', 100: '#ffe4e6', 500: '#f43f5e', 700: '#be123c' },
  { id: 'amber', primary: '#d97706', 50: '#fffbeb', 100: '#fef3c7', 500: '#f59e0b', 700: '#b45309' },
  { id: 'emerald', primary: '#059669', 50: '#ecfdf5', 100: '#d1fae5', 500: '#10b981', 700: '#047857' },
];

const FONT_OPTIONS = [
  { id: 'noto', name: 'قیاسي فونټ (Noto)', family: '"Noto Sans Arabic", sans-serif' },
  { id: 'bahij', name: 'بهيج فونټ (Bahij)', family: 'Bahij, "Noto Sans Arabic", sans-serif' },
];

// Local storage keys
const STORAGE_KEYS = {
  FAVORITES: 'azkar_favorites',
  TASBEEH_COUNT: 'azkar_tasbeeh_total',
  SETTINGS: 'azkar_settings'
};

export default function App() {
  const [currentView, setCurrentView] = useState<View | 'splash'>('splash');
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<View[]>(['home']);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.FAVORITES) : null;
    return saved ? JSON.parse(saved) : [];
  });
  const [tasbeehCount, setTasbeehCount] = useState<number>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.TASBEEH_COUNT) : null;
    return saved ? Number(saved) : 0;
  });
  const [listMode, setListMode] = useState<ListMode>('list');
  const [gridMode, setGridMode] = useState<GridMode>(1);
  const [selectedTasbeehZikr, setSelectedTasbeehZikr] = useState<Zikr | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [infoType, setInfoType] = useState<'about' | 'privacy' | 'terms' | 'contact' | 'apps' | 'help' | null>(null);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showFontSelector, setShowFontSelector] = useState(false);
  const [appSettings, setAppSettings] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.SETTINGS) : null;
    return saved ? JSON.parse(saved) : {
      themeId: 'teal',
      fontId: 'noto',
      notifications: false
    };
  });

  // Share functionality
  // Status bar styling for Capacitor
  useEffect(() => {
    const applyTheme = async () => {
      const theme = THEME_COLORS.find(c => c.id === appSettings.themeId) || THEME_COLORS[0];
      const font = FONT_OPTIONS.find(f => f.id === appSettings.fontId) || FONT_OPTIONS[0];
      
      // Update CSS Variables
      document.documentElement.style.setProperty('--app-font', font.family);
      document.documentElement.style.setProperty('--primary-50', theme[50]);
      document.documentElement.style.setProperty('--primary-100', theme[100]);
      document.documentElement.style.setProperty('--primary-500', theme[500]);
      document.documentElement.style.setProperty('--primary-600', theme.primary);
      document.documentElement.style.setProperty('--primary-700', theme[700]);

      try {
        await StatusBar.setStyle({ style: Style.Light });
        await StatusBar.setBackgroundColor({ color: theme.primary });
      } catch (err) {
        // Fallback for web
        console.log('StatusBar not available', err);
      }
    };
    applyTheme();
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(appSettings));
  }, [appSettings.themeId, appSettings.fontId]);

  // Back button handling for Capacitor
  useEffect(() => {
    const backBtnListener = CapApp.addListener('backButton', ({ canGoBack }) => {
      if (currentView === 'splash') return;
      
      if (currentView === 'home') {
        setShowExitDialog(true);
      } else {
        handleBack();
      }
    });

    return () => {
      backBtnListener.then(l => l.remove());
    };
  }, [currentView]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'د اذکارو ټولګه',
          text: 'د اذکارو ټولګه اپليکېشن: دا غوره پښتو اذکار اپليکېشن له خپلو ملګرو سره شریک کړئ.\nټیلیګرام: https://t.me/obaidapp',
          url: 'https://t.me/obaidapp',
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      // Fallback for sharing
      const shareText = encodeURIComponent('د اذکارو ټولګه اپليکېشن: دا غوره پښتو اذکار اپليکېشن له خپلو ملګرو سره شریک کړئ.\nټیلیګرام: https://t.me/obaidapp');
      window.open(`https://t.me/share/url?url=https://t.me/obaidapp&text=${shareText}`);
    }
  };

  const toggleSetting = (key: keyof typeof appSettings) => {
    setAppSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Get 5 random azkar for the carousel
  const [featuredAzkar, setFeaturedAzkar] = useState<Zikr[]>([]);
  useEffect(() => {
    const shuffled = [...azkarData].sort(() => 0.5 - Math.random());
    setFeaturedAzkar(shuffled.slice(0, 5) as Zikr[]);
  }, []);

  // Handle splash transition
  useEffect(() => {
    if (currentView === 'splash') {
      const timer = setTimeout(() => {
        setCurrentView('home');
      }, 5000); // 5 seconds splash as requested
      return () => clearTimeout(timer);
    }
  }, [currentView]);

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
    if (window.navigator?.vibrate) window.navigator.vibrate(10);
  };

  const navigate = (view: View) => {
    setNavigationHistory(prev => [...prev, view]);
    setCurrentView(view || 'home');
    setShowResetConfirm(false);
    setInfoType(null);
    setSearchQuery('');
    // We only reset selectedCategory if we are not going to list
    if (view !== 'list') setSelectedCategory(null);
  };

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASBEEH_COUNT, tasbeehCount.toString());
  }, [tasbeehCount]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(appSettings));
  }, [appSettings]);

  const categories = useMemo(() => {
    const rawCategories = [
      {"title":"سهار","cat":"morning"},
      {"title":"ماښام","cat":"evening"},
      {"title":"شپه","cat":"night"},
      {"title":"کور","cat":"home"},
      {"title":"مړينه","cat":"decease"},
      {"title":"جومات","cat":"mosque"},
      {"title":"سفر","cat":"travel"},
      {"title":"جامې","cat":"garments"},
      {"title":"تشناب","cat":"toilet"},
      {"title":"خوراک","cat":"food"},
      {"title":"باران","cat":"rain"},
      {"title":"واده","cat":"marriage"},
      {"title":"خوب","cat":"sleep"},
      {"title":"اودس","cat":"ablutions"},
      {"title":"حيوانات","cat":"animals"},
      {"title":"ناروغي","cat":"sickness"},
      {"title":"روژه","cat":"ramadan"},
      {"title":"ماشومان","cat":"children"},
      {"title":"والدين","cat":"parents"},
      {"title":"غوسه","cat":"anger"},
      {"title":"حفګان","cat":"sadness"},
      {"title":"خوشحالي","cat":"happiness"},
      {"title":"شک","cat":"doubt"},
      {"title":"بيا راګرځيدل (توبه)","cat":"repentance"},
      {"title":"شتمني","cat":"wealth"},
      {"title":"حج او عمره","cat":"hajj"},
      {"title":"ستاينه","cat":"praising"},
      {"title":"لمونځ","cat":"prayer"},
      {"title":"ټولنه","cat":"socity"},
      {"title":"ساتنه","cat":"protection"},
      {"title":"نفس او شيطان","cat":"temptation"},
      {"title":"علم او پوهه","cat":"knowledge"}
    ];
    
    const catIcons: Record<string, string> = {
      morning: 'Sun',
      evening: 'Moon',
      sleep: 'Bed',
      night: 'MoonStar',
      home: 'Home',
      decease: 'Users',
      mosque: 'Landmark',
      travel: 'Plane',
      garments: 'Shirt',
      toilet: 'Droplets',
      food: 'Cookie',
      rain: 'CloudRain',
      marriage: 'Heart',
      ablutions: 'Waves',
      animals: 'PawPrint',
      sickness: 'Activity',
      ramadan: 'Moon',
      children: 'Users',
      parents: 'Users',
      anger: 'Activity',
      sadness: 'Cloud',
      happiness: 'Sun',
      doubt: 'Info',
      repentance: 'RotateCcw',
      wealth: 'Landmark',
      hajj: 'Landmark',
      praising: 'Star',
      prayer: 'Landmark',
      socity: 'Users',
      protection: 'Shield',
      temptation: 'MoonStar',
      knowledge: 'BookOpen'
    };

    const catColors: Record<string, string> = {
      morning: 'bg-amber-50 text-amber-600',
      evening: 'bg-indigo-50 text-indigo-600',
      sleep: 'bg-slate-50 text-slate-600',
      night: 'bg-blue-50 text-blue-800',
      home: 'bg-emerald-50 text-emerald-600',
      decease: 'bg-gray-50 text-gray-600',
      mosque: 'bg-cyan-50 text-cyan-600',
      travel: 'bg-blue-50 text-blue-600',
      garments: 'bg-purple-50 text-purple-600',
      toilet: 'bg-teal-50 text-teal-600',
      food: 'bg-orange-50 text-orange-600',
      rain: 'bg-sky-50 text-sky-600',
      marriage: 'bg-pink-50 text-pink-600',
      ablutions: 'bg-blue-50 text-blue-500',
      animals: 'bg-lime-50 text-lime-700',
      sickness: 'bg-rose-50 text-rose-600',
      ramadan: 'bg-amber-50 text-amber-700',
      children: 'bg-sky-50 text-sky-600',
      parents: 'bg-indigo-50 text-indigo-500',
      anger: 'bg-red-50 text-red-600',
      sadness: 'bg-slate-100 text-slate-500',
      happiness: 'bg-yellow-50 text-yellow-500',
      doubt: 'bg-gray-50 text-gray-500',
      repentance: 'bg-emerald-50 text-emerald-500',
      wealth: 'bg-green-50 text-green-600',
      hajj: 'bg-neutral-100 text-neutral-600',
      praising: 'bg-violet-50 text-violet-500',
      prayer: 'bg-teal-50 text-teal-600',
      socity: 'bg-stone-50 text-stone-600',
      protection: 'bg-blue-50 text-blue-700',
      temptation: 'bg-gray-100 text-gray-700',
      knowledge: 'bg-cyan-50 text-cyan-700'
    };

    return rawCategories.map(cat => ({
      id: cat.cat,
      title: cat.title,
      icon: catIcons[cat.cat] || 'MoonStar',
      color: catColors[cat.cat] || 'bg-slate-50 text-slate-600'
    }));
  }, []);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setCurrentView('list');
    setShowResetConfirm(false);
    setInfoType(null);
    setSearchQuery('');
  };

  const filteredAzkar = useMemo(() => {
    let list = azkarData as Zikr[];
    if (selectedCategory && currentView === 'list') {
      list = list.filter(a => a.cat === selectedCategory.id);
    }
    if (currentView === 'favorites') {
      list = list.filter(a => favorites.includes(a.id));
    }
    if (searchQuery) {
      list = list.filter(a => 
        a.pashto.includes(searchQuery) || 
        a.arabic.includes(searchQuery)
      );
    }
    return list;
  }, [selectedCategory, currentView, favorites, searchQuery]);

  const handleBack = () => {
    if (currentView === 'list' || currentView === 'tasbeeh' || currentView === 'favorites' || currentView === 'settings' || currentView === 'search') {
      setCurrentView('home');
      setSelectedCategory(null);
      if (currentView === 'search') setSearchQuery('');
    }
  };

  if (currentView === 'splash') {
    return (
      <div className="flex flex-col h-screen max-w-md mx-auto bg-primary-600 items-center justify-center text-white font-arabic p-8 text-center relative overflow-hidden" dir="rtl">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10"
        >
          <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center mb-8 mx-auto border border-white/30 shadow-2xl">
            <MoonStar className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-black mb-3 tracking-tight">د اذکارو ټولګه</h1>
          <p className="text-primary-100 text-lg opacity-80 font-medium">ستاسو د روح سکون</p>
        </motion.div>
        
        {/* Background shapes */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/5 rounded-full -mr-48 -mb-48 blur-3xl"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-50 shadow-2xl relative overflow-hidden font-arabic" dir="rtl">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md px-6 pt-[calc(1rem+env(safe-area-inset-top))] pb-4 flex items-center justify-between shadow-sm sticky top-0 z-10 transition-colors">
        <div className="flex items-center gap-3">
          {currentView !== 'home' ? (
            <button 
              onClick={handleBack}
              className="p-2 -mr-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 ml-1" />
            </button>
          ) : (
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-600/20">
              <MoonStar className="w-6 h-6" />
            </div>
          )}
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-none mb-1">
              {currentView === 'home' && "د اذکارو ټولګه"}
              {currentView === 'list' && selectedCategory?.title}
              {currentView === 'favorites' && "غوره شوي اذکار"}
              {currentView === 'tasbeeh' && "تسبېح کاونټر"}
              {currentView === 'search' && "لټون"}
              {currentView === 'settings' && "ترتیبات"}
            </h1>
            {currentView === 'home' && (
              <p className="text-[10px] text-slate-400 font-medium tracking-tight">خپله ورځ په اذکارو پیل کړئ</p>
            )}
          </div>
        </div>
        
        {currentView === 'home' ? (
          <div className="flex gap-2 items-center">
            <button 
              onClick={() => setCurrentView('search')}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-600"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        ) : (currentView === 'list' || currentView === 'favorites') ? (
          <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner border border-slate-50">
            <button 
              onClick={() => setListMode('list')}
              className={`p-2 rounded-lg transition-all ${listMode === 'list' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setListMode('pager')}
              className={`p-2 rounded-lg transition-all ${listMode === 'pager' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400'}`}
            >
              <BookOpen className="w-4 h-4" />
            </button>
          </div>
        ) : null}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-6 px-5 pt-5 scroll-smooth">
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Featured Carousel */}
              <FeaturedCarousel 
                items={featuredAzkar} 
                onSelect={(zikr) => {
                  const cat = categories.find(c => c.id === zikr.cat);
                  if (cat) {
                    setSelectedCategory(cat as Category);
                    setCurrentView('list');
                  }
                }}
              />

              {/* Categories Grid */}
              <section>
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="text-md font-bold text-slate-800">د اذکارو ډلبندي</h3>
                  
                  <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-50">
                    <button 
                      onClick={() => setGridMode(1)}
                      className={`p-1.5 rounded-md transition-all ${gridMode === 1 ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400 opacity-60'}`}
                      title="یو کالم"
                    >
                      <div className="w-3.5 h-3.5 border-2 border-current rounded-sm" />
                    </button>
                    <button 
                      onClick={() => setGridMode(2)}
                      className={`p-1.5 rounded-md transition-all ${gridMode === 2 ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400 opacity-60'}`}
                      title="دوه کالمونه"
                    >
                      <div className="grid grid-cols-2 gap-0.5">
                         <div className="w-1.5 h-1.5 border border-current rounded-[1px]" />
                         <div className="w-1.5 h-1.5 border border-current rounded-[1px]" />
                         <div className="w-1.5 h-1.5 border border-current rounded-[1px]" />
                         <div className="w-1.5 h-1.5 border border-current rounded-[1px]" />
                      </div>
                    </button>
                    <button 
                      onClick={() => setGridMode(3)}
                      className={`p-1.5 rounded-md transition-all ${gridMode === 3 ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400 opacity-60'}`}
                      title="درې کالمونه"
                    >
                      <div className="grid grid-cols-3 gap-0.5">
                         {[...Array(6)].map((_, i) => (
                           <div key={i} className="w-1 h-1 border border-current rounded-[1px]" />
                         ))}
                      </div>
                    </button>
                  </div>
                </div>
                <motion.div 
                  layout
                  className={`grid gap-3.5 transition-all duration-500 ease-in-out ${
                    gridMode === 1 ? 'grid-cols-1' : gridMode === 2 ? 'grid-cols-2' : 'grid-cols-3'
                  }`}
                >
                  {categories.map((cat) => (
                    <CategoryCard 
                      key={`cat-${cat.id}`} 
                      category={cat as Category} 
                      onClick={() => handleCategorySelect(cat as Category)} 
                      mode={gridMode}
                    />
                  ))}
                </motion.div>
              </section>

              {/* Tasbeeh Quick Card */}
              <section 
                onClick={() => setCurrentView('tasbeeh')}
                className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-primary-50 p-3 rounded-2xl text-primary-600">
                    <Hash className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">تسبېح کاونټر</h4>
                    <p className="text-[10px] text-slate-500 font-medium">ټول تعدا: {tasbeehCount}</p>
                  </div>
                </div>
                <div className="bg-primary-500 text-white p-2 rounded-xl">
                  <Play className="w-5 h-5 fill-current" />
                </div>
              </section>
            </motion.div>
          )}

          {(currentView === 'list' || currentView === 'favorites') && (
            <motion.div 
              key="list-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col"
            >
              {listMode === 'list' ? (
                <motion.div 
                  className="space-y-4"
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1
                      }
                    }
                  }}
                  initial="hidden"
                  animate="show"
                >
                  {filteredAzkar.length > 0 ? (
                    filteredAzkar.map((zikr, idx) => (
                      <ZikrCard 
                        key={`list-${zikr.id}-${idx}`} 
                        zikr={zikr as Zikr} 
                        isFavorite={favorites.includes(zikr.id)}
                        onToggleFavorite={() => toggleFavorite(zikr.id)}
                        index={idx}
                      />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-4">
                      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                        <Star className="w-10 h-10 opacity-20" />
                      </div>
                      <p className="font-medium">هیڅ مو نه دي موندلي</p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <PagerView 
                  azkar={filteredAzkar} 
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                />
              )}
            </motion.div>
          )}

          {currentView === 'tasbeeh' && (
            <motion.div key="tasbeeh" className="flex-1">
              <TasbeehView 
                totalCount={tasbeehCount} 
                selectedZikr={selectedTasbeehZikr}
                azkar={azkarData as Zikr[]}
                onSelectZikr={(z) => setSelectedTasbeehZikr(z)}
                onIncrement={() => {
                  setTasbeehCount(prev => prev + 1);
                }}
                onReset={() => setShowResetConfirm(true)}
              />
            </motion.div>
          )}

          {/* Reset Confirmation Modal */}
          <AnimatePresence>
            {showResetConfirm && (
              <motion.div 
                key="reset-modal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm"
                onClick={() => setShowResetConfirm(false)}
              >
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="bg-white w-full max-w-xs rounded-[2.5rem] p-8 shadow-2xl relative text-center"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <RotateCcw className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-2">ډاډمن یاست؟</h3>
                  <p className="text-slate-500 text-sm mb-8 leading-relaxed px-2">
                    ایا واقعا غواړئ چې خپل اوسنی حساب صفر کړئ؟ دا عمل بیرته نشي ګرځول کیدای.
                  </p>
                  <div className="space-y-3">
                    <button 
                      onClick={() => {
                        setTasbeehCount(0);
                        setShowResetConfirm(false);
                      }}
                      className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-500/20 transition-all active:scale-95"
                    >
                      هو، صفر یې کړئ
                    </button>
                    <button 
                      onClick={() => setShowResetConfirm(false)}
                      className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold transition-all"
                    >
                      لغوه کول
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {currentView === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-100 flex items-center gap-2">
                <div className="p-3 text-slate-400">
                  <Search className="w-5 h-5" />
                </div>
                <input 
                  autoFocus
                  type="text"
                  placeholder="دلته لټون وکړئ..."
                  className="flex-1 bg-transparent border-none outline-none font-bold text-sm text-slate-700 p-2"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="p-3 text-slate-300 hover:text-slate-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {searchQuery ? (
                  filteredAzkar.length > 0 ? (
                    filteredAzkar.map((zikr, idx) => (
                      <ZikrCard 
                        key={`search-${zikr.id}-${idx}`} 
                        zikr={zikr as Zikr} 
                        isFavorite={favorites.includes(zikr.id)}
                        onToggleFavorite={() => toggleFavorite(zikr.id)}
                        index={idx}
                        highlight={searchQuery}
                      />
                    ))
                  ) : (
                    <div className="bg-white rounded-[2rem] p-12 text-center border border-dashed border-slate-200">
                      <Search className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                      <p className="text-slate-400 text-sm font-medium">هیڅ نتيجه ونه موندل شوه</p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-400 text-sm font-medium">تاسو کولی شئ په پښتو یا عربي ژبه لټون وکړئ</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {currentView === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 pb-20"
            >
              {/* Settings Section */}
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
                <SettingsItem 
                  icon={<Palette className="w-5 h-5 text-slate-500" />} 
                  title="د اپليکېشن رنګ" 
                  onClick={() => setShowThemeSelector(true)}
                />
                <SettingsItem 
                  last
                  icon={<Hash className="w-5 h-5 text-slate-500" />} 
                  title="د فونټ انتخاب" 
                  onClick={() => setShowFontSelector(true)}
                />
              </div>

              {/* Action Section */}
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
                <SettingsItem 
                  icon={<Info className="w-5 h-5 text-slate-500" />} 
                  title="زموږ په اړه" 
                  onClick={() => setInfoType('about')}
                />
                <SettingsItem 
                  icon={<Shield className="w-5 h-5 text-slate-500" />} 
                  title="د محرمیت تګلاره" 
                  onClick={() => setInfoType('privacy')}
                />
                <SettingsItem 
                  icon={<FileText className="w-5 h-5 text-slate-500" />} 
                  title="د استعمال شرطونه" 
                  onClick={() => setInfoType('terms')}
                />
                <SettingsItem 
                  icon={<Mail className="w-5 h-5 text-slate-500" />} 
                  title="اړيکه له موږ سره" 
                  onClick={() => setInfoType('contact')}
                />
                <SettingsItem 
                  last
                  icon={<HelpCircle className="w-5 h-5 text-slate-500" />} 
                  title="مرسته" 
                  onClick={() => setInfoType('help')}
                />
              </div>

              {/* Extra Section */}
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
                <SettingsItem 
                  icon={<Share2 className="w-5 h-5 text-slate-500" />} 
                  title="د اپليکېشن شريکول" 
                  onClick={handleShare}
                />
                <SettingsItem 
                  last
                  icon={<Smartphone className="w-5 h-5 text-slate-500" />} 
                  title="زموږ نور اپليکېشنونه" 
                  onClick={() => setInfoType('apps')}
                />
              </div>
              
              <div className="flex flex-col items-center justify-center pt-8 pb-4 opacity-40">
                <div className="w-12 h-12 bg-slate-200 rounded-2xl mb-3 flex items-center justify-center">
                   <Home className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-xs font-black text-slate-800 uppercase tracking-wider">د اذکارو ټولګه</p>
                <p className="text-[10px] font-bold text-slate-500">ورژن 1.0.0</p>
                <p className="text-[9px] text-slate-400 font-bold mt-4">ټول حقوق د اسلامي کاريالونو څانګې سره خوندي دي</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Info Modals */}
      <AnimatePresence>
        {infoType && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md"
            onClick={() => setInfoType(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden max-h-[80vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-primary-600/20 text-white">
                    {infoType === 'about' && <Info className="w-8 h-8" />}
                    {infoType === 'privacy' && <Shield className="w-8 h-8" />}
                    {infoType === 'terms' && <FileText className="w-8 h-8" />}
                    {infoType === 'contact' && <Mail className="w-8 h-8" />}
                    {infoType === 'apps' && <Smartphone className="w-8 h-8" />}
                    {infoType === 'help' && <HelpCircle className="w-8 h-8" />}
                  </div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">
                    {infoType === 'about' && "زموږ په اړه"}
                    {infoType === 'privacy' && "د محرمیت تګلاره"}
                    {infoType === 'terms' && "د استعمال شرطونه"}
                    {infoType === 'contact' && "اړيکه له موږ سره"}
                    {infoType === 'apps' && "زموږ نور اپليکېشنونه"}
                    {infoType === 'help' && "مرسته"}
                  </h3>
                </div>

                <div className="text-slate-600 text-sm leading-relaxed dir-rtl text-justify px-2">
                  {infoType === 'about' && (
                    <div className="space-y-4">
                      <p>د اذکارو ټولګه یو عصري پښتو اپليکېشن دی چې هدف یې د مسلمانانو لپاره د ورځني اذکارو اسانه کول دي.</p>
                      <div className="grid grid-cols-1 gap-3 text-center">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <p className="text-[10px] text-primary-600 font-bold uppercase tracking-widest mb-1 opacity-70">جوړونکی</p>
                          <p className="font-bold text-slate-800">عبيدالله غفاري</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <p className="text-[10px] text-primary-600 font-bold uppercase tracking-widest mb-1 opacity-70">ترتيب کوونکی</p>
                          <p className="font-bold text-slate-800 text-sm">الحاج ډاکټر فريدون احرار صيب</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {infoType === 'privacy' && (
                    <div className="space-y-3">
                      <p>ستاسو محرمیت زموږ لپاره خورا مهم دی.</p>
                      <ul className="list-disc pr-5 space-y-2">
                        <li>دا اپليکېشن کوم شخصي معلومات نه راټولوي.</li>
                        <li>ستاسو غوره شوي اذکار یوازې ستاسو په موبایل کې خوندي کیږي.</li>
                        <li>موږ د دریمې ډلې سره هیڅ معلومات نه شریکوو.</li>
                      </ul>
                    </div>
                  )}

                  {infoType === 'terms' && (
                    <div className="space-y-3">
                      <p>د دې اپليکېشن کارول لاندې شرطونو ته غاړه ایښودل دي:</p>
                      <ul className="list-disc pr-5 space-y-2">
                        <li>اپليکېشن باید یوازې د شرعي اهدافو لپاره وکارول شي.</li>
                        <li>د ډیټا بیا تولید یا پلور اجازه نشته.</li>
                        <li>موږ هڅه کوو چې معلومات دقیق وي، مګر د تېروتنو مسؤلیت نه اخلو.</li>
                      </ul>
                    </div>
                  )}

                  {infoType === 'contact' && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                           <div className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                           <span className="font-black text-slate-800">عبيدالله غفاري</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          <a href="https://www.facebook.com/obaidullah.ghafari.18" target="_blank" className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-primary-50 transition-colors group">
                             <div className="flex items-center gap-3">
                               <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600"><Facebook className="w-4 h-4" /></div>
                               <span className="font-bold text-xs">فیسبوک</span>
                             </div>
                             <ChevronLeft className="w-4 h-4 text-slate-300 group-hover:text-primary-400" />
                          </a>
                          <a href="https://t.me/obaidkhanghafari" target="_blank" className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-primary-50 transition-colors group">
                             <div className="flex items-center gap-3">
                               <div className="p-2 bg-white rounded-lg shadow-sm text-sky-500"><MessageCircle className="w-4 h-4" /></div>
                               <span className="font-bold text-xs">ټیلیګرام</span>
                             </div>
                             <ChevronLeft className="w-4 h-4 text-slate-300 group-hover:text-primary-400" />
                          </a>
                          <a href="https://wa.me/93779705897" target="_blank" className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-primary-50 transition-colors group">
                             <div className="flex items-center gap-3">
                               <div className="p-2 bg-white rounded-lg shadow-sm text-green-500"><Smartphone className="w-4 h-4" /></div>
                               <span className="font-bold text-xs">واټساپ</span>
                             </div>
                             <ChevronLeft className="w-4 h-4 text-slate-300 group-hover:text-primary-400" />
                          </a>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                           <div className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                           <span className="font-black text-slate-800">الحاج ډاکټر فريدون احرار صيب</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          <a href="https://t.me/ahrar2022" target="_blank" className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-primary-50 transition-colors group">
                             <div className="flex items-center gap-3">
                               <div className="p-2 bg-white rounded-lg shadow-sm text-sky-500"><MessageCircle className="w-4 h-4" /></div>
                               <span className="font-bold text-xs">ټیلیګرام</span>
                             </div>
                             <ChevronLeft className="w-4 h-4 text-slate-300 group-hover:text-primary-400" />
                          </a>
                          <a href="https://wa.me/93771499729" target="_blank" className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-primary-50 transition-colors group">
                             <div className="flex items-center gap-3">
                               <div className="p-2 bg-white rounded-lg shadow-sm text-green-500"><Smartphone className="w-4 h-4" /></div>
                               <span className="font-bold text-xs">واټساپ</span>
                             </div>
                             <ChevronLeft className="w-4 h-4 text-slate-300 group-hover:text-primary-400" />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {infoType === 'apps' && (
                    <div className="text-center space-y-4">
                      <p>تاسو کولی شئ د اسلامي کاريالونو له څانګې څخه نور ګټور اپليکېشنونه ډاونلوډ کړئ.</p>
                      <div className="p-6 bg-primary-50 rounded-3xl border border-primary-100">
                         <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm text-primary-600">
                            <MessageSquare className="w-6 h-6" />
                         </div>
                         <p className="font-bold text-slate-800 text-sm mb-4">د ټیلیګرام چینل</p>
                         <a 
                          href="https://t.me/obaidapp" 
                          target="_blank"
                          className="inline-block py-3 px-8 bg-primary-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-primary-500/30 active:scale-95 transition-all"
                         >
                           لینک ته ننوتل
                         </a>
                      </div>
                    </div>
                  )}

                  {infoType === 'help' && (
                    <div className="space-y-4">
                      <p>کله چې تسبېح وهئ، تاسو کولی شئ په ډیسپلی باندې په هر ځای کې کلیک وکړئ ترڅو حساب زیات شي.</p>
                      <p>د اذکارو د لیدلو لپاره دوه ډوله سټایلونه شتون لري: لیست او پاڼې.</p>
                      <p>د پاڼو په حالت کې تاسو کولی شئ په سکرین باندې کش (Swipe) کړئ ترڅو بل ذکر ته لاړ شئ.</p>
                    </div>
                  )}
                </div>
              </div>
              
              <button 
                onClick={() => setInfoType(null)}
                className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold transition-all mt-6 shrink-0"
              >
                بند کړئ
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Theme Selector Modal (Top Sheet) */}
      <AnimatePresence>
        {showThemeSelector && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-start justify-center bg-slate-900/60 backdrop-blur-md"
            onClick={() => setShowThemeSelector(false)}
          >
            <motion.div 
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className="bg-white w-full rounded-b-[2.5rem] p-8 shadow-2xl relative pt-[calc(2rem+env(safe-area-inset-top))] border-b border-slate-100 transition-colors"
              onClick={e => e.stopPropagation()}
            >
              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-xl font-black text-slate-800 tracking-tight">د اپليکېشن رنګ انتخاب کړئ</h3>
                   <button 
                    onClick={() => setShowThemeSelector(false)}
                    className="p-2 bg-slate-100 rounded-full text-slate-400"
                   >
                     <X className="w-5 h-5" />
                   </button>
                </div>
                
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-4">
                  {THEME_COLORS.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => {
                        setAppSettings(prev => ({ ...prev, themeId: color.id }));
                      }}
                      className={`group flex flex-col items-center gap-2 transition-all p-1.5 rounded-2xl ${appSettings.themeId === color.id ? 'bg-slate-50 ring-2 ring-primary-500 ring-offset-2' : ''}`}
                    >
                      <div 
                        className="w-10 h-10 rounded-xl shadow-inner shadow-black/10 group-active:scale-90 transition-transform"
                        style={{ backgroundColor: color.primary }}
                      />
                      <span className={`text-[10px] font-bold ${appSettings.themeId === color.id ? 'text-primary-600' : 'text-slate-400'}`}>
                        {color.id === 'teal' ? 'شین' : 
                         color.id === 'blue' ? 'نیلي' : 
                         color.id === 'indigo' ? 'لاجوردي' : 
                         color.id === 'purple' ? 'ارغواني' : 
                         color.id === 'rose' ? 'ګلابي' : 
                         color.id === 'amber' ? 'ژیړ' : 'شنه'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

           <AnimatePresence>
        {showFontSelector && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-start justify-center"
            onClick={() => setShowFontSelector(false)}
          >
            <motion.div 
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className="bg-white w-full rounded-b-[2.5rem] p-8 shadow-2xl relative pt-[calc(2rem+env(safe-area-inset-top))] border-b border-slate-100 transition-colors"
              onClick={e => e.stopPropagation()}
            >
              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-xl font-black text-slate-800 tracking-tight">د اپليکېشن فونټ انتخاب کړئ</h3>
                   <button 
                    onClick={() => setShowFontSelector(false)}
                    className="p-2 bg-slate-100 rounded-full text-slate-400"
                   >
                     <X className="w-5 h-5" />
                   </button>
                </div>
                
                <div className="space-y-3">
                  {FONT_OPTIONS.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => {
                        setAppSettings(prev => ({ ...prev, fontId: font.id }));
                      }}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${appSettings.fontId === font.id ? 'bg-primary-50 border-2 border-primary-500' : 'bg-slate-50 border-2 border-transparent'}`}
                    >
                      <div className="flex flex-col items-start gap-1">
                        <span className={`font-bold ${appSettings.fontId === font.id ? 'text-primary-700' : 'text-slate-700'}`}>
                          {font.name}
                        </span>
                        <span className="text-xs text-slate-400 opacity-70" style={{ fontFamily: font.family }}>
                          بسم الله الرحمن الرحيم
                        </span>
                      </div>
                      {appSettings.fontId === font.id && (
                        <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit Confirmation Dialog */}
      <AnimatePresence>
        {showExitDialog && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md"
            onClick={() => setShowExitDialog(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-xs rounded-[2.5rem] p-8 shadow-2xl relative text-center border border-slate-100"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <X className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">له اپليکېشن څخه وتل</h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed px-2">
                ایا تاسو واقعا غواړئ چې له اپليکېشن څخه بهر شئ؟
              </p>
              <div className="space-y-3">
                <button 
                  onClick={() => CapApp.exitApp()}
                  className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold shadow-lg shadow-primary-500/20 transition-all active:scale-95"
                >
                  هو، وځم
                </button>
                <button 
                  onClick={() => setShowExitDialog(false)}
                  className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold transition-all"
                >
                  نه، پاتې کېږم
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Nav */}
      <nav className="bg-white border-t border-slate-100 flex items-center justify-around pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 px-4 sticky bottom-0 left-0 right-0 z-[100] h-auto shrink-0 transition-colors">
        <NavButton 
          active={currentView === 'home'} 
          onClick={() => navigate('home')} 
          icon={<Home className="w-6 h-6" />} 
          label="کور" 
        />
        <NavButton 
          active={currentView === 'tasbeeh'} 
          onClick={() => navigate('tasbeeh')} 
          icon={<Hash className="w-6 h-6" />} 
          label="تسبېح" 
        />
        <NavButton 
          active={currentView === 'favorites'} 
          onClick={() => navigate('favorites')} 
          icon={<Heart className="w-6 h-6" />} 
          label="خوښ شوي" 
        />
        <NavButton 
          active={currentView === 'settings'} 
          onClick={() => navigate('settings')} 
          icon={<Settings className="w-6 h-6" />} 
          label="ترتیبات" 
        />
      </nav>
    </div>
  );
}

function FeaturedCarousel({ items, onSelect }: { items: Zikr[]; onSelect: (z: Zikr) => void }) {
  const [index, setIndex] = useState(0);
  const colors = [
    'from-emerald-500 to-teal-600',
    'from-blue-600 to-indigo-700',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-violet-600 to-purple-700'
  ];

  const animations = [
    { initial: { x: 300, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: -300, opacity: 0 } },
    { initial: { y: 100, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: -100, opacity: 0 } },
    { initial: { scale: 0.8, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 1.2, opacity: 0 } },
    { initial: { rotate: 5, opacity: 0 }, animate: { rotate: 0, opacity: 1 }, exit: { rotate: -5, opacity: 0 } }
  ];

  const [animIndex, setAnimIndex] = useState(0);

  useEffect(() => {
    if (items.length === 0) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
      setAnimIndex((prev) => (prev + 1) % animations.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (items.length === 0) return null;

  const current = items[index];
  const currentAnim = animations[animIndex];

  return (
    <div className="relative h-48 sm:h-56 w-full mb-8 overflow-hidden rounded-[2.5rem] shadow-xl shadow-slate-200/50">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={currentAnim.initial}
          animate={currentAnim.animate}
          exit={currentAnim.exit}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          className={`absolute inset-0 bg-gradient-to-br ${colors[index % colors.length]} p-8 flex flex-col justify-center text-white cursor-pointer`}
          onClick={() => onSelect(current)}
        >
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <MoonStar className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider mb-3">
              د ورځي غوره ذکر
            </span>
            <h3 className="text-lg sm:text-xl font-bold arabic-text leading-relaxed line-clamp-2" dir="rtl">
              {current.arabic}
            </h3>
            <p className="text-white/70 text-xs mt-3 line-clamp-1 font-medium italic opacity-80">
              {current.pashto}
            </p>
          </div>
          
          {/* Progress Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {items.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all duration-500 ${i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/30'}`} 
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function HighlightText({ text, term }: { text: string; term: string }) {
  if (!term.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${term})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === term.toLowerCase() ? (
          <span key={`match-${i}`} className="bg-primary-100 text-primary-700 rounded-sm px-0.5">{part}</span>
        ) : (
          <span key={`text-${i}`}>{part}</span>
        )
      )}
    </>
  );
}

function CategoryCard({ category, onClick, mode = 1 }: { category: Category; onClick: () => void; mode?: GridMode; key?: React.Key }) {
  const icons: Record<string, any> = { 
    Sun, Moon, Bed, Landmark, Cloud, Heart, Cookie, Plane, Home, Users, Shirt, Droplets, CloudRain, Waves, PawPrint, Activity, MoonStar, Shield, RotateCcw, Star, Info, BookOpen
  };
  const Icon = icons[category.icon] || MoonStar;
  
  return (
    <motion.button 
      layout
      onClick={onClick}
      className={`w-full ${mode === 1 ? 'p-4 flex-row justify-between' : 'p-5 flex-col items-center justify-center text-center'} rounded-3xl flex transition-all active:scale-[0.98] shadow-sm hover:shadow-md ${category.color} group relative overflow-hidden border border-white/20`}
      dir="rtl"
    >
      <div className={`flex ${mode === 1 ? 'flex-row items-center gap-4' : 'flex-col items-center gap-3'} relative z-10 w-full`}>
        <div className={`${mode === 3 ? 'p-2.5' : 'p-3.5'} bg-white/90 backdrop-blur-sm shadow-sm rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`${mode === 1 ? 'w-6 h-6' : mode === 3 ? 'w-5 h-5' : 'w-7 h-7'}`} />
        </div>
        <div className={`flex flex-col ${mode === 1 ? 'items-start translate-y-0.5' : 'items-center'} w-full overflow-hidden`}>
          <span className={`${mode === 1 ? 'text-base' : mode === 3 ? 'text-xs' : 'text-sm'} font-bold tracking-tight text-slate-800 line-clamp-1`}>
            {category.title}
          </span>
          {mode === 1 && (
            <span className="text-[10px] text-slate-500 font-medium mt-0.5">اذکارو کتلو لپاره کلیک وکړئ</span>
          )}
        </div>
      </div>
      
      {mode === 1 && (
        <div className="relative z-10 w-8 h-8 flex items-center justify-center bg-white/40 backdrop-blur-sm rounded-full group-hover:translate-x-1 transition-transform">
          <ChevronLeft className="w-4 h-4 text-slate-600" />
        </div>
      )}

      {/* Decorative Background Icon */}
      <div className={`absolute ${mode === 1 ? '-right-6 -bottom-6' : '-right-4 -bottom-4'} opacity-[0.05] group-hover:scale-125 group-hover:-rotate-12 transition-all duration-700 pointer-events-none`}>
        <Icon className={`${mode === 1 ? 'w-24 h-24' : 'w-16 h-16'} text-slate-900`} />
      </div>
    </motion.button>
  );
}

function ZikrCard({ zikr, isFavorite, onToggleFavorite, index, highlight }: { 
  zikr: Zikr; 
  isFavorite: boolean; 
  onToggleFavorite: () => void;
  index: number;
  highlight?: string;
  key?: React.Key;
}) {
  const [showEnglish, setShowEnglish] = useState(false);

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1 }
  };

  return (
    <motion.div
      variants={cardVariants}
      className={`bg-white rounded-3xl p-6 shadow-sm border border-slate-100 transition-all duration-300 relative select-none`}
    >
      <div className="flex justify-between items-start mb-5">
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          className={`p-2 rounded-xl transition-all ${isFavorite ? 'text-red-500 bg-red-50 scale-110' : 'text-slate-300 hover:text-slate-400'}`}
        >
          <Star className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
        {zikr.title && (
          <div className="bg-primary-50 text-primary-600 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-tight">
             {zikr.title}
          </div>
        )}
      </div>
      
      <p className="arabic-text text-xl sm:text-2xl text-slate-800 mb-5 leading-relaxed font-bold text-center" dir="rtl">
        <HighlightText text={zikr.arabic} term={highlight || ''} />
      </p>
      
      <p className="text-slate-500 text-sm leading-relaxed mb-4 text-center font-medium opacity-80">
        <HighlightText text={zikr.pashto} term={highlight || ''} />
      </p>

      {zikr.english && (
        <div className="mt-4 pt-4 border-t border-slate-50 text-center">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowEnglish(!showEnglish); }}
            className="text-[10px] text-primary-500 font-bold uppercase tracking-wider mb-2"
          >
            {showEnglish ? 'انګليسي ژباړه پټه کړئ' : 'انګليسي ژباړه وګورئ'}
          </button>
          <AnimatePresence>
            {showEnglish && (
              <motion.p 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="text-slate-400 text-xs italic leading-relaxed overflow-hidden" dir="ltr"
              >
                {zikr.english}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

function TasbeehView({ 
  totalCount, 
  onIncrement, 
  onReset,
  selectedZikr,
  azkar,
  onSelectZikr
}: { 
  totalCount: number; 
  onIncrement: () => void; 
  onReset: () => void;
  selectedZikr: Zikr | null;
  azkar: Zikr[];
  onSelectZikr: (z: Zikr) => void;
}) {
  const [showSelector, setShowSelector] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] py-8"
    >
      {/* Selected Zikr Info */}
      <motion.div 
        onClick={() => setShowSelector(true)}
        className="mb-8 w-full cursor-pointer group"
      >
        <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all active:scale-[0.98] text-center">
          <p className="text-[10px] text-primary-600 font-black uppercase tracking-widest mb-2">د تسبېح لپاره ذکر</p>
          <h3 className="text-lg font-bold text-slate-800 arabic-text">
            {selectedZikr ? selectedZikr.arabic : 'یو ذکر انتخاب کړئ...'}
          </h3>
          {selectedZikr && (
            <p className="text-xs text-slate-400 mt-2 line-clamp-1">{selectedZikr.pashto}</p>
          )}
        </div>
      </motion.div>

      {/* Main Counter Circle */}
      <div className="relative group">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-[conic-gradient(from_0deg,var(--color-primary-500),#6366f1,var(--color-primary-500))] rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"
        />
        
        <button
          onClick={onIncrement}
          className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center p-8 transition-all active:scale-90 border-4 border-slate-50 overflow-hidden"
        >
          {/* Animated background pulse */}
          <motion.div 
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute inset-0 bg-primary-50 rounded-full"
          />

          <div className="relative z-10 text-6xl sm:text-7xl font-black text-slate-800 mb-1 tracking-tighter">
            {totalCount}
          </div>
          <div className="relative z-10 text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">ټول حساب</div>
          
          <div className="absolute inset-2 rounded-full border border-slate-100" />
          <div className="absolute inset-6 rounded-full border border-slate-50" />
        </button>
      </div>

      <div className="mt-12 flex gap-4 w-full px-2">
        <button
          onClick={onReset}
          className="flex-1 py-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-center gap-2 text-slate-500 font-bold hover:bg-slate-50 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          بیا پیل
        </button>
        <button
          onClick={() => setShowSelector(true)}
          className="flex-1 py-4 bg-primary-600 rounded-2xl flex items-center justify-center gap-2 text-white font-bold shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-colors"
        >
          <Hash className="w-5 h-5" />
          ذکر انتخاب کړئ
        </button>
      </div>

      {/* Zikr Selector Modal */}
      <AnimatePresence>
        {showSelector && (
          <motion.div 
            key="zikr-selector-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowSelector(false)}
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden h-[80vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-slate-800">ذکر انتخاب کړئ</h2>
                <button 
                  onClick={() => setShowSelector(false)}
                  className="p-3 bg-slate-100 rounded-full text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 space-y-3 px-2 scrollbar-hide py-2">
                {azkar.map((z) => (
                  <motion.div 
                    key={`select-${z.id}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onSelectZikr(z);
                      setShowSelector(false);
                    }}
                    className={`p-5 rounded-[1.5rem] text-right cursor-pointer transition-all border-2 relative overflow-hidden ${
                      selectedZikr?.id === z.id 
                        ? 'bg-primary-50 border-primary-500 shadow-md shadow-primary-100' 
                        : 'bg-slate-50 border-transparent hover:border-slate-200'
                    }`}
                  >
                    {selectedZikr?.id === z.id && (
                      <div className="absolute top-0 right-0 w-8 h-8 bg-primary-500 rounded-bl-2xl flex items-center justify-center text-white">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                    <p className="text-sm font-bold text-slate-800 arabic-text pr-2" dir="rtl">{z.arabic}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium italic pr-2">{z.pashto}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function NavButton({ active, onClick, icon, label }: { 
  active: boolean; 
  onClick: () => void; 
  icon: ReactNode; 
  label: string 
}) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all flex-1 py-1 rounded-2xl relative ${
        active ? 'text-primary-600' : 'text-slate-300'
      }`}
    >
      <div className={`transition-all duration-300 ${active ? 'scale-110 -translate-y-1' : ''}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-60'}`}>
        {label}
      </span>
      {active && (
        <motion.div 
          layoutId="nav-pill"
          className="absolute -bottom-1 w-1 h-1 bg-primary-600 rounded-full"
        />
      )}
    </button>
  );
}

function PagerView({ azkar, favorites, onToggleFavorite }: { azkar: Zikr[]; favorites: string[]; onToggleFavorite: (id: string) => void }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const paginate = (newDirection: number) => {
    if (newDirection > 0 && index < azkar.length - 1) {
      setDirection(1);
      setIndex(prev => prev + 1);
    } else if (newDirection < 0 && index > 0) {
      setDirection(-1);
      setIndex(prev => prev - 1);
    }
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
      rotateY: direction > 0 ? 30 : -30,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.3 },
        rotateY: { duration: 0.4 }
      }
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
      rotateY: direction < 0 ? 30 : -30,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.3 },
        rotateY: { duration: 0.4 }
      }
    })
  };

  if (azkar.length === 0) return null;

  const current = azkar[index];

  return (
    <div className="flex flex-col h-full -mt-4">
      <div className="relative flex-1 perspective-1000 overflow-visible py-10 px-4">
        {/* Next Card Peak */}
        {index < azkar.length - 1 && (
          <div className="absolute right-0 top-10 bottom-10 w-8 bg-white/40 rounded-l-3xl border-y border-l border-slate-100 translate-x-[90%] opacity-50 pointer-events-none" />
        )}
        {/* Prev Card Peak */}
        {index > 0 && (
          <div className="absolute left-0 top-10 bottom-10 w-8 bg-white/40 rounded-r-3xl border-y border-r border-slate-100 -translate-x-[90%] opacity-50 pointer-events-none" />
        )}

        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={current.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);
              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
            className="absolute inset-x-4 inset-y-10"
          >
            <div className="bg-white h-full rounded-[2.5rem] shadow-xl border border-slate-100 p-8 flex flex-col items-center justify-center text-center space-y-8 overflow-y-auto relative">
               {/* Category Header */}
               <div className="absolute top-6 flex items-center gap-2">
                 <div className="px-4 py-1.5 bg-primary-50 rounded-full border border-primary-100 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse" />
                   <span className="text-[10px] font-black text-primary-600 tracking-wider uppercase">
                     {current.title}
                   </span>
                 </div>
               </div>

               <div className="space-y-8 w-full py-4 pt-12">
                  <p className="text-2xl sm:text-3xl font-arabic leading-[1.8] text-slate-800 dir-rtl p-6 bg-slate-50/50 rounded-[2rem] font-bold shadow-inner">
                    {current.arabic}
                  </p>
                  
                  <div className="flex items-center justify-center gap-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200" />
                    <MoonStar className="w-4 h-4 text-primary-200 flex-shrink-0" />
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200" />
                  </div>
                  
                  <p className="text-lg sm:text-xl font-bold text-slate-600 leading-relaxed dir-rtl px-4">
                    {current.pashto}
                  </p>
                  
                  <div className="pt-6 flex justify-center gap-4">
                     <button 
                      onClick={() => onToggleFavorite(current.id)}
                      className={`p-5 rounded-2xl transition-all shadow-sm active:scale-90 ${favorites.includes(current.id) ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-300'}`}
                     >
                       <Star className={`w-7 h-7 ${favorites.includes(current.id) ? 'fill-current' : ''}`} />
                     </button>
                     <div className="bg-primary-50 px-8 py-3 rounded-2xl flex items-center gap-3">
                        <span className="text-primary-600 font-black text-2xl tracking-tighter">{index + 1}</span>
                        <div className="w-px h-4 bg-primary-200" />
                        <span className="text-primary-400 font-bold text-sm tracking-tighter opacity-60">{azkar.length}</span>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Step Indicator (Dots) */}
      <div className="flex justify-center gap-1.5 mb-8">
        {azkar.length <= 10 ? (
          azkar.map((_, i) => (
            <motion.div 
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${i === index ? 'w-6 bg-primary-500' : 'w-2 bg-slate-200'}`}
              animate={i === index ? { scale: [1, 1.2, 1] } : {}}
            />
          ))
        ) : (
          <div className="flex items-center gap-2">
             <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 tracking-widest uppercase">
               {index + 1} د {azkar.length} څخه
             </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-5 gap-4 mb-4">
        <button 
          onClick={() => paginate(-1)}
          disabled={index === 0}
          className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold transition-all active:scale-95 ${index === 0 ? 'text-slate-300 bg-slate-50' : 'text-slate-600 bg-white shadow-sm hover:bg-slate-50 border border-slate-100'}`}
        >
          <ChevronRight className="w-5 h-5" />
          <span>تېر پاڼه</span>
        </button>

        <button 
          onClick={() => paginate(1)}
          disabled={index === azkar.length - 1}
          className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold transition-all shadow-md active:scale-95 ${index === azkar.length - 1 ? 'bg-slate-100 text-slate-300' : 'bg-primary-600 text-white shadow-primary-500/20 shadow-lg'}`}
        >
          <span>بل پاڼه</span>
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function SettingsItem({ icon, title, active, onToggle, onClick, last }: { 
  icon: ReactNode; 
  title: string; 
  active?: boolean;
  onToggle?: () => void;
  onClick?: () => void;
  last?: boolean;
}) {
  return (
    <div 
      onClick={onClick || onToggle}
      className={`flex items-center justify-between p-5 cursor-pointer active:bg-slate-50 transition-colors ${!last ? 'border-b border-slate-50' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-active:text-primary-600 transition-colors shrink-0">
          {icon}
        </div>
        <span className="font-bold text-slate-700 text-sm leading-tight">{title}</span>
      </div>
      {active !== undefined && (
        <div 
          onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
          className={`w-12 h-6 rounded-full transition-all relative shrink-0 ${active ? 'bg-primary-500 shadow-inner' : 'bg-slate-200'}`}
        >
          <motion.div 
            animate={{ x: active ? 24 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md" 
          />
        </div>
      )}
    </div>
  );
}

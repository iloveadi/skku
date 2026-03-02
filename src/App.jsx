import React, { useState, useEffect } from 'react';
import { Search, Globe, Bell, BookOpen, User, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchSKKU, unifiedSearchSKKU } from './services/skkuSearch';

const App = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setError(null);
        try {
            const data = await unifiedSearchSKKU(query);
            setResults(data);
        } catch (err) {
            setError('정보를 가져오는데 실패했습니다. 네트워크를 확인해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleHome = () => {
        setQuery('');
        setResults({});
        setError(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen w-full bg-[#fdfdfd] text-slate-900 pb-24 md:pb-8">
            {/* Header */}
            <header className="sticky top-0 z-50 glass-header px-4 py-3 md:px-6 md:py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button
                        onClick={handleHome}
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                        <div className="h-8 md:h-10 overflow-hidden">
                            <img src="/logo.png" alt="SKKU Logo" className="h-full w-auto object-contain" />
                        </div>
                        <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3 ml-1">
                            <span className="text-[13px] md:text-sm font-black text-slate-700 tracking-tighter">통합검색 for</span>
                            <span className="text-[13px] md:text-sm font-black text-pink-500 drop-shadow-sm">YJ</span>
                        </div>
                    </button>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        className="p-2.5 text-slate-400 hover:text-skku-green transition-colors bg-slate-50 rounded-full"
                    >
                        <Bell size={18} />
                    </motion.button>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-5 pt-6 md:pt-10">
                {/* Search Bar Section */}
                <section className="mb-8">

                    <form onSubmit={handleSearch} className="relative group">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-skku-green transition-colors">
                            <Search size={20} />
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="셔틀버스, 장학금, 교수님 검색..."
                            className="w-full h-14 md:h-16 pl-14 pr-24 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-100/60 focus:outline-none focus:border-skku-green/40 focus:ring-4 focus:ring-skku-green/5 transition-all text-base md:text-lg font-medium placeholder:text-slate-300"
                        />
                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            className="absolute inset-y-1.5 right-1.5 px-6 bg-skku-green text-white rounded-xl font-bold flex items-center gap-2 hover:bg-skku-dark-green transition-all disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <span>검색</span>}
                        </motion.button>
                    </form>
                </section>


                {/* Results Area */}
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-16"
                        >
                            <div className="relative w-12 h-12">
                                <div className="absolute inset-0 border-3 border-skku-green/10 rounded-full"></div>
                                <div className="absolute inset-0 border-3 border-skku-green rounded-full border-t-transparent animate-spin"></div>
                            </div>
                            <p className="mt-5 text-slate-400 font-bold text-sm animate-pulse tracking-tight">전체 카테고리를 분석하고 있습니다...</p>
                        </motion.div>
                    ) : Object.keys(results).length > 0 ? (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-10 pb-10"
                        >
                            {Object.values(results).map((category) => (
                                <div key={category.id} className="space-y-4">
                                    <div className="flex items-center gap-2 px-1">
                                        <div className="w-1.5 h-5 bg-skku-green rounded-full" />
                                        <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center gap-2">
                                            {category.name}
                                            <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-bold">
                                                {category.data.length}
                                            </span>
                                        </h3>
                                    </div>
                                    <div className="space-y-3.5">
                                        {category.data.map((result, idx) => (
                                            <motion.a
                                                key={result.id}
                                                href={result.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                initial={{ opacity: 0, scale: 0.98 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: idx * 0.03 }}
                                                whileTap={{ scale: 0.985 }}
                                                className={`block p-5 border rounded-3xl transition-all ${category.id === 'FACULTY'
                                                    ? 'bg-skku-green/[0.03] border-skku-green/10 hover:border-skku-green/30'
                                                    : 'bg-white border-slate-100 hover:border-skku-green/20'
                                                    } hover:shadow-lg hover:shadow-slate-200/50`}
                                            >
                                                <div className="flex justify-between items-start mb-2.5">
                                                    <h3 className="text-[15px] font-bold text-slate-800 leading-snug">
                                                        {result.title}
                                                    </h3>
                                                    <span className="text-[10px] font-bold text-skku-gold/70 shrink-0 ml-3 bg-skku-gold/5 px-2 py-0.5 rounded-full">{result.date}</span>
                                                </div>
                                                <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-3.5 font-medium">
                                                    {result.snippet}
                                                </p>
                                                <div className="flex items-center text-[10px] font-black text-skku-green gap-1 uppercase tracking-tighter">
                                                    {category.id === 'FACULTY' ? 'View Faculty Profile' : 'View Details'} <ArrowRight size={12} />
                                                </div>
                                            </motion.a>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    ) : !error && query ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20"
                        >
                            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-5 border border-slate-100">
                                <Search size={22} className="text-slate-300" />
                            </div>
                            <p className="text-slate-400 font-bold text-sm">해당 검색어의 정보가 없습니다.</p>
                        </motion.div>
                    ) : error ? (
                        <div className="text-center py-10 px-6 text-red-500 text-sm font-bold bg-red-50/50 rounded-3xl border border-red-100/50">
                            {error}
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-3.5"
                        >
                            {/* Quick Suggestion Cards */}
                            {[
                                { title: '학사공지', desc: '주요 학사 일정 및 공지', color: 'bg-indigo-50 text-indigo-600', icon: <Bell size={18} /> },
                                { title: '장학 안내', desc: '교내외 장학 정보 모음', color: 'bg-amber-50 text-amber-600', icon: <Sparkles size={18} /> },
                                { title: '인사캠-자과캠 노선 정보', desc: '인사캠-자과캠 셔틀 전용 정보', color: 'bg-emerald-50 text-emerald-600', icon: <Globe size={18} /> },
                                { title: '관련 사이트', desc: '부속기관 바로가기', color: 'bg-rose-50 text-rose-600', icon: <BookOpen size={18} /> },
                            ].map((item, i) => (
                                <motion.button
                                    key={i}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => setQuery(item.title)}
                                    className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-[2rem] hover:border-skku-green/10 hover:shadow-md transition-all text-left group"
                                >
                                    <div className={`p-3.5 rounded-2xl ${item.color} group-hover:scale-110 transition-transform`}>
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm tracking-tight">{item.title}</h4>
                                        <p className="text-[11px] text-slate-400 font-medium">{item.desc}</p>
                                    </div>
                                </motion.button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Floating NavBar - Fixed Premium Bottom Nav */}
            <div className="fixed bottom-0 left-0 right-0 p-4 z-50 pointer-events-none md:hidden">
                <nav className="max-w-md mx-auto h-16 bg-white/90 backdrop-blur-xl border border-slate-200/50 rounded-[2rem] shadow-2xl shadow-slate-200/50 flex justify-around items-center px-6 pointer-events-auto">
                    {[
                        { id: 'search', icon: <Search size={22} />, label: '검색', active: true },
                        { id: 'noti', icon: <Bell size={22} />, label: '알림', active: false },
                        { id: 'fav', icon: <BookOpen size={22} />, label: '북마크', active: false },
                        { id: 'user', icon: <User size={22} />, label: '마이', active: false },
                    ].map((item) => (
                        <motion.button
                            key={item.id}
                            whileTap={{ y: -4 }}
                            onClick={item.id === 'search' ? handleHome : undefined}
                            className={`flex flex-col items-center gap-0.5 ${item.active ? 'text-skku-green' : 'text-slate-300'}`}
                        >
                            {item.icon}
                            <span className="text-[9px] font-black uppercase tracking-tighter">{item.label}</span>
                            {item.active && <motion.div layoutId="activeDot" className="w-1 h-1 bg-skku-green rounded-full mt-0.5" />}
                        </motion.button>
                    ))}
                </nav>
            </div>
        </div>
    );
};

export default App;

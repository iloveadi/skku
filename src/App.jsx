import React, { useState, useEffect } from 'react';
import { Search, Globe, Bell, BookOpen, User, ArrowRight, Loader2, Sparkles, Calendar, ChevronLeft, ChevronRight, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchSKKU, unifiedSearchSKKU, fetchEunhaenggolMenu } from './services/skkuSearch';

const App = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [visibleCounts, setVisibleCounts] = useState({});
    const [menu, setMenu] = useState(null);
    const [currentDate, setCurrentDate] = useState(() => {
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        return new Date(utc + (3600000 * 9)); // KST is UTC+9
    });
    const [isMenuLoading, setIsMenuLoading] = useState(false);

    useEffect(() => {
        const getMenu = async () => {
            setIsMenuLoading(true);
            const yyyy = currentDate.getFullYear();
            const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
            const dd = String(currentDate.getDate()).padStart(2, '0');
            const dateStr = `${yyyy}-${mm}-${dd}`;
            const menuData = await fetchEunhaenggolMenu(dateStr);
            setMenu(menuData);
            setIsMenuLoading(false);
        };
        getMenu();
    }, [currentDate]);

    const changeDate = (days) => {
        const nextDate = new Date(currentDate);
        nextDate.setDate(currentDate.getDate() + days);
        setCurrentDate(nextDate);
    };

    const getRelativeDateLabel = () => {
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const today = new Date(utc + (3600000 * 9));
        today.setHours(0, 0, 0, 0);

        const compare = new Date(currentDate);
        compare.setHours(0, 0, 0, 0);

        const diffDays = Math.round((compare.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return '오늘';
        if (diffDays === 1) return '내일';
        if (diffDays === -1) return '어제';
        return `${compare.getMonth() + 1}월 ${compare.getDate()}일`;
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;

        // Hide mobile keyboard
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        setIsLoading(true);
        setError(null);
        try {
            const data = await unifiedSearchSKKU(query);
            setResults(data);
            // Reset visible counts to 10 for each new category
            const initialCounts = {};
            Object.keys(data).forEach(id => {
                initialCounts[id] = 10;
            });
            setVisibleCounts(initialCounts);
        } catch (err) {
            setError('정보를 가져오는데 실패했습니다. 네트워크를 확인해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleHome = () => {
        setQuery('');
        setResults({});
        setVisibleCounts({});
        setError(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const loadMore = (categoryId) => {
        setVisibleCounts(prev => ({
            ...prev,
            [categoryId]: (prev[categoryId] || 10) + 10
        }));
    };

    return (
        <div className="min-h-screen w-full bg-[#fdfdfd] text-slate-900 pb-24 md:pb-8">
            {/* Header */}
            <header className="sticky top-0 z-50 glass-header px-4 py-3 md:px-6 md:py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button
                        onClick={handleHome}
                        className="flex items-center gap-5 hover:opacity-80 transition-opacity"
                    >
                        <div className="h-11 md:h-14 overflow-hidden flex items-center">
                            <img src="./logo.png" alt="SKKU Logo" className="h-full w-auto object-contain" />
                        </div>
                        <div className="flex items-center gap-1.5 pt-0.5">
                            <span className="text-[17px] md:text-[20px] font-black text-[#ff2e63] tracking-[-0.05em] drop-shadow-sm">YJ</span>
                            <span className="text-[17px] md:text-[20px] font-black text-slate-800 tracking-[-0.05em]">Search</span>
                        </div>
                    </button>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-5 pt-8 md:pt-14">
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
                            placeholder="검색어 입력..."
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

                    {!isLoading && Object.keys(results).length === 0 && !error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 mb-10 overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-24 h-24 bg-skku-green/5 rounded-full blur-3xl pointer-events-none" />
                            <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2.5 bg-skku-green/10 text-skku-green rounded-xl">
                                            <Utensils size={18} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-800 text-sm tracking-tight">은행골 조식 식단</h4>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-skku-gold/10 px-2 py-1 rounded-full text-skku-gold">
                                        <button
                                            onClick={() => changeDate(-1)}
                                            className="p-0.5 hover:bg-white/50 rounded-full transition-colors"
                                        >
                                            <ChevronLeft size={14} />
                                        </button>
                                        <span className="text-[10px] font-black uppercase tracking-tighter px-0.5">
                                            {currentDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
                                        </span>
                                        <button
                                            onClick={() => changeDate(1)}
                                            className="p-0.5 hover:bg-white/50 rounded-full transition-colors"
                                        >
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-slate-50/50 rounded-2xl p-4 border border-dashed border-slate-200 min-h-[80px] flex items-center justify-center">
                                    {isMenuLoading ? (
                                        <Loader2 className="animate-spin text-slate-200" size={20} />
                                    ) : (
                                        <p className={`text-sm font-bold leading-relaxed w-full text-center whitespace-pre-line ${menu === '미운영' ? 'text-slate-300 italic' : 'text-slate-600'}`}>
                                            {menu}
                                        </p>
                                    )}
                                </div>
                            </div>

                        </motion.div>
                    )}
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
                                        {category.data.slice(0, visibleCounts[category.id] || 10).map((result, idx) => (
                                            <motion.a
                                                key={result.id}
                                                href={result.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: (idx % 10) * 0.03 }}
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
                                    {(visibleCounts[category.id] || 10) < category.data.length && (
                                        <div className="pt-2 text-center">
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => loadMore(category.id)}
                                                className="w-full py-4 text-xs font-black text-skku-green bg-skku-green/5 rounded-2xl hover:bg-skku-green/10 transition-colors uppercase tracking-widest flex items-center justify-center gap-2"
                                            >
                                                검색 결과 더 보기 (+{category.data.length - (visibleCounts[category.id] || 10)})
                                            </motion.button>
                                        </div>
                                    )}
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
                                { title: 'SKKU 캘린더', desc: '학사 일정 및 행사', color: 'bg-purple-50 text-purple-600', icon: <Calendar size={18} />, url: 'https://www.skku.edu/skku/campus/skk_comm/event.do' },
                                { title: '셔틀버스', desc: '인사캠-자과캠 셔틀 정보', color: 'bg-emerald-50 text-emerald-600', icon: <Globe size={18} />, url: 'https://www.skku.edu/skku/campus/support/welfare_12.do' },
                                { title: '한문교육과', desc: '성균관대 한문교육과 홈페이지', color: 'bg-blue-50 text-blue-600', icon: <BookOpen size={18} />, url: 'https://skb.skku.edu/klccedu/index.do' },
                                { title: '사범대학', desc: '성균관대 사범대학 홈페이지', color: 'bg-rose-50 text-rose-600', icon: <Sparkles size={18} />, url: 'https://coe.skku.edu/coe/index.do' },
                            ].map((item, i) => (
                                <motion.button
                                    key={i}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => item.url ? window.open(item.url, '_blank', 'noopener,noreferrer') : setQuery(item.title)}
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

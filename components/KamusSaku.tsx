/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RefreshCw, GitCompare, Package, Coins, Hash, Wallet, Sprout, ShoppingBag, 
  Search, BookOpen, Layers, Trophy, CheckCircle2, XCircle, ArrowRight, Star
} from 'lucide-react';
import { VOCABULARY_LIST } from '../src/data';
import { playClickSound, playSuccessSound, playErrorSound } from '../src/utils/audio';

// Helper to map string icon keys to lucide icons
const IconMapper = ({ name, className }: { name: string; className?: string }) => {
  const props = { className: className || "w-6 h-6" };
  switch (name) {
    case 'refresh-cw': return <RefreshCw {...props} />;
    case 'git-compare': return <GitCompare {...props} />;
    case 'package': return <Package {...props} />;
    case 'coins': return <Coins {...props} />;
    case 'hash': return <Hash {...props} />;
    case 'wallet': return <Wallet {...props} />;
    case 'sprout': return <Sprout {...props} />;
    case 'shopping-bag': return <ShoppingBag {...props} />;
    default: return <BookOpen {...props} />;
  }
};

type FilterCategory = 'Semua' | 'Barter' | 'Nilai Uang' | 'Syarat Uang' | 'Pelaku Ekonomi';
type ViewMode = 'kartu' | 'game';

interface QuizState {
  word: string;
  definition: string;
  example: string;
  options: string[];
  correctIdx: number;
}

export default function KamusSaku() {
  const [viewMode, setViewMode] = useState<ViewMode>('kartu');
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [flippedWord, setFlippedWord] = useState<string | null>(null);

  // Vocabulary Trivia states
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [selectedOptIdx, setSelectedOptIdx] = useState<number | null>(null);
  const [hasCheckedAnswer, setHasCheckedAnswer] = useState(false);
  const [triviaStreak, setTriviaStreak] = useState(0);
  const [earnedBonusMessage, setEarnedBonusMessage] = useState(false);

  const categories: FilterCategory[] = ['Semua', 'Barter', 'Nilai Uang', 'Syarat Uang', 'Pelaku Ekonomi'];

  const filteredItems = VOCABULARY_LIST.filter(item => {
    const matchesCategory = activeCategory === 'Semua' || item.category === activeCategory;
    const matchesSearch = item.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.definition.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleFlip = (word: string) => {
    playClickSound();
    setFlippedWord(flippedWord === word ? null : word);
  };

  // Generate a random question
  const initiateNextQuestion = () => {
    if (VOCABULARY_LIST.length < 3) return;
    
    // Pick target
    const targetIdx = Math.floor(Math.random() * VOCABULARY_LIST.length);
    const target = VOCABULARY_LIST[targetIdx];
    
    // Assemble distractors
    const pool = [target.word];
    while (pool.length < 3) {
      const distractor = VOCABULARY_LIST[Math.floor(Math.random() * VOCABULARY_LIST.length)].word;
      if (!pool.includes(distractor)) {
        pool.push(distractor);
      }
    }
    
    // Shuffle options
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    
    setQuizState({
      word: target.word,
      definition: target.definition,
      example: target.example,
      options: shuffled,
      correctIdx: shuffled.indexOf(target.word)
    });
    setSelectedOptIdx(null);
    setHasCheckedAnswer(false);
    setEarnedBonusMessage(false);
  };

  // Generate question on mount or viewMode change
  useEffect(() => {
    if (viewMode === 'game') {
      initiateNextQuestion();
    }
  }, [viewMode]);

  const handleSelectOption = (idx: number) => {
    if (hasCheckedAnswer) return;
    playClickSound();
    setSelectedOptIdx(idx);
  };

  const checkTriviaAnswer = () => {
    if (selectedOptIdx === null || !quizState) return;
    
    setHasCheckedAnswer(true);
    const isCorrect = selectedOptIdx === quizState.correctIdx;

    if (isCorrect) {
      playSuccessSound();
      setTriviaStreak(s => s + 1);
      
      // Inject +Rp500 savings to localstorage
      const saved = localStorage.getItem('dimiba_savings');
      const currentSavings = saved ? parseInt(saved, 10) : 0;
      const newSavings = currentSavings + 500;
      localStorage.setItem('dimiba_savings', newSavings.toString());
      setEarnedBonusMessage(true);
    } else {
      playErrorSound();
      setTriviaStreak(0);
      setEarnedBonusMessage(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Tab Navigation header for Kamus Saku */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-baloo font-black text-slate-800 flex items-center justify-center md:justify-start gap-1.5 leading-none">
            📖 Kamus Saku &amp; Game Istilah
          </h2>
          <p className="text-slate-500 text-xs mt-1">Eksplorasi istilah keuangan menarik atau uji kemampuan dengan game kuis!</p>
        </div>

        {/* View Mode Select Buttons */}
        <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl shrink-0">
          <button
            onClick={() => {
              playClickSound();
              setViewMode('kartu');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              viewMode === 'kartu' 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            📚 Flashcard Istilah
          </button>
          <button
            onClick={() => {
              playClickSound();
              setViewMode('game');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              viewMode === 'game' 
                ? 'bg-amber-500 text-white shadow-sm' 
                : 'text-slate-500 hover:text-amber-600'
            }`}
          >
            🎮 Kuis Cocok Kata
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'kartu' ? (
          <motion.div
            key="kartu-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Control bar: Search & Filters */}
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search input */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari definisi kata..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setFlippedWord(null);
                  }}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 focus:border-primary text-sm pl-10 pr-4 py-2.5 rounded-2xl outline-none transition-all"
                />
              </div>

              {/* Filter Badges */}
              <div className="flex flex-wrap gap-1.5 items-center justify-center">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      playClickSound();
                      setActiveCategory(cat);
                      setFlippedWord(null);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs capitalize transition-all cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-slate-100/70 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of interactive flip cards */}
            {filteredItems.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border text-slate-500 space-y-2">
                <BookOpen className="w-12 h-12 mx-auto text-slate-300" />
                <p className="font-bold">Kosakata belum ditemukan</p>
                <p className="text-xs">Coba ganti kategori pencarianmu atau ganti kata kunci.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredItems.map((item) => {
                    const isFlipped = flippedWord === item.word;
                    
                    // Color tags
                    let categoryColor = 'bg-blue-100 text-blue-800';
                    if (item.category === 'Barter') categoryColor = 'bg-rose-100 text-rose-800';
                    if (item.category === 'Syarat Uang') categoryColor = 'bg-purple-100 text-purple-800';
                    if (item.category === 'Pelaku Ekonomi') categoryColor = 'bg-emerald-100 text-emerald-800';

                    return (
                      <motion.div
                        layout
                        key={item.word}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={() => handleFlip(item.word)}
                        className="perspective-[1000px] h-[240px] cursor-pointer group"
                      >
                        <div className={`relative w-full h-full duration-500 transform-style-3d ${
                          isFlipped ? 'rotate-y-180' : ''
                        }`}>
                          
                          {/* CARD FRONT SIDE */}
                          <div className="absolute inset-0 backface-hidden bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                            <div className="space-y-4">
                              {/* Upper row */}
                              <div className="flex justify-between items-start">
                                <span className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full ${categoryColor}`}>
                                  {item.category}
                                </span>
                                <div className="bg-slate-50 p-2 rounded-xl text-slate-400 group-hover:text-primary transition-colors group-hover:bg-sky-50">
                                  <IconMapper name={item.iconName} />
                                </div>
                              </div>

                              {/* Middle Word info */}
                              <div className="space-y-1">
                                <h3 className="font-baloo font-extrabold text-slate-800 text-lg leading-tight">
                                  {item.word}
                                </h3>
                                <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1">
                                  <Layers className="w-3 h-3 text-sky-400" /> Ketuk untuk lihat arti
                                </p>
                              </div>
                            </div>

                            {/* Spark decorator */}
                            <div className="text-right">
                              <span className="text-[9px] text-slate-300 font-black uppercase tracking-wider">DIMIBA INDONESIA</span>
                            </div>
                          </div>

                          {/* CARD BACK SIDE */}
                          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-slate-900 to-slate-800 p-5 rounded-3xl text-white flex flex-col justify-between shadow-lg">
                            <div className="space-y-3.5 text-sm text-slate-200 leading-relaxed custom-scrollbar overflow-y-auto">
                              <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                                <span className="font-extrabold text-[11px] uppercase text-sky-400 tracking-wider">Definisi</span>
                                <span className="text-[11px] font-bold text-slate-300">{item.word}</span>
                              </div>
                              <p className="text-white font-extrabold leading-relaxed text-sm sm:text-base">{item.definition}</p>
                              
                              <div className="pt-1.5">
                                <p className="text-[11px] font-black uppercase text-amber-400 tracking-widest leading-none mb-1.5">Contoh Sehari-hari:</p>
                                <p className="italic text-slate-200 bg-slate-800 border border-slate-700/60 p-3 rounded-2xl text-xs sm:text-sm font-semibold leading-relaxed">
                                  "{item.example}"
                                </p>
                              </div>
                            </div>

                            <div className="text-center pt-2">
                              <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                                Ketuk Untuk Tutup
                              </span>
                            </div>

                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="game-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 max-w-xl mx-auto"
          >
            {/* Trivia Game Container */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-8 -mt-8"></div>
              
              {/* Game Stats Bar */}
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 text-xs font-black text-slate-600">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>Skor Beruntun:</span>
                  <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-lg text-xs leading-none">
                     {triviaStreak} Berhasil
                  </span>
                </div>
                {triviaStreak > 0 && (
                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-extrabold animate-pulse">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> Hebat! Lanjutkan
                  </div>
                )}
              </div>

              {quizState ? (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <span className="text-[9px] font-black text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full uppercase tracking-wider inline-block">
                      TENTUKAN ISTILAH YANG COCOK 🧐
                    </span>
                    <h3 className="text-base font-baloo font-bold text-slate-800 leading-normal bg-amber-50/25 p-4 rounded-2xl border border-amber-200/50">
                      &ldquo;{quizState.definition}&rdquo;
                    </h3>
                  </div>

                  {/* Multiple Choice Options */}
                  <div className="space-y-2.5">
                    {quizState.options.map((option, idx) => {
                      const isSelected = selectedOptIdx === idx;
                      const isCorrect = idx === quizState.correctIdx;
                      
                      let optionStyle = "border-slate-100 hover:bg-slate-50 bg-white text-slate-700";
                      
                      if (isSelected) {
                        optionStyle = "bg-amber-50 border-amber-400 text-amber-900";
                      }
                      
                      if (hasCheckedAnswer) {
                        if (isCorrect) {
                          optionStyle = "bg-emerald-50 border-emerald-400 text-emerald-950";
                        } else if (isSelected) {
                          optionStyle = "bg-rose-50 border-rose-300 text-rose-950";
                        } else {
                          optionStyle = "opacity-45 bg-white border-slate-100 text-slate-400";
                        }
                      }

                      return (
                        <button
                          key={option}
                          disabled={hasCheckedAnswer}
                          onClick={() => handleSelectOption(idx)}
                          className={`w-full p-3.5 rounded-2xl border text-left text-sm font-baloo font-bold transition-all flex items-center justify-between cursor-pointer ${optionStyle}`}
                        >
                          <span className="flex items-center gap-2.5">
                            <span className="w-6 h-6 bg-slate-100 text-slate-600 flex items-center justify-center rounded-lg text-xs font-black">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span>{option}</span>
                          </span>

                          <span className="shrink-0">
                            {hasCheckedAnswer && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                            {hasCheckedAnswer && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-500" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedbacks Panel */}
                  <AnimatePresence>
                    {hasCheckedAnswer && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className={`rounded-2xl p-4 text-xs font-semibold leading-relaxed space-y-1.5 ${
                          selectedOptIdx === quizState.correctIdx 
                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' 
                            : 'bg-rose-50 border border-rose-200 text-rose-900'
                        }`}
                      >
                        <p className="font-extrabold text-sm flex items-center gap-1.5">
                          {selectedOptIdx === quizState.correctIdx ? '🎉 Jawaban Benar!' : '😢 Belum Tepat'}
                        </p>
                        <p className="font-semibold text-slate-600">
                          {selectedOptIdx === quizState.correctIdx 
                            ? `Hebat! Istilah "${quizState.word}" adalah pasangan yang tepat.` 
                            : `Ayo coba ingat kembali! Pasangan yang benar untuk istilah tersebut adalah "${quizState.word}".`}
                        </p>
                        {earnedBonusMessage && (
                          <p className="bg-amber-100 text-amber-950 font-black px-2 py-1 rounded-lg inline-block text-[10px] mt-1">
                            💰 Kamu mendapat bonus tabungan +Rp500 koin!
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action bottom button */}
                  <div className="pt-2">
                    {!hasCheckedAnswer ? (
                      <button
                        disabled={selectedOptIdx === null}
                        onClick={checkTriviaAnswer}
                        className={`w-full font-black py-3.5 rounded-2xl shadow transition-all transform active:scale-95 text-center cursor-pointer ${
                          selectedOptIdx === null 
                            ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed' 
                            : 'bg-amber-500 text-white hover:bg-amber-600'
                        }`}
                      >
                        Periksa Jawban Kuis! 🧐
                      </button>
                    ) : (
                      <button
                        onClick={initiateNextQuestion}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-2xl shadow flex items-center justify-center gap-2 transform active:scale-95 transition-all cursor-pointer"
                      >
                        <span>Soal Berikutnya</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                </div>
              ) : (
                <div className="py-10 text-center font-bold text-slate-300">Menyusun materi kuis...</div>
              )}
            </div>

            {/* Cultural wisdom detail */}
            <div className="bg-gradient-to-tr from-amber-50 to-orange-50/40 p-5 rounded-2xl border border-amber-200/50 space-y-1.5 text-xs text-amber-950 font-semibold leading-relaxed">
              <span className="text-[9px] font-black uppercase text-amber-800 bg-amber-200 px-2 py-0.5 rounded-md">
                🎓 Mengapa Bermain Kamus?
              </span>
              <p className="font-baloo font-bold">Membentuk Kebiasaan Finansial Mandiri</p>
              <p className="text-[11px] text-slate-600 font-medium">
                Melalui permainan tebak kosa kata, anak diajak melatih penalaran semantik agar paham betapa bernilainya konsep uang, jasa, barter, dan kearifan suku Dayak *&ldquo;Diri Mali Ia Bajual&rdquo;* di dunia modern.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

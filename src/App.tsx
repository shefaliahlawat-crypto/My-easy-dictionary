/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Wifi,
  WifiOff,
  Search,
  Sparkles,
  Bookmark,
  History,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  BookMarked,
  Trash2,
} from "lucide-react";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import WordDetail from "./components/WordDetail";
import WordOfTheDay from "./components/WordOfTheDay";
import VocabularyDeck from "./components/VocabularyDeck";
import Flashcards from "./components/Flashcards";
import { WordEntry, Phonetic } from "./types";
import { offlineDictionary } from "./data/offlineDictionary";

export default function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeTab, setActiveTab] = useState<"search" | "explore" | "flashcards">("search");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [bookmarkedWords, setBookmarkedWords] = useState<{ [word: string]: boolean }>({});
  const [selectedWordEntry, setSelectedWordEntry] = useState<WordEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Monitor connection status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Load Search History and Bookmarks from localStorage on mount
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem("lexicon_history");
      if (storedHistory) {
        setSearchHistory(JSON.parse(storedHistory));
      }

      const storedBookmarks = localStorage.getItem("lexicon_bookmarks");
      if (storedBookmarks) {
        setBookmarkedWords(JSON.parse(storedBookmarks));
      }
    } catch (e) {
      console.error("Failed to load local storage assets:", e);
    }
  }, []);

  // Sync Bookmarks to localStorage
  const saveBookmarks = (newBookmarks: { [word: string]: boolean }) => {
    setBookmarkedWords(newBookmarks);
    localStorage.setItem("lexicon_bookmarks", JSON.stringify(newBookmarks));
  };

  // Sync Search History to localStorage
  const addToHistory = (word: string) => {
    const cleaned = word.trim().toLowerCase();
    const updated = [cleaned, ...searchHistory.filter((w) => w !== cleaned)].slice(0, 30);
    setSearchHistory(updated);
    localStorage.setItem("lexicon_history", JSON.stringify(updated));
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("lexicon_history");
  };

  // Handle bookmarked items toggle
  const handleToggleBookmark = (word: string) => {
    const isSaved = bookmarkedWords[word];
    const updated = { ...bookmarkedWords };
    if (isSaved) {
      delete updated[word];
    } else {
      updated[word] = true;
    }
    saveBookmarks(updated);

    // If the active word detail is current, update its cached/custom flags
    if (selectedWordEntry && selectedWordEntry.word === word) {
      setSelectedWordEntry((prev) => {
        if (!prev) return null;
        return { ...prev };
      });
    }
  };

  // Save notes to localStorage
  const handleSaveNotes = (word: string, notes: string) => {
    localStorage.setItem(`lexicon_notes_${word.toLowerCase()}`, notes);
    
    // Update active word in memory
    if (selectedWordEntry && selectedWordEntry.word.toLowerCase() === word.toLowerCase()) {
      setSelectedWordEntry((prev) => {
        if (!prev) return null;
        return { ...prev, personalNotes: notes };
      });
    }

    // Update in cached dictionaries if applicable
    try {
      const cachedStr = localStorage.getItem(`lexicon_cached_${word.toLowerCase()}`);
      if (cachedStr) {
        const entry: WordEntry = JSON.parse(cachedStr);
        entry.personalNotes = notes;
        localStorage.setItem(`lexicon_cached_${word.toLowerCase()}`, JSON.stringify(entry));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Main search action
  const handleSearchWord = async (word: string) => {
    const query = word.trim().toLowerCase();
    if (!query) return;

    setIsLoading(true);
    setErrorMsg(null);
    setActiveTab("search");

    // Load any personal notes
    const storedNotes = localStorage.getItem(`lexicon_notes_${query}`) || "";

    // 1. Check if the word is preloaded in our Rich Offline Dictionary
    if (offlineDictionary[query]) {
      const entry = {
        ...offlineDictionary[query],
        personalNotes: storedNotes,
      };
      setSelectedWordEntry(entry);
      addToHistory(entry.word);
      setIsLoading(false);
      return;
    }

    // 2. Check if the word is in our Local Storage Cache (searched online earlier)
    try {
      const cachedData = localStorage.getItem(`lexicon_cached_${query}`);
      if (cachedData) {
        const entry: WordEntry = JSON.parse(cachedData);
        entry.personalNotes = storedNotes;
        entry.isOfflineCached = true;
        setSelectedWordEntry(entry);
        addToHistory(entry.word);
        setIsLoading(false);
        return;
      }
    } catch (e) {
      console.warn("Failed to check localStorage cache:", e);
    }

    // 3. If Offline and not found in preloaded/cache, throw connection error
    if (!navigator.onLine) {
      setErrorMsg(
        `You are currently offline, and "${word}" is not in your local cache. Connect to the internet to search the live dictionary, or try one of our pre-loaded words below.`
      );
      setSelectedWordEntry(null);
      setIsLoading(false);
      return;
    }

    // 4. Online lookup: Fetch from Free Dictionary API + Merriam-Webster
    try {
      // Fetch definitions
      const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${query}`);
      if (!dictRes.ok) {
        if (dictRes.status === 404) {
          throw new Error(`We couldn't find definitions for "${word}". Double check the spelling or try another word.`);
        }
        throw new Error("Failed to retrieve data from the dictionary API.");
      }

      const dictData = await dictRes.json();
      if (!dictData || dictData.length === 0) {
        throw new Error(`No definition entries found for "${word}".`);
      }

      const rawEntry = dictData[0];

      // Assemble core entry details
      const entry: WordEntry = {
        word: rawEntry.word,
        phonetic: rawEntry.phonetic || (rawEntry.phonetics && rawEntry.phonetics[0]?.text) || "",
        phonetics: rawEntry.phonetics || [],
        meanings: rawEntry.meanings || [],
        sourceUrls: rawEntry.sourceUrls || [],
        personalNotes: storedNotes,
      };

      // Add Merriam-Webster as a source reference for the searched word
      const mwUrl = `https://www.merriam-webster.com/dictionary/${encodeURIComponent(query)}`;
      if (!entry.sourceUrls?.includes(mwUrl)) {
        entry.sourceUrls = [...(entry.sourceUrls || []), mwUrl];
      }

      // Automatically cache successfully fetched online words for offline use!
      try {
        localStorage.setItem(`lexicon_cached_${query}`, JSON.stringify(entry));
      } catch (e) {
        console.warn("Failed to write to localStorage cache:", e);
      }

      setSelectedWordEntry({ ...entry, isOfflineCached: true });
      addToHistory(entry.word);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during search lookup.");
      setSelectedWordEntry(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert bookmarks object to a list of fully fledge WordEntries for flashcards
  const getBookmarkedWordsEntries = (): WordEntry[] => {
    const list: WordEntry[] = [];
    Object.keys(bookmarkedWords).forEach((word) => {
      // 1. Check offline dictionary
      if (offlineDictionary[word]) {
        list.push(offlineDictionary[word]);
      } else {
        // 2. Check cached dictionary
        try {
          const cached = localStorage.getItem(`lexicon_cached_${word}`);
          if (cached) {
            list.push(JSON.parse(cached));
          } else {
            // Fallback skeleton
            list.push({
              word,
              meanings: [
                {
                  partOfSpeech: "noun",
                  definitions: [{ definition: "Saved bookmark word. Look up while online to reveal definition." }],
                },
              ],
            });
          }
        } catch (e) {
          console.error(e);
        }
      }
    });
    return list;
  };

  const offlineWordKeys = Object.keys(offlineDictionary);
  const bookmarkedCount = Object.keys(bookmarkedWords).length;

  return (
    <div className="min-h-screen bg-[#fafaf9] text-black flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Dynamic Header Component */}
      <Header
        isOnline={isOnline}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== "search") {
            setErrorMsg(null);
          }
        }}
        bookmarkedCount={bookmarkedCount}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-8">
        
        {/* TAB 1: SEARCH & DASHBOARD */}
        {activeTab === "search" && (
          <div className="space-y-8">
            {/* Search container */}
            <div className="text-center space-y-4 max-w-2xl mx-auto pt-4 md:pt-8">
              <h2 className="font-serif text-4xl md:text-5xl font-black tracking-tight text-black">
                Unlock the Power of <span className="underline decoration-indigo-500 decoration-wavy">Words</span>
              </h2>
              <p className="text-slate-600 text-sm md:text-base max-w-lg mx-auto leading-relaxed font-bold">
                A gorgeous vocabulary companion designed to work fully offline. Search, study, annotate, and play.
              </p>
            </div>

            {/* Smart Search Bar */}
            <SearchBar
              onSearch={handleSearchWord}
              suggestions={[]} // Suggestions handled dynamically in SearchBar using matching preloads & history
              offlineWords={offlineWordKeys}
              historyWords={searchHistory}
            />

            {/* Search Results Display or Loading Skeleton */}
            {isLoading ? (
              <div className="w-full max-w-3xl mx-auto space-y-6 animate-pulse">
                <div className="h-40 bg-slate-200 border-4 border-black rounded-3xl" />
                <div className="h-64 bg-slate-200 border-4 border-black rounded-3xl" />
              </div>
            ) : errorMsg ? (
              /* Beautiful Error Card */
              <div className="w-full max-w-2xl mx-auto bg-rose-50 border-4 border-black rounded-3xl p-6 md:p-8 space-y-4 shadow-brutal-md">
                <div className="flex items-start space-x-3 text-rose-800">
                  <AlertCircle className="w-6 h-6 shrink-0 mt-0.5 text-rose-800 stroke-[2.5]" />
                  <div>
                    <h4 className="font-serif font-black text-lg text-black">Lookup Encountered an Issue</h4>
                    <p className="text-sm text-slate-800 mt-1 leading-relaxed font-bold">{errorMsg}</p>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="pt-4 border-t-2 border-black">
                  <span className="text-xs font-mono font-black text-slate-500 uppercase tracking-widest block mb-3">
                    Try searching one of these popular words offline:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {offlineWordKeys.slice(0, 6).map((word) => (
                      <button
                        key={word}
                        onClick={() => handleSearchWord(word)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-black border-2 border-black rounded-xl text-xs font-black capitalize shadow-brutal-sm active-brutal transition-all"
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : selectedWordEntry ? (
              /* Fleshed out Word Detail Card */
              <WordDetail
                wordEntry={selectedWordEntry}
                isBookmarked={!!bookmarkedWords[selectedWordEntry.word.toLowerCase()]}
                onToggleBookmark={() => handleToggleBookmark(selectedWordEntry.word.toLowerCase())}
                onSearchWord={handleSearchWord}
                isOnline={isOnline}
                onSaveNotes={(notes) => handleSaveNotes(selectedWordEntry.word, notes)}
              />
            ) : (
              /* Welcome Dashboard view (when no search done yet) */
              <div className="space-y-10 pt-4 max-w-4xl mx-auto">
                {/* Word of the Day widget */}
                <WordOfTheDay onSelectWord={handleSearchWord} />

                {/* Grid layout for Dashboard widgets (History & Quick tips) */}
                <div className="grid md:grid-cols-5 gap-6 max-w-3xl mx-auto">
                  {/* Left Column: History list */}
                  <div className="bg-white border-4 border-black rounded-3xl p-6 md:col-span-3 shadow-brutal-md space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                      <h4 className="font-serif font-black text-base text-black flex items-center space-x-2">
                        <History className="w-5 h-5 text-black stroke-[2.5]" />
                        <span>Recent Searches</span>
                      </h4>
                      {searchHistory.length > 0 && (
                        <button
                          onClick={clearHistory}
                          className="text-[10px] text-black hover:text-rose-600 font-mono font-black uppercase tracking-widest transition-colors flex items-center space-x-1"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-black" />
                          <span>Clear All</span>
                        </button>
                      )}
                    </div>

                    {searchHistory.length > 0 ? (
                      <ul className="space-y-1.5 max-h-48 overflow-y-auto">
                        {searchHistory.map((word) => (
                          <li key={word}>
                            <button
                              onClick={() => handleSearchWord(word)}
                              className="w-full px-3 py-2 text-left hover:bg-slate-50 rounded-xl text-sm text-black capitalize font-black flex items-center justify-between group transition-colors border border-transparent hover:border-black"
                            >
                              <span>{word}</span>
                              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-black transition-all group-hover:translate-x-0.5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-6 text-slate-400 text-xs italic font-bold">
                        No words searched yet. Your search history will appear here.
                      </div>
                    )}
                  </div>

                  {/* Right Column: Quick learning links */}
                  <div className="bg-amber-300 border-4 border-black text-black rounded-3xl p-6 md:col-span-2 shadow-brutal-md flex flex-col justify-between space-y-6">
                    <div className="space-y-2">
                      <h4 className="font-serif font-black text-2xl leading-tight">
                        Test Your Knowledge
                      </h4>
                      <p className="text-slate-800 text-xs leading-relaxed font-bold">
                        Launch our interactive study flashcards built entirely to test definitions offline.
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveTab("flashcards")}
                      className="w-full py-3 bg-black hover:bg-slate-900 text-white font-black text-xs rounded-xl shadow-brutal-sm active-brutal transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <span>Start Flashcards</span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EXPLORE / VISUAL VOCABULARY DECK */}
        {activeTab === "explore" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="text-center space-y-2 max-w-xl mx-auto pt-4">
              <h2 className="font-serif text-3xl font-black tracking-tight text-black flex items-center justify-center space-x-2">
                <Sparkles className="w-6 h-6 text-indigo-500 stroke-[2.5]" />
                <span>Explore Rich Vocabulary</span>
              </h2>
              <p className="text-slate-600 text-xs leading-relaxed font-bold">
                Browse our curated deck of beautifully illustrated words. These words and images are 100% available offline at any time.
              </p>
            </div>

            <VocabularyDeck
              onSelectWord={handleSearchWord}
              bookmarkedWords={bookmarkedWords}
              onToggleBookmark={(word) => handleToggleBookmark(word)}
            />
          </div>
        )}

        {/* TAB 3: LEARN / FLASHCARDS GAME */}
        {activeTab === "flashcards" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="text-center space-y-2 max-w-xl mx-auto pt-4">
              <h2 className="font-serif text-3xl font-black tracking-tight text-black">
                Interactive Vocabulary Cards
              </h2>
              <p className="text-slate-600 text-xs leading-relaxed font-bold">
                Challenge yourself to memorize phonetic accents, part-of-speech uses, and full definitions offline.
              </p>
            </div>

            <Flashcards
              bookmarkedWordsList={getBookmarkedWordsEntries()}
              onSelectWord={handleSearchWord}
            />
          </div>
        )}
      </main>

      {/* Footer copyright notice */}
      <footer className="border-t-4 border-black bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-black gap-2 font-black">
          <span>Lexicon Dictionary App © 2026</span>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 border border-black" />
              <span>Offline-First Synced</span>
            </span>
            <a
              href="https://api.dictionaryapi.dev"
              target="_blank"
              rel="noreferrer"
              className="hover:text-indigo-600 underline"
            >
              Free Dictionary API
            </a>
            <a
              href="https://www.merriam-webster.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-indigo-600 underline"
            >
              Merriam-Webster
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

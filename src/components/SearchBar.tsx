/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Search, X, History, Sparkles, Filter } from "lucide-react";
import { WordEntry } from "../types";

interface SearchBarProps {
  onSearch: (word: string) => void;
  suggestions: string[];
  offlineWords: string[];
  historyWords: string[];
}

export default function SearchBar({
  onSearch,
  suggestions,
  offlineWords,
  historyWords,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [filterType, setFilterType] = useState<"all" | "custom" | "history">("all");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close suggestions list on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
    setActiveSuggestionIndex(-1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (word: string) => {
    setQuery(word);
    onSearch(word);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeSuggestionIndex >= 0 && activeSuggestionIndex < filteredSuggestions.length) {
        const selected = filteredSuggestions[activeSuggestionIndex].word;
        setQuery(selected);
        onSearch(selected);
        setIsOpen(false);
      } else if (query.trim()) {
        onSearch(query.trim());
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Get matching words for the suggestions list
  const getFilteredSuggestions = () => {
    const q = query.toLowerCase().trim();
    if (!q) {
      // If empty query, show recent search history + custom words as quick recommendations
      const recs: { word: string; type: "custom" | "history" }[] = [];
      historyWords.slice(0, 5).forEach((w) => recs.push({ word: w, type: "history" }));
      offlineWords.slice(0, 5).forEach((w) => {
        if (!recs.some((r) => r.word === w)) {
          recs.push({ word: w, type: "custom" });
        }
      });
      return recs;
    }

    const matches: { word: string; type: "custom" | "history" | "api" }[] = [];

    // Filter by type
    if (filterType === "all" || filterType === "history") {
      historyWords.forEach((w) => {
        if (w.toLowerCase().includes(q) && !matches.some((m) => m.word === w)) {
          matches.push({ word: w, type: "history" });
        }
      });
    }

    if (filterType === "all" || filterType === "custom") {
      offlineWords.forEach((w) => {
        if (w.toLowerCase().includes(q) && !matches.some((m) => m.word === w)) {
          matches.push({ word: w, type: "custom" });
        }
      });
    }

    // Add API suggestions if online and not matched yet
    suggestions.forEach((w) => {
      const lowerW = w.toLowerCase();
      if (lowerW.includes(q) && !matches.some((m) => m.word.toLowerCase() === lowerW)) {
        matches.push({ word: w, type: "api" });
      }
    });

    return matches.slice(0, 8);
  };

  const filteredSuggestions = getFilteredSuggestions();

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto z-40">
      <form onSubmit={handleSubmit} className="relative flex items-center bg-white border-4 border-black rounded-2xl p-2 shadow-brutal-md transition-all focus-within:shadow-brutal-lg">
        {/* Search Input Box */}
        <div className="relative flex-1 flex items-center">
          <div className="pl-3 pr-2 flex items-center pointer-events-none text-black shrink-0">
            <Search className="w-5 h-5 stroke-[2.5]" />
          </div>

          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search for any word... (e.g. serendipity, ephemeral)"
            className="w-full py-2 bg-transparent text-black placeholder-slate-400 focus:outline-none text-lg font-bold"
            id="dictionary-search-input"
          />

          {/* Quick Clear Button */}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setIsOpen(true);
              }}
              className="pr-3 flex items-center text-slate-400 hover:text-black"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}
        </div>

        {/* Filter Indicator / Button inside search bar */}
        <div className="flex items-center space-x-1 shrink-0">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-black border-2 border-black font-black rounded-xl px-3 py-2 cursor-pointer transition-colors focus:outline-none"
            title="Filter suggestions"
          >
            <option value="all">🔍 All</option>
            <option value="custom">✨ Rich Words</option>
            <option value="history">⏳ History</option>
          </select>
        </div>
      </form>

      {/* Suggestion Dropdown */}
      {isOpen && (
        <div className="absolute w-full mt-3 bg-white border-4 border-black rounded-2xl shadow-brutal-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {filteredSuggestions.length > 0 ? (
            <div>
              <div className="px-4 py-2.5 border-b-2 border-black bg-slate-50 flex items-center justify-between">
                <span className="text-xs font-mono font-black text-black uppercase tracking-wider">
                  {!query ? "✨ Recommendations" : "🎯 Suggestions"}
                </span>
                <span className="text-[10px] text-slate-500 font-mono font-bold hidden sm:inline">
                  Use ↑ ↓ to navigate, Enter to select
                </span>
              </div>
              <ul className="divide-y-2 divide-black/10">
                {filteredSuggestions.map((item, index) => (
                  <li key={`${item.word}-${index}`}>
                    <button
                      type="button"
                      onClick={() => handleSuggestionClick(item.word)}
                      className={`w-full px-4 py-3 text-left flex items-center justify-between text-base font-bold transition-colors ${
                        activeSuggestionIndex === index
                          ? "bg-indigo-500 text-white"
                          : "text-slate-800 hover:bg-slate-50 hover:text-black"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {item.type === "history" ? (
                          <History className={`w-4 h-4 shrink-0 ${activeSuggestionIndex === index ? "text-white" : "text-slate-500"}`} />
                        ) : item.type === "custom" ? (
                          <Sparkles className={`w-4 h-4 shrink-0 ${activeSuggestionIndex === index ? "text-white" : "text-amber-500"}`} />
                        ) : (
                          <Search className={`w-4 h-4 shrink-0 ${activeSuggestionIndex === index ? "text-white" : "text-slate-500"}`} />
                        )}
                        <span className="truncate capitalize">{item.word}</span>
                      </div>
                      <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full border-2 ${
                        activeSuggestionIndex === index
                          ? "bg-white text-black border-black"
                          : "bg-slate-100 text-slate-700 border-transparent"
                      } uppercase`}>
                        {item.type === "custom" ? "Rich Word" : item.type === "history" ? "History" : "API"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            query && (
              <div className="p-4 text-center text-sm font-bold text-slate-500">
                Press <span className="font-extrabold text-black">Enter</span> to lookup{" "}
                <span className="font-serif italic text-indigo-600">"{query}"</span>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

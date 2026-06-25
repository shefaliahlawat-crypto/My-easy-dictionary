/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Compass,
  Bookmark,
  Sparkles,
  ArrowRight,
  Grid,
  List,
  Search,
  Filter,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import { WordEntry } from "../types";
import { offlineDictionary } from "../data/offlineDictionary";

interface VocabularyDeckProps {
  onSelectWord: (word: string) => void;
  bookmarkedWords: { [word: string]: boolean };
  onToggleBookmark: (word: string) => void;
}

export default function VocabularyDeck({
  onSelectWord,
  bookmarkedWords,
  onToggleBookmark,
}: VocabularyDeckProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [partOfSpeechFilter, setPartOfSpeechFilter] = useState<string>("all");
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [layoutMode, setLayoutMode] = useState<"grid" | "list">("grid");

  const words = Object.values(offlineDictionary);

  // Filter the list of offline words
  const filteredWords = words.filter((wordEntry) => {
    const matchesSearch =
      wordEntry.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wordEntry.meanings.some((m) =>
        m.definitions.some((d) => d.definition.toLowerCase().includes(searchQuery.toLowerCase()))
      );

    const matchesPOS =
      partOfSpeechFilter === "all" ||
      wordEntry.meanings.some((m) => m.partOfSpeech.toLowerCase() === partOfSpeechFilter.toLowerCase());

    const matchesBookmark = !onlyBookmarked || bookmarkedWords[wordEntry.word];

    return matchesSearch && matchesPOS && matchesBookmark;
  });

  // Get distinct parts of speech for filtering
  const allPartsOfSpeech = Array.from(
    new Set(words.flatMap((w) => w.meanings.map((m) => m.partOfSpeech.toLowerCase())))
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Search and Filters toolbar */}
      <div className="bg-white border-4 border-black rounded-3xl p-4 md:p-6 shadow-brutal-md flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-black stroke-[2.5]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search deck..."
            className="w-full pl-10 pr-4 py-2 bg-slate-100 hover:bg-slate-50 text-black placeholder-slate-400 rounded-xl border-2 border-black focus:outline-none focus:bg-white text-sm font-bold"
            id="vocabulary-deck-search"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Part of Speech Filter */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 border-2 border-black rounded-xl p-1">
            <button
              onClick={() => setPartOfSpeechFilter("all")}
              className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all ${
                partOfSpeechFilter === "all"
                  ? "bg-indigo-500 text-white border border-black shadow-brutal-sm"
                  : "text-slate-700 hover:text-black hover:bg-slate-200"
              }`}
            >
              All POS
            </button>
            {allPartsOfSpeech.map((pos) => (
              <button
                key={pos}
                onClick={() => setPartOfSpeechFilter(pos)}
                className={`px-3 py-1.5 text-xs font-black rounded-lg capitalize transition-all ${
                  partOfSpeechFilter === pos
                    ? "bg-indigo-500 text-white border border-black shadow-brutal-sm"
                    : "text-slate-700 hover:text-black hover:bg-slate-200"
                }`}
              >
                {pos}
              </button>
            ))}
          </div>

          {/* Bookmarks Toggle button */}
          <button
            onClick={() => setOnlyBookmarked(!onlyBookmarked)}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl border-2 border-black text-xs font-black transition-all shadow-brutal-sm active-brutal ${
              onlyBookmarked
                ? "bg-amber-300 text-black"
                : "bg-white text-slate-700 hover:bg-slate-50 hover:text-black"
            }`}
          >
            <Bookmark className={`w-4 h-4 ${onlyBookmarked ? "fill-black text-black" : ""}`} />
            <span>Bookmarks</span>
          </button>

          {/* Layout buttons */}
          <div className="h-6 w-0.5 bg-black hidden sm:inline" />
          <div className="hidden sm:flex items-center bg-slate-100 border-2 border-black rounded-xl p-0.5">
            <button
              onClick={() => setLayoutMode("grid")}
              className={`p-1.5 rounded-lg transition-all ${
                layoutMode === "grid" ? "bg-white text-black border border-black shadow-brutal-sm" : "text-slate-500 hover:text-black"
              }`}
              title="Grid Layout"
            >
              <Grid className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              onClick={() => setLayoutMode("list")}
              className={`p-1.5 rounded-lg transition-all ${
                layoutMode === "list" ? "bg-white text-black border border-black shadow-brutal-sm" : "text-slate-500 hover:text-black"
              }`}
              title="List Layout"
            >
              <List className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* Words display area */}
      {filteredWords.length > 0 ? (
        <div
          className={
            layoutMode === "grid"
              ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-6"
          }
        >
          {filteredWords.map((wordEntry, index) => {
            const firstMeaning = wordEntry.meanings[0];
            const firstDefinition = firstMeaning?.definitions[0];
            const isSaved = bookmarkedWords[wordEntry.word];

            return (
              <div
                key={wordEntry.word}
                className={`bg-white border-4 border-black rounded-3xl overflow-hidden shadow-brutal-md transition-all duration-300 hover:shadow-brutal-lg hover:-translate-y-0.5 flex ${
                  layoutMode === "grid" ? "flex-col h-full" : "flex-col md:flex-row items-stretch"
                }`}
              >
                {/* Image top or left */}
                {wordEntry.image && (
                  <div
                    onClick={() => onSelectWord(wordEntry.word)}
                    className={`relative cursor-pointer overflow-hidden bg-slate-100 shrink-0 border-black ${
                      layoutMode === "grid" ? "aspect-16/10 border-b-4" : "aspect-16/10 md:w-60 md:aspect-auto border-b-4 md:border-b-0 md:border-r-4"
                    }`}
                  >
                    <img
                      src={wordEntry.image.url}
                      alt={wordEntry.word}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  </div>
                )}

                {/* Content body */}
                <div className="p-5 flex-1 flex flex-col justify-between bg-white">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-500 font-mono text-xs font-bold">
                          {wordEntry.phonetic}
                        </span>
                        {firstMeaning && (
                          <span className="text-[10px] bg-amber-100 border border-black text-black px-2 py-0.5 rounded font-mono font-black capitalize shadow-brutal-sm">
                            {firstMeaning.partOfSpeech}
                          </span>
                        )}
                      </div>

                      {/* Card Bookmark button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBookmark(wordEntry.word);
                        }}
                        className={`p-1.5 rounded-xl border-2 border-black transition-all shadow-brutal-sm active-brutal ${
                          isSaved
                            ? "bg-amber-300 text-black"
                            : "bg-white text-slate-400 hover:text-black hover:bg-slate-100"
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? "fill-black text-black" : ""}`} />
                      </button>
                    </div>

                    <h4
                      onClick={() => onSelectWord(wordEntry.word)}
                      className="font-serif text-2xl font-black tracking-tight text-black cursor-pointer hover:text-indigo-600 transition-colors capitalize mb-2"
                    >
                      {wordEntry.word}
                    </h4>

                    <p className="text-slate-800 text-sm leading-relaxed line-clamp-3 mb-4 italic font-medium">
                      "{firstDefinition?.definition}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t-2 border-black mt-4">
                    <span className="text-[9px] font-mono text-black bg-amber-100 border-2 border-black px-1.5 py-0.5 rounded uppercase font-black flex items-center space-x-1 shadow-brutal-sm">
                      <Sparkles className="w-3 h-3 text-black" />
                      <span>Rich word</span>
                    </span>
                    <button
                      onClick={() => onSelectWord(wordEntry.word)}
                      className="text-xs bg-indigo-500 text-white border-2 border-black rounded-xl px-3 py-1.5 font-black flex items-center space-x-1 shadow-brutal-sm active-brutal transition-all"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border-4 border-black rounded-3xl p-12 text-center max-w-md mx-auto space-y-4 shadow-brutal-lg">
          <HelpCircle className="w-12 h-12 text-indigo-500 mx-auto stroke-[2.5]" />
          <div>
            <h3 className="font-serif text-2xl font-black text-black">No words found</h3>
            <p className="text-slate-500 text-xs mt-2 font-bold leading-relaxed">
              No rich dictionary items match your current filter criteria or search query.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery("");
              setPartOfSpeechFilter("all");
              setOnlyBookmarked(false);
            }}
            className="text-xs bg-indigo-500 text-white border-2 border-black font-black px-4 py-2 rounded-xl shadow-brutal-sm active-brutal transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

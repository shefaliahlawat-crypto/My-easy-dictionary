/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Volume2,
  VolumeX,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  ExternalLink,
  MessageSquareCode,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  BookOpen,
  ArrowRightLeft
} from "lucide-react";
import { WordEntry } from "../types";

interface WordDetailProps {
  wordEntry: WordEntry;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onSearchWord: (word: string) => void;
  isOnline: boolean;
  onSaveNotes: (notes: string) => void;
}

export default function WordDetail({
  wordEntry,
  isBookmarked,
  onToggleBookmark,
  onSearchWord,
  isOnline,
  onSaveNotes,
}: WordDetailProps) {
  const [activeTab, setActiveTab] = useState<"meanings" | "thesaurus" | "visual">("meanings");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [notes, setNotes] = useState(wordEntry.personalNotes || "");

  // Update notes if wordEntry changes
  useEffect(() => {
    setNotes(wordEntry.personalNotes || "");
  }, [wordEntry]);

  // Handle playing audio pronunciation
  const handlePlayAudio = () => {
    // 1. Try to find the audio from phonetics
    const phoneticAudio = wordEntry.phonetics?.find((p) => p.audio && p.audio.trim() !== "");

    if (phoneticAudio?.audio) {
      setIsPlayingAudio(true);
      const audio = new Audio(phoneticAudio.audio);
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => {
        // Fallback to speech synthesis if audio link fails
        speakFallback();
      };
      audio.play().catch(() => speakFallback());
    } else {
      // 2. Fallback to Web Speech API SpeechSynthesis
      speakFallback();
    }
  };

  const speakFallback = () => {
    if ("speechSynthesis" in window) {
      setIsPlayingAudio(true);
      // Cancel existing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(wordEntry.word);
      utterance.lang = "en-US";
      utterance.rate = speechRate;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported in this browser.");
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotes(val);
    onSaveNotes(val);
  };

  // Extract all synonyms and antonyms from all meanings
  const allSynonyms = Array.from(
    new Set([
      ...(wordEntry.meanings.flatMap((m) => m.synonyms || [])),
      ...(wordEntry.meanings.flatMap((m) => m.definitions.flatMap((d) => d.synonyms || []))),
    ])
  ).filter(Boolean);

  const allAntonyms = Array.from(
    new Set([
      ...(wordEntry.meanings.flatMap((m) => m.antonyms || [])),
      ...(wordEntry.meanings.flatMap((m) => m.definitions.flatMap((d) => d.antonyms || []))),
    ])
  ).filter(Boolean);

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-3xl border-4 border-black shadow-brutal-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Top Banner and Word Title */}
      <div className="p-6 md:p-8 bg-amber-50 border-b-4 border-black">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            {/* Metadata Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {wordEntry.isCustom && (
                <span className="bg-amber-300 text-black border-2 border-black text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-brutal-sm">
                  <Sparkles className="w-3.5 h-3.5 text-black" />
                  <span>Rich Offline Word</span>
                </span>
              )}
              {wordEntry.isOfflineCached && (
                <span className="bg-emerald-100 text-emerald-800 border-2 border-black text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-lg shadow-brutal-sm">
                  Saved Offline Cache
                </span>
              )}
              {!wordEntry.isCustom && !wordEntry.isOfflineCached && (
                <span className="bg-blue-100 text-blue-800 border-2 border-black text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-lg shadow-brutal-sm">
                  Live Dictionary API
                </span>
              )}
            </div>

            {/* Word Name */}
            <h2 className="font-serif text-5xl font-black tracking-tight text-black capitalize">
              {wordEntry.word}
            </h2>

            {/* Phonetics and Audio Pronounce */}
            <div className="flex items-center space-x-3 mt-2">
              {wordEntry.phonetic && (
                <span className="font-mono text-lg text-slate-600 font-bold">
                  {wordEntry.phonetic}
                </span>
              )}
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePlayAudio}
                  disabled={isPlayingAudio}
                  className={`p-2.5 rounded-full border-2 border-black shadow-brutal-sm active-brutal transition-all flex items-center justify-center ${
                    isPlayingAudio
                      ? "bg-black text-white"
                      : "bg-white hover:bg-slate-100 text-black"
                  }`}
                  title="Pronounce word"
                >
                  {isPlayingAudio ? (
                    <VolumeX className="w-4 h-4 animate-pulse" />
                  ) : (
                    <Volume2 className="w-4 h-4 stroke-[2.5]" />
                  )}
                </button>

                {/* Voice Speed Controls for speech synthesis */}
                <select
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  className="text-xs font-mono font-black bg-white border-2 border-black text-black px-2 py-1 rounded-lg focus:outline-none cursor-pointer"
                  title="Voice speed"
                >
                  <option value="0.75">0.75x</option>
                  <option value="1.0">1.0x</option>
                  <option value="1.25">1.25x</option>
                </select>
              </div>
            </div>
          </div>

          {/* Word Actions */}
          <div className="flex items-center space-x-2 shrink-0 md:self-start">
            <button
              onClick={onToggleBookmark}
              className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border-2 border-black font-black text-sm shadow-brutal-sm active-brutal transition-all ${
                isBookmarked
                  ? "bg-amber-300 text-black"
                  : "bg-white text-slate-700 hover:bg-slate-50 hover:text-black"
              }`}
            >
              {isBookmarked ? (
                <>
                  <BookmarkCheck className="w-4 h-4 text-black fill-black" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>Save word</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex flex-wrap border-b-4 border-black bg-slate-50 p-3 gap-2">
        <button
          onClick={() => setActiveTab("meanings")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border-2 font-black text-sm transition-all ${
            activeTab === "meanings"
              ? "bg-indigo-500 text-white border-black shadow-brutal-sm -translate-y-0.5"
              : "bg-white border-transparent text-slate-700 hover:border-black hover:bg-slate-50"
          }`}
        >
          <BookOpen className="w-4 h-4 stroke-[2.5]" />
          <span>Definitions</span>
        </button>

        <button
          onClick={() => setActiveTab("thesaurus")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border-2 font-black text-sm transition-all ${
            activeTab === "thesaurus"
              ? "bg-indigo-500 text-white border-black shadow-brutal-sm -translate-y-0.5"
              : "bg-white border-transparent text-slate-700 hover:border-black hover:bg-slate-50"
          }`}
        >
          <ArrowRightLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Synonyms ({allSynonyms.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("visual")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border-2 font-black text-sm transition-all ${
            activeTab === "visual"
              ? "bg-indigo-500 text-white border-black shadow-brutal-sm -translate-y-0.5"
              : "bg-white border-transparent text-slate-700 hover:border-black hover:bg-slate-50"
          }`}
        >
          <ImageIcon className="w-4 h-4 stroke-[2.5]" />
          <span>Visual & Notes</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-6 md:p-8">
        {/* definitions panel */}
        {activeTab === "meanings" && (
          <div className="space-y-8">
            {wordEntry.meanings.map((meaning, mIdx) => (
              <div key={mIdx} className="space-y-4">
                {/* Part of Speech Header */}
                <div className="flex items-center space-x-3">
                  <span className="font-serif italic font-black text-xl text-black capitalize bg-amber-100 border-2 border-black px-3 py-1 rounded-xl shadow-brutal-sm">
                    {meaning.partOfSpeech}
                  </span>
                  <div className="h-1 flex-1 bg-black rounded-full" />
                </div>

                {/* Meanings / Definitions List */}
                <ol className="space-y-4 pl-1">
                  {meaning.definitions.map((def, dIdx) => (
                    <li key={dIdx} className="flex items-start space-x-3 group">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 border-2 border-black text-black text-xs font-mono font-black shrink-0 mt-0.5 shadow-brutal-sm group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                        {dIdx + 1}
                      </span>
                      <div className="space-y-2 flex-1">
                        <p className="text-black text-base font-bold leading-relaxed">
                          {def.definition}
                        </p>
                        
                        {def.example && (
                          <blockquote className="border-l-4 border-black pl-3.5 py-1 text-sm text-slate-700 font-sans font-medium italic bg-slate-50 p-3 rounded-r-xl border-y-2 border-r-2 border-black/10">
                            "{def.example}"
                          </blockquote>
                        )}

                        {/* Inline Synonyms for specific definition */}
                        {def.synonyms && def.synonyms.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1 items-center">
                            <span className="text-[10px] text-slate-400 uppercase font-mono font-black mr-1">
                              Synonyms:
                            </span>
                            {def.synonyms.slice(0, 4).map((syn) => (
                              <button
                                key={syn}
                                onClick={() => onSearchWord(syn)}
                                className="text-xs bg-white hover:bg-slate-100 text-black border-2 border-black font-black rounded px-2.5 py-1 transition-colors shadow-brutal-sm active-brutal"
                              >
                                {syn}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        )}

        {/* thesaurus panel */}
        {activeTab === "thesaurus" && (
          <div className="space-y-8">
            {/* Synonyms Cloud */}
            <div>
              <h4 className="font-serif text-xl font-black text-black mb-4 flex items-center space-x-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500 border border-black shadow-brutal-sm" />
                <span>Synonyms (Similar Meanings)</span>
              </h4>
              
              {allSynonyms.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {allSynonyms.map((syn) => (
                    <button
                      key={syn}
                      onClick={() => onSearchWord(syn)}
                      className="px-4 py-2 text-sm bg-emerald-100 hover:bg-emerald-200 text-black border-2 border-black rounded-xl transition-all font-black hover:-translate-y-0.5 shadow-brutal-sm active-brutal"
                    >
                      {syn}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm italic pl-4">
                  No synonyms listed for this word entry.
                </p>
              )}
            </div>

            {/* Antonyms Cloud */}
            <div className="pt-4">
              <h4 className="font-serif text-xl font-black text-black mb-4 flex items-center space-x-2">
                <span className="h-3 w-3 rounded-full bg-rose-400 border border-black shadow-brutal-sm" />
                <span>Antonyms (Opposite Meanings)</span>
              </h4>

              {allAntonyms.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {allAntonyms.map((ant) => (
                    <button
                      key={ant}
                      onClick={() => onSearchWord(ant)}
                      className="px-4 py-2 text-sm bg-rose-100 hover:bg-rose-200 text-black border-2 border-black rounded-xl transition-all font-black hover:-translate-y-0.5 shadow-brutal-sm active-brutal"
                    >
                      {ant}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm italic pl-4">
                  No antonyms listed for this word entry.
                </p>
              )}
            </div>
          </div>
        )}

        {/* visual & notes panel */}
        {activeTab === "visual" && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Visual illustration / Image */}
            <div className="space-y-4">
              <h4 className="font-serif text-xl font-black text-black flex items-center space-x-2">
                <ImageIcon className="w-5 h-5 text-black stroke-[2.5]" />
                <span>Visual Reference</span>
              </h4>

              {wordEntry.image ? (
                <div className="border-4 border-black rounded-2xl overflow-hidden shadow-brutal-md bg-slate-50">
                  <div className="relative aspect-4/3 overflow-hidden border-b-2 border-black bg-slate-950">
                    <img
                      src={wordEntry.image.url}
                      alt={wordEntry.word}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="p-4 space-y-1 bg-white">
                    <p className="font-serif font-black text-sm text-black">
                      {wordEntry.image.title || `Visual representation of ${wordEntry.word}`}
                    </p>
                    {wordEntry.image.description && (
                      <p className="text-slate-700 text-xs font-medium leading-relaxed line-clamp-2">
                        {wordEntry.image.description}
                      </p>
                    )}
                    {wordEntry.image.author && (
                      <p className="text-[10px] font-mono font-bold text-slate-400">
                        Image by: {wordEntry.image.author}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border-4 border-dashed border-slate-300 rounded-2xl aspect-4/3 flex flex-col items-center justify-center p-6 text-center bg-slate-50 text-slate-400">
                  <ImageIcon className="w-8 h-8 mb-2 text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">No visual image currently available.</p>
                  <p className="text-[10px] leading-relaxed mt-1 max-w-[200px]">
                    Images are retrieved automatically from Unsplash when available.
                  </p>
                </div>
              )}
            </div>

            {/* Note taking panel */}
            <div className="space-y-4">
              <h4 className="font-serif text-xl font-black text-black flex items-center space-x-2">
                <MessageSquareCode className="w-5 h-5 text-black stroke-[2.5]" />
                <span>My Memory Notes</span>
              </h4>

              <div className="flex flex-col h-[280px]">
                <textarea
                  value={notes}
                  onChange={handleNotesChange}
                  placeholder="Write your own personalized memory tricks, sentence creations, or custom dictionary notes here..."
                  className="w-full flex-1 p-4 border-4 border-black bg-white rounded-2xl shadow-inner focus:outline-none focus:ring-0 text-sm leading-relaxed text-black font-bold resize-none placeholder-slate-400"
                />
                <span className="text-[10px] font-mono font-bold text-slate-400 mt-2 text-right">
                  Notes are auto-saved locally and stored offline.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer references */}
      {wordEntry.sourceUrls && wordEntry.sourceUrls.length > 0 && (
        <div className="bg-slate-50 border-t-4 border-black p-4 px-6 md:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="text-xs font-mono font-black text-black uppercase tracking-widest">
            Verification & Readings
          </span>
          <div className="flex flex-wrap gap-3">
            {wordEntry.sourceUrls.map((url, idx) => (
              <a
                key={idx}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-black hover:text-indigo-600 flex items-center space-x-1 underline font-black"
              >
                <span>Read Dictionary Source</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

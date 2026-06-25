/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BookOpen, Wifi, WifiOff, Bookmark, BrainCircuit, Compass } from "lucide-react";

interface HeaderProps {
  isOnline: boolean;
  activeTab: "search" | "explore" | "flashcards";
  setActiveTab: (tab: "search" | "explore" | "flashcards") => void;
  bookmarkedCount: number;
}

export default function Header({
  isOnline,
  activeTab,
  setActiveTab,
  bookmarkedCount,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-slate-100/70 backdrop-blur-md py-4 px-4">
      <div className="max-w-6xl mx-auto bg-white border-4 border-black rounded-2xl px-4 md:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4 shadow-brutal-md">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("search")}>
          <div className="p-2 bg-black text-white border-2 border-black rounded-xl shadow-brutal-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-black tracking-tight text-black">
              Lexicon
            </h1>
            <p className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest">
              Offline Dictionary
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1.5 bg-slate-100 p-1.5 border-2 border-black rounded-xl">
          <button
            onClick={() => setActiveTab("search")}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-black transition-all ${
              activeTab === "search"
                ? "bg-indigo-500 text-white border-2 border-black shadow-brutal-sm translate-y-[-1px]"
                : "text-slate-700 hover:text-black hover:bg-slate-200 border-2 border-transparent"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
          </button>

          <button
            onClick={() => setActiveTab("explore")}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-black transition-all ${
              activeTab === "explore"
                ? "bg-indigo-500 text-white border-2 border-black shadow-brutal-sm translate-y-[-1px]"
                : "text-slate-700 hover:text-black hover:bg-slate-200 border-2 border-transparent"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span className="hidden sm:inline">Explore</span>
          </button>

          <button
            onClick={() => setActiveTab("flashcards")}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-black transition-all ${
              activeTab === "flashcards"
                ? "bg-indigo-500 text-white border-2 border-black shadow-brutal-sm translate-y-[-1px]"
                : "text-slate-700 hover:text-black hover:bg-slate-200 border-2 border-transparent"
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            <span className="hidden sm:inline">Learn</span>
            {bookmarkedCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-300 text-black border border-black text-[10px] font-black leading-none ml-1">
                {bookmarkedCount}
              </span>
            )}
          </button>
        </nav>

        {/* Connection Status */}
        <div className="flex items-center space-x-4">
          <div
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-black border-2 border-black shadow-brutal-sm transition-all duration-300 ${
              isOnline
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-800"
            }`}
            title={isOnline ? "App is online. Fetching from public APIs." : "App is offline. Using local database."}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-700" />
                <span>Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-700" />
                <span>Offline</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

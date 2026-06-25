/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sparkles, Calendar, ArrowRight } from "lucide-react";
import { WordEntry } from "../types";
import { offlineDictionary } from "../data/offlineDictionary";

interface WordOfTheDayProps {
  onSelectWord: (word: string) => void;
}

export default function WordOfTheDay({ onSelectWord }: WordOfTheDayProps) {
  // Select a word of the day based on the calendar date
  const words = Object.values(offlineDictionary);
  const today = new Date();
  const index = (today.getDate() + today.getMonth() * 31) % words.length;
  const wordEntry = words[index];

  if (!wordEntry) return null;

  const firstMeaning = wordEntry.meanings[0];
  const firstDefinition = firstMeaning?.definitions[0];

  return (
    <div className="w-full max-w-2xl mx-auto bg-white text-black rounded-3xl overflow-hidden shadow-brutal-lg border-4 border-black transition-all duration-300 hover:shadow-brutal-xl hover:-translate-y-0.5">
      <div className="md:flex h-full">
        {/* Left Visual Area */}
        {wordEntry.image && (
          <div className="relative md:w-2/5 h-48 md:h-auto overflow-hidden shrink-0 border-b-4 md:border-b-0 md:border-r-4 border-black bg-slate-900">
            <img
              src={wordEntry.image.url}
              alt={wordEntry.word}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105 opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute top-4 left-4 bg-amber-300 text-black border-2 border-black px-2.5 py-1 rounded-xl text-xs font-mono uppercase font-black tracking-wider flex items-center space-x-1 shadow-brutal-sm">
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>Word of the Day</span>
            </div>
          </div>
        )}

        {/* Right content details */}
        <div className="p-6 md:p-8 flex-1 flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-center space-x-2 text-slate-500 text-xs font-mono font-bold mb-3">
              <Calendar className="w-3.5 h-3.5 text-black" />
              <span>
                {today.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            <h3 className="font-serif text-4xl font-black tracking-tight text-black capitalize mb-1">
              {wordEntry.word}
            </h3>

            <p className="font-mono text-base text-slate-500 mb-4">{wordEntry.phonetic}</p>

            {firstMeaning && (
              <div className="space-y-2">
                <div>
                  <span className="inline-block text-xs font-mono font-black text-black bg-amber-100 border-2 border-black px-2 py-0.5 rounded italic capitalize">
                    {firstMeaning.partOfSpeech}
                  </span>
                </div>
                <p className="text-slate-800 text-sm leading-relaxed italic line-clamp-2">
                  "{firstDefinition?.definition}"
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t-2 border-black flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
              Enrich your vocabulary
            </span>
            <button
              onClick={() => onSelectWord(wordEntry.word)}
              className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-500 text-white border-2 border-black rounded-xl text-xs font-black shadow-brutal-sm active-brutal transition-all"
            >
              <span>Explore definition</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

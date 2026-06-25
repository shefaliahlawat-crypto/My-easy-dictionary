/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  BrainCircuit,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Sparkles,
  Award,
  BookOpen,
  ArrowRight,
  Smile,
  Frown,
} from "lucide-react";
import { WordEntry } from "../types";
import { offlineDictionary } from "../data/offlineDictionary";

interface FlashcardsProps {
  bookmarkedWordsList: WordEntry[];
  onSelectWord: (word: string) => void;
}

export default function Flashcards({
  bookmarkedWordsList,
  onSelectWord,
}: FlashcardsProps) {
  const [deck, setDeck] = useState<WordEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [deckType, setDeckType] = useState<"bookmarks" | "all">("all");
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [completed, setCompleted] = useState(false);

  // Initialize deck when tab is loaded or deck type switches
  useEffect(() => {
    initializeDeck();
  }, [deckType, bookmarkedWordsList]);

  const initializeDeck = () => {
    let sourceWords: WordEntry[] = [];
    if (deckType === "bookmarks" && bookmarkedWordsList.length > 0) {
      sourceWords = [...bookmarkedWordsList];
    } else {
      sourceWords = Object.values(offlineDictionary);
    }

    // Shuffle the list
    const shuffled = [...sourceWords].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setScore({ correct: 0, incorrect: 0 });
    setCompleted(false);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex < deck.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setCompleted(true);
      }
    }, 150);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex((prev) => prev - 1);
      }, 150);
    }
  };

  const handleMark = (gotRight: boolean) => {
    if (gotRight) {
      setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setScore((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }
    handleNext();
  };

  const activeWord = deck[currentIndex];

  if (deck.length === 0) {
    return (
      <div className="w-full max-w-xl mx-auto bg-white border-4 border-black rounded-3xl p-8 text-center shadow-brutal-lg space-y-4">
        <BrainCircuit className="w-12 h-12 text-indigo-500 mx-auto stroke-[2.5]" />
        <div>
          <h3 className="font-serif text-2xl font-black text-black">Your Bookmarks Deck is Empty</h3>
          <p className="text-slate-500 text-xs mt-2 font-bold leading-relaxed">
            You haven't bookmarked any words yet. Save words from the search or explore tabs to build your personalized study deck.
          </p>
        </div>
        <button
          onClick={() => setDeckType("all")}
          className="text-xs bg-indigo-500 text-white border-2 border-black font-black px-4 py-2.5 rounded-xl shadow-brutal-sm active-brutal transition-all inline-flex items-center space-x-1.5"
        >
          <span>Study All 20 Rich Words Instead</span>
          <ArrowRight className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
    );
  }

  // Blank out the word inside its example sentence to make a "quiz"
  const getBlankedSentence = (sentence: string, word: string) => {
    if (!sentence) return "";
    const regex = new RegExp(`(${word})`, "gi");
    return sentence.replace(regex, "________");
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* Deck Selector header */}
      <div className="flex justify-between items-center bg-slate-100 p-1.5 border-2 border-black rounded-2xl">
        <button
          onClick={() => {
            setDeckType("all");
            initializeDeck();
          }}
          className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
            deckType === "all" ? "bg-indigo-500 text-white border border-black shadow-brutal-sm" : "text-slate-700 hover:text-black hover:bg-slate-200"
          }`}
        >
          Mastery Deck ({Object.keys(offlineDictionary).length} words)
        </button>
        <button
          onClick={() => {
            setDeckType("bookmarks");
            initializeDeck();
          }}
          disabled={bookmarkedWordsList.length === 0}
          className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
            bookmarkedWordsList.length === 0 ? "opacity-50 cursor-not-allowed text-slate-400" : ""
          } ${deckType === "bookmarks" ? "bg-indigo-500 text-white border border-black shadow-brutal-sm" : "text-slate-700 hover:text-black hover:bg-slate-200"}`}
        >
          My Bookmarks ({bookmarkedWordsList.length})
        </button>
      </div>

      {/* Main Flashcard view */}
      {!completed && activeWord ? (
        <div className="space-y-6">
          {/* Card Deck progress bar */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 font-bold">
            <span>
              Card {currentIndex + 1} of {deck.length}
            </span>
            <div className="flex items-center space-x-4">
              <span className="text-emerald-800 bg-emerald-100 border-2 border-black rounded-full px-2.5 py-1 font-black flex items-center space-x-1 shadow-brutal-sm">
                <Smile className="w-3.5 h-3.5 text-emerald-850" /> <span>{score.correct}</span>
              </span>
              <span className="text-rose-800 bg-rose-100 border-2 border-black rounded-full px-2.5 py-1 font-black flex items-center space-x-1 shadow-brutal-sm">
                <Frown className="w-3.5 h-3.5 text-rose-850" /> <span>{score.incorrect}</span>
              </span>
            </div>
          </div>

          <div className="w-full bg-slate-100 border-2 border-black h-4 rounded-full overflow-hidden shadow-brutal-sm">
            <div
              className="bg-indigo-500 h-full border-r-2 border-black transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / deck.length) * 100}%` }}
            />
          </div>

          {/* Flashcard Body - Double sided flip animation */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="perspective-1000 w-full aspect-5/4 cursor-pointer"
          >
            <div
              className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
                isFlipped ? "rotate-y-180" : ""
              }`}
            >
              {/* SIDE A: Front (Word Name & Hint) */}
              <div className="absolute inset-0 backface-hidden bg-white border-4 border-black shadow-brutal-md rounded-3xl p-6 md:p-8 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-black text-black bg-amber-100 border-2 border-black px-2.5 py-1 rounded-lg shadow-brutal-sm">
                    Front Side (Prompt)
                  </span>
                  <div className="flex items-center space-x-1.5 text-slate-500 text-xs font-mono font-bold">
                    <RotateCw className="w-3.5 h-3.5 text-black" />
                    <span>Click to flip</span>
                  </div>
                </div>

                <div className="text-center space-y-3">
                  <h3 className="font-serif text-4xl md:text-5xl font-black text-black tracking-tight capitalize select-none">
                    {activeWord.word}
                  </h3>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-slate-500 font-mono text-base font-bold">
                      {activeWord.phonetic}
                    </span>
                    {activeWord.meanings[0] && (
                      <span className="text-[10px] bg-amber-100 border border-black text-black px-2 py-0.5 rounded font-mono italic select-none font-black shadow-brutal-sm">
                        {activeWord.meanings[0].partOfSpeech}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-center">
                  {activeWord.meanings[0]?.definitions[0]?.example ? (
                    <div className="max-w-md mx-auto space-y-1">
                      <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">
                        Context Sentence Clue:
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed italic line-clamp-2 select-none font-bold">
                        "{getBlankedSentence(
                          activeWord.meanings[0].definitions[0].example,
                          activeWord.word
                        )}"
                      </p>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 font-sans italic font-bold">
                      Click the card to reveal definitions, synonyms, and examples!
                    </span>
                  )}
                </div>
              </div>

              {/* SIDE B: Back (Definitions and detail card) */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 bg-stone-900 text-stone-100 shadow-brutal-md border-4 border-black rounded-3xl p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono uppercase font-black text-white bg-slate-800 border-2 border-black px-2.5 py-1 rounded-lg">
                      Back Side (Definition)
                    </span>
                    <span className="text-xs text-stone-400 font-mono font-bold">Click to flip back</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-baseline space-x-2">
                      <h4 className="font-serif text-3xl font-black tracking-tight text-white capitalize">
                        {activeWord.word}
                      </h4>
                      <span className="text-xs font-mono text-amber-300 italic font-black">
                        {activeWord.meanings[0]?.partOfSpeech}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-stone-200 leading-relaxed font-sans font-bold">
                        {activeWord.meanings[0]?.definitions[0]?.definition}
                      </p>

                      {activeWord.meanings[0]?.definitions[0]?.example && (
                        <blockquote className="border-l-4 border-amber-300 pl-3.5 py-1 text-xs text-stone-300 italic font-serif">
                          "{activeWord.meanings[0].definitions[0].example}"
                        </blockquote>
                      )}
                    </div>

                    {/* Quick Synonyms */}
                    {activeWord.meanings[0]?.definitions[0]?.synonyms &&
                      activeWord.meanings[0].definitions[0].synonyms.length > 0 && (
                        <div className="pt-2">
                          <span className="text-[10px] font-mono text-stone-500 uppercase block mb-1 font-black">
                            Synonyms:
                          </span>
                          <p className="text-xs text-stone-300 font-sans font-medium">
                            {activeWord.meanings[0].definitions[0].synonyms.slice(0, 3).join(", ")}
                          </p>
                        </div>
                      )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-stone-800 mt-6 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectWord(activeWord.word);
                    }}
                    className="text-xs text-amber-300 hover:text-amber-200 flex items-center space-x-1 underline font-black"
                  >
                    <span>Full Dictionary Profile</span>
                    <BookOpen className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[9px] font-mono text-stone-500 uppercase">
                    Verify definition before matching
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Got it Right / Wrong manual marking buttons */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => handleMark(false)}
              className="flex-1 py-3 border-4 border-black hover:bg-rose-50 text-black font-black rounded-2xl text-sm transition-all flex items-center justify-center space-x-2 shadow-brutal-sm active-brutal"
            >
              <Frown className="w-4 h-4 text-rose-500 stroke-[2.5]" />
              <span>Needs Practice</span>
            </button>
            <button
              onClick={() => handleMark(true)}
              className="flex-1 py-3 bg-indigo-500 border-4 border-black text-white font-black rounded-2xl text-sm transition-all flex items-center justify-center space-x-2 shadow-brutal-sm active-brutal"
            >
              <Smile className="w-4 h-4 text-emerald-300 stroke-[2.5]" />
              <span>Got It Right!</span>
            </button>
          </div>
        </div>
      ) : (
        /* Celebration Completed View */
        <div className="bg-white border-4 border-black rounded-3xl p-8 text-center shadow-brutal-lg space-y-6 py-12 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto border-4 border-black shadow-brutal-sm">
            <Award className="w-8 h-8 text-black" />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-serif text-3xl font-black text-black">
              Deck Completed!
            </h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed font-bold">
              Wonderful job! You've reviewed all {deck.length} flashcards in this deck. Repetition is the key to deep vocabulary growth.
            </p>
          </div>

          {/* Scores details */}
          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto bg-slate-50 p-4 border-4 border-black rounded-2xl shadow-brutal-md">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">Got Right</span>
              <span className="text-3xl font-black text-emerald-600">{score.correct}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">Needs Practice</span>
              <span className="text-3xl font-black text-rose-500">{score.incorrect}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={initializeDeck}
              className="w-full sm:w-auto text-xs bg-indigo-500 text-white border-2 border-black font-black px-5 py-3 rounded-xl transition-all shadow-brutal-sm active-brutal"
            >
              Study Again (Shuffle)
            </button>
            {deckType === "bookmarks" && (
              <button
                onClick={() => {
                  setDeckType("all");
                  initializeDeck();
                }}
                className="w-full sm:w-auto text-xs bg-white text-black border-2 border-black font-black px-5 py-3 rounded-xl transition-all shadow-brutal-sm active-brutal"
              >
                Study Mastery Deck
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

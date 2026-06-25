/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Phonetic {
  text?: string;
  audio?: string;
  sourceUrl?: string;
}

export interface Definition {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

export interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms?: string[];
  antonyms?: string[];
}

export interface WordImage {
  url: string;
  title?: string;
  description?: string;
  author?: string;
  pageUrl?: string;
}

export interface WordEntry {
  word: string;
  phonetic?: string;
  phonetics?: Phonetic[];
  meanings: Meaning[];
  sourceUrls?: string[];
  image?: WordImage;
  isCustom?: boolean; // True for our rich offline dictionary words
  isOfflineCached?: boolean; // True for dynamically cached words
  lastSearched?: string; // Date searched
  personalNotes?: string; // User personal notes for this word
}

export interface OfflineDb {
  [word: string]: WordEntry;
}

export interface Flashcard {
  id: string;
  word: string;
  definition: string;
  partOfSpeech: string;
  example?: string;
  box: number; // For spaced repetition (Leitner system, e.g., 1 to 5)
  nextReviewDate: string; // ISO string
}

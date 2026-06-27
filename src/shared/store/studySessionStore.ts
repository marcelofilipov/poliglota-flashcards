import {create} from 'zustand';
import {type Card} from '../database/repositories/cardRepository';

interface StudySessionState {
  currentCards: Card[];
  currentIndex: number;
  ratings: Record<number, 0 | 1 | 2 | 3>;
  isFlipped: boolean;

  setCards: (cards: Card[]) => void;
  flipCard: () => void;
  rateCard: (cardId: number, rating: 0 | 1 | 2 | 3) => void;
  nextCard: () => void;
  resetSession: () => void;
}

export const useStudySessionStore = create<StudySessionState>(set => ({
  currentCards: [],
  currentIndex: 0,
  ratings: {},
  isFlipped: false,

  setCards: cards => set({currentCards: cards, currentIndex: 0, ratings: {}, isFlipped: false}),

  flipCard: () => set({isFlipped: true}),

  rateCard: (cardId, rating) =>
    set(state => ({ratings: {...state.ratings, [cardId]: rating}})),

  nextCard: () =>
    set(state => ({
      currentIndex: state.currentIndex + 1,
      isFlipped: false,
    })),

  resetSession: () =>
    set({currentCards: [], currentIndex: 0, ratings: {}, isFlipped: false}),
}));

import {useCallback} from 'react';
import {Alert} from 'react-native';
import {cardRepository} from '../../../shared/database/repositories/cardRepository';
import {calculateNextReview} from '../../../shared/utils/srsAlgorithm';
import {useStudySessionStore} from '../../../shared/store/studySessionStore';

export function useStudySession(languageId: number) {
  const store = useStudySessionStore();

  const loadSession = useCallback(async () => {
    try {
      const due = await cardRepository.findDueByLanguage(languageId);
      const shuffled = [...due].sort(() => Math.random() - 0.5);
      store.setCards(shuffled);
      return shuffled.length;
    } catch (error) {
      console.error('Erro ao carregar sessão de estudo:', error);
      Alert.alert('Erro', 'Não foi possível iniciar a sessão.');
      return 0;
    }
  }, [languageId, store]);

  const rateAndAdvance = useCallback(
    async (rating: 0 | 1 | 2 | 3) => {
      const card = store.currentCards[store.currentIndex];
      if (!card) {
        return;
      }

      try {
        store.rateCard(card.id, rating);
        const result = calculateNextReview(
          {
            interval_days: card.interval_days,
            repetitions: card.repetitions,
            ease_factor: card.ease_factor,
          },
          rating,
        );
        await cardRepository.updateSRS(card.id, result);
      } catch (error) {
        console.error('Erro ao salvar avaliação:', error);
        Alert.alert('Erro', 'Não foi possível salvar a avaliação.');
      }

      store.nextCard();
    },
    [store],
  );

  const isDone = store.currentIndex >= store.currentCards.length && store.currentCards.length > 0;

  const getSessionStats = () => {
    const ratings = store.ratings;
    return {
      studied: Object.keys(ratings).length,
      wrong: Object.values(ratings).filter(r => r === 0).length,
      hard: Object.values(ratings).filter(r => r === 1).length,
      easy: Object.values(ratings).filter(r => r === 2).length,
      veryEasy: Object.values(ratings).filter(r => r === 3).length,
      correct: Object.values(ratings).filter(r => r >= 2).length,
    };
  };

  return {
    cards: store.currentCards,
    currentIndex: store.currentIndex,
    isFlipped: store.isFlipped,
    flipCard: store.flipCard,
    loadSession,
    rateAndAdvance,
    isDone,
    getSessionStats,
    resetSession: store.resetSession,
  };
}

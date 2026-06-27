import {useState, useCallback} from 'react';
import {Alert} from 'react-native';
import {cardRepository, type Card} from '../../../shared/database/repositories/cardRepository';

export function useCards(languageId: number) {
  const [cards, setCards] = useState<Card[]>([]);
  const [dueCount, setDueCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadCards = useCallback(async () => {
    try {
      setLoading(true);
      const [all, due] = await Promise.all([
        cardRepository.findByLanguage(languageId),
        cardRepository.findDueByLanguage(languageId),
      ]);
      setCards(all);
      setDueCount(due.length);
    } catch (error) {
      console.error('Erro ao carregar cartões:', error);
      Alert.alert('Erro', 'Não foi possível carregar os cartões.');
    } finally {
      setLoading(false);
    }
  }, [languageId]);

  const deleteCard = useCallback(
    async (id: number) => {
      try {
        await cardRepository.delete(id);
        await loadCards();
      } catch (error) {
        console.error('Erro ao deletar cartão:', error);
        Alert.alert('Erro', 'Não foi possível deletar o cartão.');
      }
    },
    [loadCards],
  );

  return {cards, dueCount, loading, loadCards, deleteCard};
}

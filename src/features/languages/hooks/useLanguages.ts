import {useState, useCallback} from 'react';
import {Alert} from 'react-native';
import {
  languageRepository,
  type LanguageWithStats,
} from '../../../shared/database/repositories/languageRepository';

export function useLanguages() {
  const [languages, setLanguages] = useState<LanguageWithStats[]>([]);
  const [loading, setLoading] = useState(false);

  const loadLanguages = useCallback(async () => {
    try {
      setLoading(true);
      const data = await languageRepository.findAll();
      setLanguages(data);
    } catch (error) {
      console.error('Erro ao carregar idiomas:', error);
      Alert.alert('Erro', 'Não foi possível carregar os idiomas.');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteLanguage = useCallback(
    async (id: number) => {
      try {
        await languageRepository.delete(id);
        await loadLanguages();
      } catch (error) {
        console.error('Erro ao deletar idioma:', error);
        Alert.alert('Erro', 'Não foi possível deletar o idioma.');
      }
    },
    [loadLanguages],
  );

  return {languages, loading, loadLanguages, deleteLanguage};
}

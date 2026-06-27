import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {type NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ChevronRight} from 'lucide-react-native';
import {type RootStackParamList} from '../../../shared/navigation/RootNavigator.types';
import {languageRepository, type LanguageWithStats} from '../../../shared/database/repositories/languageRepository';
import {wordRepository} from '../../../shared/database/repositories/wordRepository';
import {colors} from '../../../shared/theme/colors';
import {spacing} from '../../../shared/theme/spacing';
import {typography} from '../../../shared/theme/typography';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface LanguageWithWordCount extends LanguageWithStats {
  word_bank_count: number;
}

export default function WordBankScreen() {
  const navigation = useNavigation<Nav>();
  const [languages, setLanguages] = useState<LanguageWithWordCount[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const langs = await languageRepository.findAll();
      const withCounts = await Promise.all(
        langs.map(async lang => {
          const count = await wordRepository.getTotalByLanguage(lang.id);
          return {...lang, word_bank_count: count};
        }),
      );
      setLanguages(withCounts);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  if (loading && languages.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={languages}
        keyExtractor={item => String(item.id)}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              navigation.navigate('WordLists', {
                languageId: item.id,
                languageName: item.name,
              })
            }>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemCount}>
                {item.word_bank_count} {item.word_bank_count === 1 ? 'palavra' : 'palavras'}
              </Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
        contentContainerStyle={languages.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Nenhum idioma cadastrado.</Text>
            <Text style={styles.emptyText}>
              Adicione idiomas na aba Idiomas para usar o banco de palavras.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  list: {paddingVertical: spacing.sm},
  emptyContainer: {flex: 1},
  empty: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl},
  emptyTitle: {...typography.label, color: colors.textPrimary, fontSize: 18, textAlign: 'center'},
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: 10,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemInfo: {flex: 1},
  itemName: {...typography.label, color: colors.textPrimary, fontSize: 16},
  itemCount: {...typography.caption, color: colors.textSecondary, marginTop: 2},
});

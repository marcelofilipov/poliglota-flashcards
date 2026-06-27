import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect, useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import {type NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Plus, ClipboardPaste, FileText, Trash2} from 'lucide-react-native';
import {type RootStackParamList} from '../../../shared/navigation/RootNavigator.types';
import {wordRepository, type Word} from '../../../shared/database/repositories/wordRepository';
import {colors} from '../../../shared/theme/colors';
import {spacing} from '../../../shared/theme/spacing';
import {typography} from '../../../shared/theme/typography';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'WordListDetail'>;

export default function WordListDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const {listId, listName, languageName} = route.params;
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await wordRepository.findByList(listId);
      setWords(data);
    } finally {
      setLoading(false);
    }
  }, [listId]);

  useFocusEffect(
    useCallback(() => {
      loadWords();
    }, [loadWords]),
  );

  const confirmDelete = (word: Word) => {
    Alert.alert(
      'Deletar palavra',
      `Deseja deletar "${word.word}"?`,
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            await wordRepository.delete(word.id);
            loadWords();
          },
        },
      ],
    );
  };

  if (loading && words.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarCount}>
            {words.length} {words.length === 1 ? 'palavra' : 'palavras'} em {listName}
          </Text>
          <View style={styles.toolbarActions}>
            <TouchableOpacity
              style={styles.toolbarBtn}
              onPress={() => navigation.navigate('WordForm', {listId})}>
              <Plus size={20} color={colors.primary} />
              <Text style={styles.toolbarBtnText}>Adicionar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.toolbarBtn}
              onPress={() => navigation.navigate('WordPaste', {listId, listName})}>
              <ClipboardPaste size={20} color={colors.primary} />
              <Text style={styles.toolbarBtnText}>Colar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.toolbarBtn}
              onPress={() => navigation.navigate('WordPaste', {listId, listName})}>
              <FileText size={20} color={colors.primary} />
              <Text style={styles.toolbarBtnText}>CSV</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.headerRow}>
          <Text style={[styles.headerCell, styles.headerWord]}>{languageName}</Text>
          <Text style={[styles.headerCell, styles.headerTranslation]}>Português</Text>
          <View style={styles.deleteCol} />
        </View>

        <FlatList
          data={words}
          keyExtractor={item => String(item.id)}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.wordRow}
              onPress={() =>
                navigation.navigate('WordForm', {
                  listId,
                  wordId: item.id,
                  word: item.word,
                  translation: item.translation,
                })
              }>
              <Text style={[styles.cell, styles.cellWord]} numberOfLines={2}>
                {item.word}
              </Text>
              <Text style={[styles.cell, styles.cellTranslation]} numberOfLines={2}>
                {item.translation}
              </Text>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => confirmDelete(item)}>
                <Trash2 size={16} color={colors.error} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          contentContainerStyle={words.length === 0 ? styles.emptyContainer : styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Nenhuma palavra ainda.</Text>
              <Text style={styles.emptyText}>
                Adicione palavras manualmente ou cole um bloco de texto.
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background},
  container: {flex: 1},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  toolbar: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  toolbarCount: {...typography.caption, color: colors.textSecondary},
  toolbarActions: {flexDirection: 'row', gap: spacing.sm},
  toolbarBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  toolbarBtnText: {...typography.caption, color: colors.primary, fontWeight: '600'},
  headerRow: {
    flexDirection: 'row',
    backgroundColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  headerCell: {...typography.caption, fontWeight: '600', color: colors.textSecondary},
  headerWord: {flex: 1},
  headerTranslation: {flex: 1},
  deleteCol: {width: 36},
  list: {paddingBottom: spacing.xl},
  emptyContainer: {flex: 1},
  empty: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl},
  emptyTitle: {...typography.label, color: colors.textPrimary, fontSize: 18, textAlign: 'center'},
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  cell: {...typography.body, color: colors.textPrimary},
  cellWord: {flex: 1, paddingRight: spacing.xs},
  cellTranslation: {flex: 1, color: colors.textSecondary, paddingRight: spacing.xs},
  deleteBtn: {width: 36, alignItems: 'center', justifyContent: 'center'},
});

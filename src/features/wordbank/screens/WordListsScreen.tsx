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
import {ChevronRight, Pencil, Trash2} from 'lucide-react-native';
import {type RootStackParamList} from '../../../shared/navigation/RootNavigator.types';
import {wordListRepository, type WordList} from '../../../shared/database/repositories/wordListRepository';
import {colors} from '../../../shared/theme/colors';
import {spacing} from '../../../shared/theme/spacing';
import {typography} from '../../../shared/theme/typography';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'WordLists'>;

export default function WordListsScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const {languageId, languageName} = route.params;
  const [lists, setLists] = useState<WordList[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLists = useCallback(async () => {
    try {
      setLoading(true);
      const data = await wordListRepository.findByLanguage(languageId);
      setLists(data);
    } finally {
      setLoading(false);
    }
  }, [languageId]);

  useFocusEffect(
    useCallback(() => {
      loadLists();
    }, [loadLists]),
  );

  const confirmDelete = (list: WordList) => {
    Alert.alert(
      'Deletar lista',
      `Deseja deletar a lista "${list.name}" e todas as suas palavras?`,
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            await wordListRepository.delete(list.id);
            loadLists();
          },
        },
      ],
    );
  };

  if (loading && lists.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        <FlatList
          data={lists}
          keyExtractor={item => String(item.id)}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() =>
                navigation.navigate('WordListDetail', {
                  listId: item.id,
                  listName: item.name,
                  languageName,
                  languageId,
                })
              }>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCount}>
                  {item.word_count ?? 0} {(item.word_count ?? 0) === 1 ? 'palavra' : 'palavras'}
                </Text>
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() =>
                    navigation.navigate('WordListForm', {
                      languageId,
                      listId: item.id,
                      currentName: item.name,
                    })
                  }>
                  <Pencil size={16} color={colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => confirmDelete(item)}>
                  <Trash2 size={16} color={colors.error} />
                </TouchableOpacity>
                <ChevronRight size={18} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={lists.length === 0 ? styles.emptyContainer : styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Nenhuma lista ainda.</Text>
              <Text style={styles.emptyText}>
                Crie uma lista para começar a guardar palavras de {languageName}.
              </Text>
            </View>
          }
        />
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('WordListForm', {languageId})}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background},
  container: {flex: 1},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  list: {paddingVertical: spacing.sm, paddingBottom: spacing.xxl},
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
  itemActions: {flexDirection: 'row', alignItems: 'center', gap: spacing.xs},
  actionBtn: {padding: spacing.xs},
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fabText: {color: colors.textInverse, fontSize: 28, lineHeight: 32},
});

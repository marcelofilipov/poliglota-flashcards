import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {type NativeStackNavigationProp} from '@react-navigation/native-stack';
import {type RootStackParamList} from '../../../shared/navigation/RootNavigator.types';
import {useLanguages} from '../hooks/useLanguages';
import LanguageCard from '../components/LanguageCard';
import {colors} from '../../../shared/theme/colors';
import {spacing} from '../../../shared/theme/spacing';
import {typography} from '../../../shared/theme/typography';
import {type LanguageWithStats} from '../../../shared/database/repositories/languageRepository';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function LanguageListScreen() {
  const navigation = useNavigation<Nav>();
  const {languages, loading, loadLanguages, deleteLanguage} = useLanguages();

  useFocusEffect(
    React.useCallback(() => {
      loadLanguages();
    }, [loadLanguages]),
  );

  const confirmDelete = (language: LanguageWithStats) => {
    Alert.alert(
      'Deletar idioma',
      `Deseja deletar "${language.name}" e todos os seus cartões?`,
      [
        {text: 'Cancelar', style: 'cancel'},
        {text: 'Deletar', style: 'destructive', onPress: () => deleteLanguage(language.id)},
      ],
    );
  };

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
          <LanguageCard
            language={item}
            onPress={() => navigation.navigate('CardList', {languageId: item.id, languageName: item.name})}
            onEdit={() => navigation.navigate('LanguageForm', {languageId: item.id})}
            onDelete={() => confirmDelete(item)}
          />
        )}
        contentContainerStyle={languages.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Nenhum idioma cadastrado.</Text>
            <Text style={styles.emptyText}>Crie o primeiro!</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('LanguageForm', {})}>
              <Text style={styles.emptyBtnText}>+ Criar idioma</Text>
            </TouchableOpacity>
          </View>
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('LanguageForm', {})}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
  emptyText: {...typography.body, color: colors.textSecondary, marginTop: spacing.xs, textAlign: 'center'},
  emptyBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  emptyBtnText: {...typography.label, color: colors.textInverse},
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

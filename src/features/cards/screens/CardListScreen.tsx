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
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect, useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import {type NativeStackNavigationProp} from '@react-navigation/native-stack';
import {type RootStackParamList} from '../../../shared/navigation/RootNavigator.types';
import {useCards} from '../hooks/useCards';
import CardItem from '../components/CardItem';
import {colors} from '../../../shared/theme/colors';
import {spacing} from '../../../shared/theme/spacing';
import {typography} from '../../../shared/theme/typography';
import {type Card} from '../../../shared/database/repositories/cardRepository';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'CardList'>;

export default function CardListScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const {languageId, languageName} = route.params;
  const {cards, dueCount, loading, loadCards, deleteCard} = useCards(languageId);

  useFocusEffect(
    React.useCallback(() => {
      loadCards();
    }, [loadCards]),
  );

  const confirmDelete = (card: Card) => {
    Alert.alert('Deletar cartão', `Deseja deletar o cartão "${card.front}"?`, [
      {text: 'Cancelar', style: 'cancel'},
      {text: 'Deletar', style: 'destructive', onPress: () => deleteCard(card.id)},
    ]);
  };

  if (loading && cards.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        {dueCount > 0 && (
          <TouchableOpacity
            style={styles.studyBtn}
            onPress={() => navigation.navigate('Study', {languageId, languageName})}>
            <Text style={styles.studyBtnText}>Estudar hoje ({dueCount})</Text>
          </TouchableOpacity>
        )}

        <FlatList
          data={cards}
          keyExtractor={item => String(item.id)}
          renderItem={({item}) => (
            <CardItem
              card={item}
              onPress={() => navigation.navigate('CardForm', {languageId, cardId: item.id})}
              onDelete={() => confirmDelete(item)}
            />
          )}
          contentContainerStyle={cards.length === 0 ? styles.emptyContainer : styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Nenhum cartão ainda.</Text>
              <Text style={styles.emptyText}>Adicione cartões manualmente ou importe um CSV.</Text>
            </View>
          }
        />

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.footerBtn}
            onPress={() => navigation.navigate('CardForm', {languageId})}>
            <Text style={styles.footerBtnText}>+ Novo cartão</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.footerBtn, styles.footerBtnSecondary]}
            onPress={() => navigation.navigate('ImportCsv', {languageId})}>
            <Text style={styles.footerBtnTextSecondary}>Importar CSV</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background},
  container: {flex: 1},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  studyBtn: {
    backgroundColor: colors.primary,
    margin: spacing.md,
    borderRadius: 10,
    padding: spacing.md,
    alignItems: 'center',
  },
  studyBtnText: {...typography.label, color: colors.textInverse, fontSize: 16},
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
  footer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: spacing.sm,
    alignItems: 'center',
  },
  footerBtnSecondary: {backgroundColor: colors.primaryLight},
  footerBtnText: {...typography.label, color: colors.textInverse},
  footerBtnTextSecondary: {...typography.label, color: colors.primary},
});

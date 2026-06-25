import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ActivityIndicator} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import {type NativeStackNavigationProp} from '@react-navigation/native-stack';
import {type RootStackParamList} from '../../../shared/navigation/RootNavigator.types';
import {useStudySession} from '../hooks/useStudySession';
import FlashCard from '../components/FlashCard';
import RatingButtons from '../components/RatingButtons';
import {colors} from '../../../shared/theme/colors';
import {spacing} from '../../../shared/theme/spacing';
import {typography} from '../../../shared/theme/typography';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'Study'>;

export default function StudyScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const {languageId} = route.params;

  const {cards, currentIndex, isFlipped, flipCard, loadSession, rateAndAdvance, isDone, getSessionStats, resetSession} =
    useStudySession(languageId);

  const [loading, setLoading] = React.useState(true);
  const [empty, setEmpty] = React.useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) {
      return;
    }
    initialized.current = true;
    loadSession().then(count => {
      setLoading(false);
      setEmpty(count === 0);
    });
    return () => {
      resetSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isDone) {
      const stats = getSessionStats();
      navigation.replace('StudyResult', {
        studied: stats.studied,
        correct: stats.correct,
        languageId,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDone]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (empty) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Nenhum cartão para revisar hoje!</Text>
          <Text style={styles.emptyText}>Volte mais tarde.</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const current = cards[currentIndex];
  const total = cards.length;
  const progress = total > 0 ? currentIndex / total : 0;

  if (!current) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.counter}>{currentIndex + 1} / {total}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, {width: `${progress * 100}%`}]} />
          </View>
        </View>

        <FlashCard card={current} isFlipped={isFlipped} onFlip={flipCard} />

        {isFlipped && <RatingButtons onRate={rateAndAdvance} />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background},
  container: {flex: 1},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl},
  header: {padding: spacing.md},
  counter: {...typography.label, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.sm},
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  emptyTitle: {...typography.label, color: colors.textPrimary, fontSize: 18, textAlign: 'center'},
  emptyText: {...typography.body, color: colors.textSecondary, marginTop: spacing.xs, textAlign: 'center'},
  backBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backBtnText: {...typography.label, color: colors.textInverse},
});

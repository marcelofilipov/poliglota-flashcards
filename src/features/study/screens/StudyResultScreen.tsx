import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ActivityIndicator} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import {type NativeStackNavigationProp} from '@react-navigation/native-stack';
import {format, parseISO} from 'date-fns';
import {ptBR} from 'date-fns/locale';
import {type RootStackParamList} from '../../../shared/navigation/RootNavigator.types';
import {cardRepository} from '../../../shared/database/repositories/cardRepository';
import {useStudySessionStore} from '../../../shared/store/studySessionStore';
import {colors} from '../../../shared/theme/colors';
import {spacing} from '../../../shared/theme/spacing';
import {typography} from '../../../shared/theme/typography';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'StudyResult'>;

export default function StudyResultScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const {studied, languageId} = route.params;
  const ratings = useStudySessionStore(s => s.ratings);
  const [nextReview, setNextReview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const wrong = Object.values(ratings).filter(r => r === 0).length;
  const hard = Object.values(ratings).filter(r => r === 1).length;
  const easy = Object.values(ratings).filter(r => r === 2).length;
  const veryEasy = Object.values(ratings).filter(r => r === 3).length;

  useEffect(() => {
    cardRepository.findByLanguage(languageId).then(cards => {
      const sorted = cards
        .filter(c => c.next_review_at)
        .sort((a, b) => a.next_review_at.localeCompare(b.next_review_at));

      if (sorted[0]) {
        try {
          const date = parseISO(sorted[0].next_review_at);
          setNextReview(format(date, "dd 'de' MMMM', às' HH:mm", {locale: ptBR}));
        } catch {
          setNextReview(null);
        }
      }
      setLoading(false);
    });
  }, [languageId]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        <Text style={styles.title}>Sessão concluída! 🎉</Text>
        <Text style={styles.subtitle}>{studied} cartão(ões) estudado(s)</Text>

        <View style={styles.statsBox}>
          <StatRow label="Errei" value={wrong} color={colors.wrong} />
          <StatRow label="Difícil" value={hard} color={colors.hard} />
          <StatRow label="Fácil" value={easy} color={colors.easy} />
          <StatRow label="Muito Fácil" value={veryEasy} color={colors.veryEasy} />
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : nextReview ? (
          <Text style={styles.nextReview}>Próxima revisão: {nextReview}</Text>
        ) : null}

        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.popToTop()}>
          <Text style={styles.btnText}>Voltar ao idioma</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function StatRow({label, value, color}: {label: string; value: number; color: string}) {
  return (
    <View style={styles.statRow}>
      <View style={[styles.statDot, {backgroundColor: color}]} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background},
  container: {flex: 1, padding: spacing.xl, justifyContent: 'center'},
  title: {fontSize: 28, fontWeight: '700', color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.xs},
  subtitle: {...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl},
  statsBox: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  statDot: {width: 12, height: 12, borderRadius: 6, marginRight: spacing.sm},
  statLabel: {...typography.body, color: colors.textPrimary, flex: 1},
  statValue: {...typography.label, color: colors.textPrimary, fontSize: 18},
  nextReview: {...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg},
  loader: {marginBottom: spacing.lg},
  btn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: spacing.md,
    alignItems: 'center',
  },
  btnText: {...typography.label, color: colors.textInverse, fontSize: 16},
});

import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {type NativeStackNavigationProp} from '@react-navigation/native-stack';
import {type RootStackParamList} from '../../../shared/navigation/RootNavigator.types';
import {languageRepository, type LanguageWithStats} from '../../../shared/database/repositories/languageRepository';
import {cardRepository} from '../../../shared/database/repositories/cardRepository';
import {colors} from '../../../shared/theme/colors';
import {spacing} from '../../../shared/theme/spacing';
import {typography} from '../../../shared/theme/typography';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface DashboardStats {
  totalLanguages: number;
  totalCards: number;
  totalDue: number;
  languagesWithDue: LanguageWithStats[];
}

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      let active = true;
      const load = async () => {
        try {
          setLoading(true);
          const [languages, totalCards, totalDue] = await Promise.all([
            languageRepository.findAll(),
            cardRepository.getTotalCards(),
            cardRepository.getTotalDue(),
          ]);
          if (active) {
            setStats({
              totalLanguages: languages.length,
              totalCards,
              totalDue,
              languagesWithDue: languages.filter(l => l.due_today > 0),
            });
          }
        } catch (error) {
          console.error('Erro ao carregar dashboard:', error);
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };
      load();
      return () => {
        active = false;
      };
    }, []),
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <FlatList
        data={stats?.languagesWithDue ?? []}
        keyExtractor={item => String(item.id)}
        ListHeaderComponent={
          <>
            <View style={styles.statsRow}>
              <StatCard label="Idiomas" value={stats?.totalLanguages ?? 0} />
              <StatCard label="Cartões" value={stats?.totalCards ?? 0} />
              <StatCard label="Para hoje" value={stats?.totalDue ?? 0} accent />
            </View>
            {(stats?.languagesWithDue.length ?? 0) > 0 && (
              <Text style={styles.sectionTitle}>Revisar hoje</Text>
            )}
          </>
        }
        renderItem={({item}) => (
          <View style={styles.langRow}>
            <View style={styles.langInfo}>
              <Text style={styles.langName}>{item.name}</Text>
              <Text style={styles.langDue}>{item.due_today} cartão(ões) para revisar</Text>
            </View>
            <TouchableOpacity
              style={styles.studyBtn}
              onPress={() => navigation.navigate('Study', {languageId: item.id, languageName: item.name})}>
              <Text style={styles.studyBtnText}>Estudar</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Tudo em dia! 🎉</Text>
            <Text style={styles.emptyText}>
              {(stats?.totalCards ?? 0) === 0
                ? 'Crie seu primeiro idioma na aba Idiomas.'
                : 'Nenhum cartão para revisar agora. Volte mais tarde.'}
            </Text>
          </View>
        }
        contentContainerStyle={styles.content}
      />
    </SafeAreaView>
  );
}

function StatCard({label, value, accent}: {label: string; value: number; accent?: boolean}) {
  return (
    <View style={[styles.statCard, accent && styles.statCardAccent]}>
      <Text style={[styles.statValue, accent && styles.statValueAccent]}>{value}</Text>
      <Text style={[styles.statLabel, accent && styles.statLabelAccent]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  content: {padding: spacing.md, paddingBottom: spacing.xxl},
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statCardAccent: {backgroundColor: colors.primary, borderColor: colors.primary},
  statValue: {fontSize: 28, fontWeight: '700', color: colors.textPrimary},
  statValueAccent: {color: colors.textInverse},
  statLabel: {...typography.caption, color: colors.textSecondary, marginTop: 2},
  statLabelAccent: {color: colors.primaryLight},
  sectionTitle: {...typography.label, color: colors.textSecondary, marginBottom: spacing.sm, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5},
  langRow: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  langInfo: {flex: 1},
  langName: {...typography.label, color: colors.textPrimary, fontSize: 16},
  langDue: {...typography.caption, color: colors.textSecondary, marginTop: 2},
  studyBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  studyBtnText: {...typography.label, color: colors.textInverse},
  empty: {alignItems: 'center', marginTop: spacing.xl},
  emptyTitle: {...typography.label, color: colors.textPrimary, fontSize: 20, textAlign: 'center'},
  emptyText: {...typography.body, color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center'},
});

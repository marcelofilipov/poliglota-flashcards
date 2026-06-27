import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {colors} from '../../../shared/theme/colors';
import {spacing} from '../../../shared/theme/spacing';
import {typography} from '../../../shared/theme/typography';
import {type LanguageWithStats} from '../../../shared/database/repositories/languageRepository';

interface Props {
  language: LanguageWithStats;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function LanguageCard({language, onPress, onEdit, onDelete}: Props) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.info}>
        <Text style={styles.name}>{language.name}</Text>
        <Text style={styles.stats}>
          {language.total_cards} cartão(ões) · {language.due_today} para revisar hoje
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onEdit} style={styles.actionBtn} hitSlop={8}>
          <Text style={styles.actionText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.actionBtn} hitSlop={8}>
          <Text style={styles.actionText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  info: {flex: 1},
  name: {...typography.label, color: colors.textPrimary, fontSize: 17},
  stats: {...typography.caption, color: colors.textSecondary, marginTop: 2},
  actions: {flexDirection: 'row', gap: spacing.sm},
  actionBtn: {padding: spacing.xs},
  actionText: {fontSize: 18},
});

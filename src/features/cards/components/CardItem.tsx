import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {formatDistanceToNow, isPast, parseISO} from 'date-fns';
import {ptBR} from 'date-fns/locale';
import {type Card} from '../../../shared/database/repositories/cardRepository';
import {colors} from '../../../shared/theme/colors';
import {spacing} from '../../../shared/theme/spacing';
import {typography} from '../../../shared/theme/typography';

interface Props {
  card: Card;
  onPress: () => void;
  onDelete: () => void;
}

function getStatusLabel(card: Card): {label: string; color: string} {
  if (card.repetitions === 0) {
    return {label: 'Novo', color: colors.primary};
  }
  const due = parseISO(card.next_review_at);
  if (isPast(due)) {
    return {label: 'Revisar hoje', color: colors.wrong};
  }
  const distance = formatDistanceToNow(due, {locale: ptBR, addSuffix: false});
  return {label: `Em ${distance}`, color: colors.textSecondary};
}

export default function CardItem({card, onPress, onDelete}: Props) {
  const status = getStatusLabel(card);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.content}>
        <Text style={styles.front} numberOfLines={1}>{card.front}</Text>
        <Text style={styles.back} numberOfLines={1}>{card.back}</Text>
        <Text style={[styles.status, {color: status.color}]}>{status.label}</Text>
      </View>
      <TouchableOpacity onPress={onDelete} style={styles.deleteBtn} hitSlop={8}>
        <Text style={styles.deleteText}>🗑️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  content: {flex: 1},
  front: {...typography.label, color: colors.textPrimary},
  back: {...typography.body, color: colors.textSecondary, marginTop: 2},
  status: {...typography.caption, marginTop: 4},
  deleteBtn: {padding: spacing.xs},
  deleteText: {fontSize: 18},
});

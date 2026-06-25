import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {type Card} from '../../../shared/database/repositories/cardRepository';
import {colors} from '../../../shared/theme/colors';
import {spacing} from '../../../shared/theme/spacing';
import {typography} from '../../../shared/theme/typography';

interface Props {
  card: Card;
  isFlipped: boolean;
  onFlip: () => void;
}

export default function FlashCard({card, isFlipped, onFlip}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.frontText}>{card.front}</Text>

        {isFlipped ? (
          <View style={styles.backContainer}>
            <View style={styles.divider} />
            <Text style={styles.backText}>{card.back}</Text>
            {card.example_phrase ? (
              <Text style={styles.exampleText}>"{card.example_phrase}"</Text>
            ) : null}
          </View>
        ) : (
          <TouchableOpacity style={styles.revealBtn} onPress={onFlip} activeOpacity={0.8}>
            <Text style={styles.revealText}>Ver resposta</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg},
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
    minHeight: 260,
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  frontText: {
    ...typography.cardFront,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  backContainer: {width: '100%', alignItems: 'center'},
  divider: {
    width: '60%',
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  backText: {
    ...typography.cardBack,
    color: colors.primary,
    textAlign: 'center',
  },
  exampleText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
  revealBtn: {
    marginTop: spacing.xl,
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  revealText: {...typography.label, color: colors.primary, fontSize: 16},
});

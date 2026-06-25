import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {colors} from '../../../shared/theme/colors';
import {spacing} from '../../../shared/theme/spacing';
import {typography} from '../../../shared/theme/typography';

interface Props {
  onRate: (rating: 0 | 1 | 2 | 3) => void;
}

const BUTTONS: {label: string; rating: 0 | 1 | 2 | 3; color: string}[] = [
  {label: 'Errei', rating: 0, color: colors.wrong},
  {label: 'Difícil', rating: 1, color: colors.hard},
  {label: 'Fácil', rating: 2, color: colors.easy},
  {label: 'Muito Fácil', rating: 3, color: colors.veryEasy},
];

export default function RatingButtons({onRate}: Props) {
  return (
    <View style={styles.container}>
      {BUTTONS.map(btn => (
        <TouchableOpacity
          key={btn.rating}
          style={[styles.btn, {backgroundColor: btn.color}]}
          onPress={() => onRate(btn.rating)}
          activeOpacity={0.8}>
          <Text style={styles.btnText}>{btn.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    padding: spacing.md,
    justifyContent: 'center',
  },
  btn: {
    flex: 1,
    minWidth: 80,
    minHeight: 52,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  btnText: {...typography.label, color: colors.textInverse, fontSize: 14, textAlign: 'center'},
});

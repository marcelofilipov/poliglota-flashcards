import React, {useEffect} from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import {type NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {type RootStackParamList} from '../../../shared/navigation/RootNavigator.types';
import {cardRepository} from '../../../shared/database/repositories/cardRepository';
import {colors} from '../../../shared/theme/colors';
import {spacing} from '../../../shared/theme/spacing';
import {typography} from '../../../shared/theme/typography';

const schema = z.object({
  front: z.string().min(1, 'Campo obrigatório'),
  back: z.string().min(1, 'Campo obrigatório'),
  example_phrase: z.string().optional(),
});

type FormData = z.infer<typeof schema>;
type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'CardForm'>;

export default function CardFormScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const {languageId, cardId} = route.params;

  const {
    control,
    handleSubmit,
    setValue,
    formState: {errors, isSubmitting},
  } = useForm<FormData>({resolver: zodResolver(schema)});

  useEffect(() => {
    if (cardId) {
      cardRepository.findById(cardId).then(card => {
        if (card) {
          setValue('front', card.front);
          setValue('back', card.back);
          setValue('example_phrase', card.example_phrase ?? '');
        }
      });
    }
  }, [cardId, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      if (cardId) {
        await cardRepository.update(cardId, {
          front: data.front,
          back: data.back,
          example_phrase: data.example_phrase || null,
        });
      } else {
        await cardRepository.create({
          language_id: languageId,
          front: data.front,
          back: data.back,
          example_phrase: data.example_phrase || null,
          interval_days: 0,
          repetitions: 0,
          ease_factor: 2.5,
          last_reviewed_at: null,
          next_review_at: new Date().toISOString(),
        });
      }
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar cartão:', error);
      Alert.alert('Erro', 'Não foi possível salvar o cartão.');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Frente (sua língua nativa)</Text>
          <Controller
            control={control}
            name="front"
            render={({field: {onChange, value}}) => (
              <TextInput
                style={[styles.input, errors.front && styles.inputError]}
                onChangeText={onChange}
                value={value}
                placeholder="Ex: Cachorro"
                placeholderTextColor={colors.textSecondary}
                autoFocus
              />
            )}
          />
          {errors.front && <Text style={styles.errorText}>{errors.front.message}</Text>}

          <Text style={[styles.label, styles.labelSpacing]}>Verso (idioma que está aprendendo)</Text>
          <Controller
            control={control}
            name="back"
            render={({field: {onChange, value}}) => (
              <TextInput
                style={[styles.input, errors.back && styles.inputError]}
                onChangeText={onChange}
                value={value}
                placeholder="Ex: Dog"
                placeholderTextColor={colors.textSecondary}
              />
            )}
          />
          {errors.back && <Text style={styles.errorText}>{errors.back.message}</Text>}

          <Text style={[styles.label, styles.labelSpacing]}>Frase de exemplo (opcional)</Text>
          <Controller
            control={control}
            name="example_phrase"
            render={({field: {onChange, value}}) => (
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                onChangeText={onChange}
                value={value}
                placeholder="Ex: The dog is sleeping."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            )}
          />

          <TouchableOpacity
            style={[styles.btn, isSubmitting && styles.btnDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}>
            <Text style={styles.btnText}>{cardId ? 'Salvar alterações' : 'Criar cartão'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background},
  flex: {flex: 1},
  container: {padding: spacing.lg},
  label: {...typography.label, color: colors.textPrimary, marginBottom: spacing.xs},
  labelSpacing: {marginTop: spacing.md},
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  inputMultiline: {minHeight: 80, textAlignVertical: 'top'},
  inputError: {borderColor: colors.error},
  errorText: {...typography.caption, color: colors.error, marginTop: spacing.xs},
  btn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  btnDisabled: {opacity: 0.6},
  btnText: {...typography.label, color: colors.textInverse, fontSize: 16},
});

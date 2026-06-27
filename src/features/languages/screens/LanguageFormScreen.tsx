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
import {languageRepository} from '../../../shared/database/repositories/languageRepository';
import {colors} from '../../../shared/theme/colors';
import {spacing} from '../../../shared/theme/spacing';
import {typography} from '../../../shared/theme/typography';

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(50, 'Máximo 50 caracteres'),
});

type FormData = z.infer<typeof schema>;
type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'LanguageForm'>;

export default function LanguageFormScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const languageId = route.params?.languageId;

  const {
    control,
    handleSubmit,
    setValue,
    formState: {errors, isSubmitting},
  } = useForm<FormData>({resolver: zodResolver(schema)});

  useEffect(() => {
    if (languageId) {
      languageRepository.findById(languageId).then(lang => {
        if (lang) {
          setValue('name', lang.name);
        }
      });
    }
  }, [languageId, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      if (languageId) {
        await languageRepository.update(languageId, data.name);
      } else {
        await languageRepository.create(data.name);
      }
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar idioma:', error);
      Alert.alert('Erro', 'Não foi possível salvar o idioma.');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Nome do idioma</Text>
          <Controller
            control={control}
            name="name"
            render={({field: {onChange, value}}) => (
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                onChangeText={onChange}
                value={value}
                placeholder="Ex: Inglês, Espanhol..."
                placeholderTextColor={colors.textSecondary}
                autoFocus
                maxLength={50}
              />
            )}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

          <TouchableOpacity
            style={[styles.btn, isSubmitting && styles.btnDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}>
            <Text style={styles.btnText}>{languageId ? 'Salvar alterações' : 'Criar idioma'}</Text>
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
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
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

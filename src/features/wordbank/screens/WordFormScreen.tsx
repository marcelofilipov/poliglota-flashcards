import React, {useState} from 'react';
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
import {type RootStackParamList} from '../../../shared/navigation/RootNavigator.types';
import {wordRepository} from '../../../shared/database/repositories/wordRepository';
import {colors} from '../../../shared/theme/colors';
import {spacing} from '../../../shared/theme/spacing';
import {typography} from '../../../shared/theme/typography';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'WordForm'>;

export default function WordFormScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const {listId, wordId, word: initialWord, translation: initialTranslation} = route.params;
  const isEditing = wordId !== undefined;

  const [word, setWord] = useState(initialWord ?? '');
  const [translation, setTranslation] = useState(initialTranslation ?? '');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{word?: string; translation?: string}>({});

  const validate = () => {
    const newErrors: {word?: string; translation?: string} = {};
    if (!word.trim()) {
      newErrors.word = 'A palavra não pode estar vazia.';
    }
    if (!translation.trim()) {
      newErrors.translation = 'A tradução não pode estar vazia.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    try {
      setSaving(true);
      if (isEditing && wordId !== undefined) {
        await wordRepository.update(wordId, word.trim(), translation.trim());
      } else {
        await wordRepository.create(listId, word.trim(), translation.trim());
      }
      navigation.goBack();
    } catch (err) {
      console.error('Erro ao salvar palavra:', err);
      Alert.alert('Erro', 'Não foi possível salvar a palavra.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Palavra</Text>
          <TextInput
            style={[styles.input, errors.word ? styles.inputError : undefined]}
            value={word}
            onChangeText={text => {
              setWord(text);
              setErrors(prev => ({...prev, word: undefined}));
            }}
            placeholder="Ex: apple, laufen..."
            placeholderTextColor={colors.textSecondary}
            autoFocus
          />
          {errors.word ? <Text style={styles.errorText}>{errors.word}</Text> : null}

          <Text style={[styles.label, styles.labelSpaced]}>Tradução em português</Text>
          <TextInput
            style={[styles.input, errors.translation ? styles.inputError : undefined]}
            value={translation}
            onChangeText={text => {
              setTranslation(text);
              setErrors(prev => ({...prev, translation: undefined}));
            }}
            placeholder="Ex: maçã, correr..."
            placeholderTextColor={colors.textSecondary}
          />
          {errors.translation ? <Text style={styles.errorText}>{errors.translation}</Text> : null}

          <TouchableOpacity
            style={[styles.btn, saving && styles.btnDisabled]}
            onPress={handleSave}
            disabled={saving}>
            <Text style={styles.btnText}>
              {saving ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Adicionar palavra'}
            </Text>
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
  labelSpaced: {marginTop: spacing.lg},
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

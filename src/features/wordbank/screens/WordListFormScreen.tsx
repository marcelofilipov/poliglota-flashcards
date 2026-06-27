import React, {useState, useEffect} from 'react';
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
import {wordListRepository} from '../../../shared/database/repositories/wordListRepository';
import {colors} from '../../../shared/theme/colors';
import {spacing} from '../../../shared/theme/spacing';
import {typography} from '../../../shared/theme/typography';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'WordListForm'>;

export default function WordListFormScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const {languageId, listId, currentName} = route.params;
  const isEditing = listId !== undefined;

  const [name, setName] = useState(currentName ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentName) {
      setName(currentName);
    }
  }, [currentName]);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError('O nome deve ter pelo menos 2 caracteres.');
      return;
    }
    if (trimmed.length > 60) {
      setError('O nome deve ter no máximo 60 caracteres.');
      return;
    }

    try {
      setSaving(true);
      if (isEditing && listId !== undefined) {
        await wordListRepository.update(listId, trimmed);
      } else {
        await wordListRepository.create(languageId, trimmed);
      }
      navigation.goBack();
    } catch (err) {
      console.error('Erro ao salvar lista:', err);
      Alert.alert('Erro', 'Não foi possível salvar a lista.');
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
          <Text style={styles.label}>Nome da lista</Text>
          <TextInput
            style={[styles.input, error ? styles.inputError : undefined]}
            value={name}
            onChangeText={text => {
              setName(text);
              setError('');
            }}
            placeholder="Ex: Vocabulário básico, Verbos..."
            placeholderTextColor={colors.textSecondary}
            autoFocus
            maxLength={60}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.btn, saving && styles.btnDisabled]}
            onPress={handleSave}
            disabled={saving}>
            <Text style={styles.btnText}>
              {saving ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar lista'}
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

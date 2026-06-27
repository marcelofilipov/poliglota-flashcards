import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import {type RootStackParamList} from '../../../shared/navigation/RootNavigator.types';
import {wordRepository} from '../../../shared/database/repositories/wordRepository';
import {colors} from '../../../shared/theme/colors';
import {spacing} from '../../../shared/theme/spacing';
import {typography} from '../../../shared/theme/typography';

type Route = RouteProp<RootStackParamList, 'WordPaste'>;

interface ParsedEntry {
  word: string;
  translation: string;
}

function parseText(text: string): ParsedEntry[] {
  return text
    .split('\n')
    .map(line => {
      const semicolonIdx = line.indexOf(';');
      if (semicolonIdx === -1) {
        return null;
      }
      const word = line.slice(0, semicolonIdx).trim();
      const translation = line.slice(semicolonIdx + 1).trim();
      if (!word || !translation) {
        return null;
      }
      return {word, translation};
    })
    .filter((entry): entry is ParsedEntry => entry !== null);
}

export default function PasteWordsScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const {listId, listName} = route.params;

  const [text, setText] = useState('');
  const [preview, setPreview] = useState<ParsedEntry[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  const handlePreview = () => {
    if (!text.trim()) {
      Alert.alert('Aviso', 'Cole o texto antes de visualizar.');
      return;
    }
    const entries = parseText(text);
    setPreview(entries);
    setResult(null);
  };

  const handleSave = async () => {
    const entries = preview ?? parseText(text);
    if (entries.length === 0) {
      Alert.alert('Aviso', 'Nenhuma linha válida encontrada.');
      return;
    }

    try {
      setSaving(true);
      const inserted = await wordRepository.bulkCreate(listId, entries);
      setResult(inserted);
      setPreview(null);
      setText('');
    } catch (err) {
      console.error('Erro ao salvar palavras:', err);
      Alert.alert('Erro', 'Não foi possível salvar as palavras.');
    } finally {
      setSaving(false);
    }
  };

  const validCount = preview?.length ?? parseText(text).length;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.instructions}>
            Cole as palavras de <Text style={styles.bold}>{listName}</Text>, uma por linha, no formato:
          </Text>
          <Text style={styles.code}>{'palavra;tradução\napple;maçã\nrun;correr'}</Text>

          <TextInput
            style={styles.textarea}
            value={text}
            onChangeText={val => {
              setText(val);
              setPreview(null);
              setResult(null);
            }}
            placeholder="Cole o texto aqui..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={12}
            autoCapitalize="none"
            autoCorrect={false}
            textAlignVertical="top"
          />

          {preview !== null && (
            <View style={styles.previewBox}>
              <Text style={styles.previewTitle}>
                {preview.length} {preview.length === 1 ? 'linha válida' : 'linhas válidas'} detectada(s)
              </Text>
              {preview.slice(0, 5).map((entry, idx) => (
                <Text key={idx} style={styles.previewItem}>
                  {entry.word} → {entry.translation}
                </Text>
              ))}
              {preview.length > 5 && (
                <Text style={styles.previewMore}>...e mais {preview.length - 5}</Text>
              )}
            </View>
          )}

          {result !== null && (
            <View style={styles.resultBox}>
              <Text style={styles.resultText}>
                {result} {result === 1 ? 'palavra salva' : 'palavras salvas'} com sucesso.
              </Text>
            </View>
          )}

          <View style={styles.btnRow}>
            <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={handlePreview}>
              <Text style={styles.btnSecondaryText}>Previa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, (saving || validCount === 0) && styles.btnDisabled]}
              onPress={handleSave}
              disabled={saving || validCount === 0}>
              <Text style={styles.btnText}>
                {saving ? 'Salvando...' : `Salvar ${validCount > 0 ? validCount : ''} palavra${validCount !== 1 ? 's' : ''}`}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background},
  flex: {flex: 1},
  container: {padding: spacing.lg},
  instructions: {...typography.body, color: colors.textSecondary, marginBottom: spacing.sm},
  bold: {fontWeight: '600', color: colors.textPrimary},
  code: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    backgroundColor: colors.border,
    borderRadius: 6,
    padding: spacing.sm,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  textarea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    minHeight: 180,
    textAlignVertical: 'top',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 13,
  },
  previewBox: {
    marginTop: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: spacing.md,
  },
  previewTitle: {...typography.label, color: colors.primary, marginBottom: spacing.xs},
  previewItem: {...typography.caption, color: colors.textPrimary, marginTop: 2},
  previewMore: {...typography.caption, color: colors.textSecondary, marginTop: spacing.xs},
  resultBox: {
    marginTop: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: spacing.md,
  },
  resultText: {...typography.body, color: colors.textPrimary},
  btnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  btn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
  },
  btnSecondary: {backgroundColor: colors.primaryLight},
  btnDisabled: {opacity: 0.5},
  btnText: {...typography.label, color: colors.textInverse, fontSize: 16},
  btnSecondaryText: {...typography.label, color: colors.primary, fontSize: 16},
});

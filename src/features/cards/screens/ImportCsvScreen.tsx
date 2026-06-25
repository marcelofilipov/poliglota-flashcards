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
import {useRoute, type RouteProp} from '@react-navigation/native';
import {type RootStackParamList} from '../../../shared/navigation/RootNavigator.types';
import {cardRepository} from '../../../shared/database/repositories/cardRepository';
import {parseCsv} from '../../../shared/utils/csvParser';
import {colors} from '../../../shared/theme/colors';
import {spacing} from '../../../shared/theme/spacing';
import {typography} from '../../../shared/theme/typography';

type Route = RouteProp<RootStackParamList, 'ImportCsv'>;

export default function ImportCsvScreen() {
  const route = useRoute<Route>();
  const {languageId} = route.params;
  const [csvText, setCsvText] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{imported: number; ignored: number} | null>(null);

  const handleImport = async () => {
    if (!csvText.trim()) {
      Alert.alert('Aviso', 'Cole o conteúdo CSV antes de importar.');
      return;
    }

    try {
      setImporting(true);
      const parsed = parseCsv(csvText);

      if (parsed.errors.length > 0) {
        Alert.alert('Erro no CSV', parsed.errors.join('\n'));
        return;
      }

      if (parsed.cards.length === 0) {
        setResult({imported: 0, ignored: parsed.ignored});
        return;
      }

      const inserted = await cardRepository.bulkCreate(languageId, parsed.cards);
      const totalIgnored = parsed.ignored + (parsed.cards.length - inserted);
      setResult({imported: inserted, ignored: totalIgnored});
    } catch (error) {
      console.error('Erro ao importar CSV:', error);
      Alert.alert('Erro', 'Não foi possível importar os cartões.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.instructions}>
            Cole o conteúdo do CSV abaixo. Formato esperado:
          </Text>
          <Text style={styles.code}>
            {'front,back,example_phrase\nDog,Cachorro,The dog is sleeping.\nCat,Gato,'}
          </Text>

          <TextInput
            style={styles.textarea}
            value={csvText}
            onChangeText={text => {
              setCsvText(text);
              setResult(null);
            }}
            placeholder="Cole o CSV aqui..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={10}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {result && (
            <View style={styles.resultBox}>
              <Text style={styles.resultText}>
                ✅ {result.imported} cartão(ões) importado(s) com sucesso.
              </Text>
              {result.ignored > 0 && (
                <Text style={styles.resultIgnored}>
                  ⚠️ {result.ignored} linha(s) ignorada(s).
                </Text>
              )}
            </View>
          )}

          <TouchableOpacity
            style={[styles.btn, importing && styles.btnDisabled]}
            onPress={handleImport}
            disabled={importing}>
            <Text style={styles.btnText}>{importing ? 'Importando...' : 'Importar'}</Text>
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
  instructions: {...typography.body, color: colors.textSecondary, marginBottom: spacing.sm},
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
    minHeight: 160,
    textAlignVertical: 'top',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 13,
  },
  resultBox: {
    marginTop: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: spacing.md,
  },
  resultText: {...typography.body, color: colors.textPrimary},
  resultIgnored: {...typography.body, color: colors.warning, marginTop: spacing.xs},
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

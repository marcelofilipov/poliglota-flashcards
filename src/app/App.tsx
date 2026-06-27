import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ActivityIndicator} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {runMigrations} from '../shared/database/migrations';
import RootNavigator from '../shared/navigation/RootNavigator';
import {colors} from '../shared/theme/colors';
import {spacing} from '../shared/theme/spacing';
import {typography} from '../shared/theme/typography';

type AppState = 'loading' | 'ready' | 'error';

export default function App() {
  const [appState, setAppState] = useState<AppState>('loading');

  const initDb = () => {
    setAppState('loading');
    try {
      runMigrations();
      setAppState('ready');
    } catch (error) {
      console.error('Erro ao inicializar banco de dados:', error);
      setAppState('error');
    }
  };

  useEffect(() => {
    initDb();
  }, []);

  if (appState === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (appState === 'error') {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Erro ao inicializar o banco de dados</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={initDb}>
          <Text style={styles.retryBtnText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  errorTitle: {...typography.label, color: colors.error, fontSize: 18, textAlign: 'center', marginBottom: spacing.lg},
  retryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  retryBtnText: {...typography.label, color: colors.textInverse, fontSize: 16},
});

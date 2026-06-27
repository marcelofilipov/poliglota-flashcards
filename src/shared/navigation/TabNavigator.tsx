import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {CalendarDays, Globe} from 'lucide-react-native';
import {type RootStackParamList} from './RootNavigator.types';
import {colors} from '../theme/colors';

import HomeScreen from '../../features/study/screens/HomeScreen';
import LanguageListScreen from '../../features/languages/screens/LanguageListScreen';
import LanguageFormScreen from '../../features/languages/screens/LanguageFormScreen';
import CardListScreen from '../../features/cards/screens/CardListScreen';
import CardFormScreen from '../../features/cards/screens/CardFormScreen';
import ImportCsvScreen from '../../features/cards/screens/ImportCsvScreen';
import StudyScreen from '../../features/study/screens/StudyScreen';
import StudyResultScreen from '../../features/study/screens/StudyResultScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

function LanguagesStack() {
  return (
    <Stack.Navigator screenOptions={{headerStyle: {backgroundColor: colors.surface}, headerTitleStyle: {color: colors.textPrimary}}}>
      <Stack.Screen name="LanguageList" component={LanguageListScreen} options={{title: 'Idiomas'}} />
      <Stack.Screen name="LanguageForm" component={LanguageFormScreen} options={({route}) => ({title: route.params?.languageId ? 'Editar Idioma' : 'Novo Idioma'})} />
      <Stack.Screen name="CardList" component={CardListScreen} options={({route}) => ({title: route.params.languageName})} />
      <Stack.Screen name="CardForm" component={CardFormScreen} options={({route}) => ({title: route.params.cardId ? 'Editar Cartão' : 'Novo Cartão'})} />
      <Stack.Screen name="ImportCsv" component={ImportCsvScreen} options={{title: 'Importar CSV'}} />
      <Stack.Screen name="Study" component={StudyScreen} options={{title: 'Estudando', headerBackVisible: false}} />
      <Stack.Screen name="StudyResult" component={StudyResultScreen} options={{title: 'Resultado', headerBackVisible: false}} />
    </Stack.Navigator>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{headerStyle: {backgroundColor: colors.surface}, headerTitleStyle: {color: colors.textPrimary}}}>
      <Stack.Screen name="Home" component={HomeScreen} options={{title: 'Hoje'}} />
      <Stack.Screen name="Study" component={StudyScreen} options={{title: 'Estudando', headerBackVisible: false}} />
      <Stack.Screen name="StudyResult" component={StudyResultScreen} options={{title: 'Resultado', headerBackVisible: false}} />
    </Stack.Navigator>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {backgroundColor: colors.surface, borderTopColor: colors.border},
      }}>
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          title: 'Hoje',
          tabBarIcon: ({color, size}) => <CalendarDays color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="LanguagesTab"
        component={LanguagesStack}
        options={{
          title: 'Idiomas',
          tabBarIcon: ({color, size}) => <Globe color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

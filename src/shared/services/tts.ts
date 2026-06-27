import Tts from 'react-native-tts';

const LANGUAGE_LOCALE_MAP: Record<string, string> = {
  inglês: 'en-US',
  ingles: 'en-US',
  english: 'en-US',
  espanhol: 'es-ES',
  spanish: 'es-ES',
  francês: 'fr-FR',
  frances: 'fr-FR',
  french: 'fr-FR',
  alemão: 'de-DE',
  alemao: 'de-DE',
  german: 'de-DE',
  italiano: 'it-IT',
  italian: 'it-IT',
  português: 'pt-BR',
  portugues: 'pt-BR',
  portuguese: 'pt-BR',
  japonês: 'ja-JP',
  japones: 'ja-JP',
  japanese: 'ja-JP',
  chinês: 'zh-CN',
  chines: 'zh-CN',
  chinese: 'zh-CN',
  coreano: 'ko-KR',
  korean: 'ko-KR',
  russo: 'ru-RU',
  russian: 'ru-RU',
};

export function getLocaleForLanguage(languageName: string): string {
  const key = languageName.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  return LANGUAGE_LOCALE_MAP[key] ?? 'en-US';
}

export async function speak(text: string, languageName: string): Promise<void> {
  const locale = getLocaleForLanguage(languageName);
  try {
    await Tts.setDefaultLanguage(locale);
  } catch {
    // idioma não disponível no dispositivo, usa o padrão
  }
  Tts.stop();
  Tts.speak(text);
}

export function stopSpeaking(): void {
  Tts.stop();
}

# PoliCard

App de flashcards com Spaced Repetition System (SRS) para aprendizado de idiomas, desenvolvido em React Native.

## Funcionalidades

- **Flashcards com SRS** — algoritmo SM-2 para agendamento inteligente de revisões
- **Text-to-Speech** — pronúncia nativa da palavra e da frase de exemplo ao virar o cartão
- **Banco de Palavras** — listas de vocabulário por idioma, com adição manual ou via colagem em lote
- **Múltiplos idiomas** — seed data pré-carregado: Inglês, Espanhol, Francês, Alemão, Italiano e Russo

## Tecnologias

- React Native 0.86 (New Architecture)
- `@op-engineering/op-sqlite` — banco de dados SQLite local
- React Navigation (Bottom Tabs + Native Stack)
- Zustand — gerenciamento de estado da sessão de estudo
- `lucide-react-native` — ícones
- `react-native-tts` — Text-to-Speech nativo do dispositivo

## Pré-requisitos

- Node.js >= 22.11.0
- Android Studio + SDK configurado
- Yarn

## Instalação

```sh
yarn install
```

> O `postinstall` aplica automaticamente o patch do `react-native-tts` (compatibilidade com Gradle 9+).

## Execução

```sh
# Iniciar o Metro bundler
yarn start

# Rodar no Android (em outro terminal)
yarn android
```

## Debug — resetar banco de dados

```sh
adb shell pm clear com.policard
```

## Estrutura do banco de dados

| Tabela | Descrição |
|---|---|
| `languages` | Idiomas cadastrados |
| `cards` | Flashcards com campos SRS (interval_days, ease_factor, next_review_at…) |
| `word_lists` | Listas de palavras por idioma |
| `words` | Palavras e traduções dentro de cada lista |

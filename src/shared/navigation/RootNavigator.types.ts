export type RootStackParamList = {
  LanguageList: undefined;
  LanguageForm: {languageId?: number};
  CardList: {languageId: number; languageName: string};
  CardForm: {languageId: number; cardId?: number};
  ImportCsv: {languageId: number};
  Study: {languageId: number; languageName: string};
  StudyResult: {studied: number; correct: number; wrong: number; hard: number; easy: number; veryEasy: number; languageId: number};
  Home: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  LanguageList: undefined;
  LanguageForm: {languageId?: number};
  CardList: {languageId: number; languageName: string};
  CardForm: {languageId: number; cardId?: number};
  ImportCsv: {languageId: number};
  Study: {languageId: number; languageName: string};
  StudyResult: {studied: number; correct: number; wrong: number; hard: number; easy: number; veryEasy: number; languageId: number};
  Home: undefined;
  WordBankHome: undefined;
  WordLists: {languageId: number; languageName: string};
  WordListForm: {languageId: number; listId?: number; currentName?: string};
  WordListDetail: {listId: number; listName: string; languageName: string; languageId: number};
  WordForm: {listId: number; wordId?: number; word?: string; translation?: string};
  WordPaste: {listId: number; listName: string};
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

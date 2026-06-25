export interface ParsedCard {
  front: string;
  back: string;
  example_phrase: string | null;
}

export interface ParseResult {
  cards: ParsedCard[];
  ignored: number;
  errors: string[];
}

export function parseCsv(raw: string): ParseResult {
  const lines = raw.split(/\r?\n/).filter(l => l.trim().length > 0);
  const cards: ParsedCard[] = [];
  const errors: string[] = [];
  let ignored = 0;

  if (lines.length === 0) {
    return {cards, ignored, errors};
  }

  const firstLine = lines[0];
  const delimiter = firstLine.includes(';') ? ';' : ',';

  const headerParts = firstLine.split(delimiter).map(h => h.trim().toLowerCase());
  const frontIdx = headerParts.indexOf('front');
  const backIdx = headerParts.indexOf('back');
  const exampleIdx = headerParts.indexOf('example_phrase');

  if (frontIdx === -1 || backIdx === -1) {
    errors.push('Header inválido: colunas "front" e "back" são obrigatórias.');
    return {cards, ignored, errors};
  }

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(delimiter);
    const front = (parts[frontIdx] ?? '').trim();
    const back = (parts[backIdx] ?? '').trim();
    const exampleRaw = exampleIdx !== -1 ? (parts[exampleIdx] ?? '').trim() : '';
    const example_phrase = exampleRaw.length > 0 ? exampleRaw : null;

    if (!front || !back) {
      ignored++;
      continue;
    }

    cards.push({front, back, example_phrase});
  }

  return {cards, ignored, errors};
}

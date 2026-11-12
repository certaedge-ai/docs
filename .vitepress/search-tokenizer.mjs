export function tokenize(text) {
  return Array.from(new Intl.Segmenter('zh-CN', { granularity: 'word' }).segment(text))
    .filter((part) => part.isWordLike)
    .map((part) => part.segment)
}

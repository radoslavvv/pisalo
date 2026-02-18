export const commonWords = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
  'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
  'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
  'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
  'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
  'world', 'very', 'through', 'just', 'form', 'much', 'great', 'think', 'where', 'help',
  'through', 'long', 'things', 'place', 'point', 'right', 'down', 'same', 'another', 'found',
  'study', 'still', 'learn', 'should', 'system', 'every', 'city', 'tree', 'cross', 'farm',
  'hard', 'start', 'might', 'story', 'being', 'left', 'once', 'book', 'heard', 'white',
  'without', 'second', 'later', 'miss', 'idea', 'enough', 'eat', 'face', 'watch', 'last',
  'door', 'between', 'never', 'really', 'almost', 'along', 'let', 'father', 'keep', 'food',
  'important', 'young', 'those', 'seem', 'name', 'nothing', 'example', 'paper', 'group', 'always',
  'music', 'quickly', 'write', 'move', 'run', 'feet', 'read', 'hand', 'such', 'old',
  'too', 'under', 'home', 'away', 'here', 'part', 'add', 'did', 'each', 'body',
  'school', 'area', 'house', 'turn', 'water', 'high', 'air', 'against', 'answer', 'while'
]

export function getRandomWords(count: number): string[] {
  const shuffled = [...commonWords].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export function generateWordSet(count: number): string {
  return getRandomWords(count).join(' ')
}

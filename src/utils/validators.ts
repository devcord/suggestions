function isValidSuggestion(desc, author?, guild?): boolean {
  if (typeof desc !== 'string') return false;
  if (desc.length <= 0) return false;

  return true
}

export { isValidSuggestion }
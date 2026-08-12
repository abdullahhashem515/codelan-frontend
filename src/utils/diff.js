// Returns only the keys whose values changed between current and original.
// If original is null (first save), returns current unchanged.
export const getDiff = (current, original) => {
  if (!original) return current;
  const changed = {};
  for (const key of Object.keys(current)) {
    if (JSON.stringify(current[key]) !== JSON.stringify(original[key])) {
      changed[key] = current[key];
    }
  }
  return changed;
};

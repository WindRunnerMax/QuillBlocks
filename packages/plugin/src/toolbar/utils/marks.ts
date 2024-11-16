export const toggleMark = (key: string, value: string, preset: Record<string, string>) => {
  return { ...preset, [key]: preset[key] === value ? "" : value };
};

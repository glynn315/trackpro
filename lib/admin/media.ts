/** Parse the hidden `media` input posted by the admin MediaField. */
export function parseMediaInput(value: FormDataEntryValue | null): { type: string; path: string }[] {
  try {
    const list = JSON.parse(String(value ?? "[]"));
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

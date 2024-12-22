// Helper function to pick specific fields from an object
export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> {
  return keys.reduce(
    (acc, key) => ({
      ...acc,
      [key]: obj[key],
    }),
    {} as Pick<T, K>,
  );
}


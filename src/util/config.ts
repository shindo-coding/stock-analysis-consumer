const { env } = process;

export function getEnv(name: string) {
  if (!env[name]) {
    throw new Error(`${name} is not defined`);
  }
  return env[name]!;
}

export type Stringified<T> = string & {
  [P in keyof T]: { '_ value': T[P] }
}

export function stringify<T>(
  name: string,
  mutationName: string,
  payload: T
): Stringified<{ name: string; mutationName: string; payload?: T }> {
  return JSON.stringify({ name, mutationName, payload }) as any
}

export function parse<T>(value: Stringified<T>): T {
  return JSON.parse(value)
}

export function toUpperCase(value: string): string {
  return value.trim().toUpperCase();
}

export function capitalize(value: string): string {
  const trimmed = value.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1) : trimmed;
}

export function capitalizeArray(values: string[]): string[] {
  return values.map((value) => capitalize(value));
}

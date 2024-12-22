
export function validateBodyFields(body: any, allowedFields: string[]): void {
  const bodyFields = Object.keys(body);
  for (const field of bodyFields) {
    if (!allowedFields.includes(field)) {
      throw new Error(`Invalid field: ${field}`);
    }
  }
}

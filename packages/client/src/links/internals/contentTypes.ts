export function isOctetType(input: unknown) {
  return (
    input instanceof Uint8Array ||
    input instanceof Blob ||
    input instanceof File
  );
}

export function isFormData(input: unknown) {
  return input instanceof FormData;
}

export function isNonJsonSerializable(input: unknown) {
  return isOctetType(input) || isFormData(input);
}

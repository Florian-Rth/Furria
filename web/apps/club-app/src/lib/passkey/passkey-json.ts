import { z } from 'zod';
import { decodeBase64Url, encodeBase64Url } from './base64url';

const KNOWN_TRANSPORTS: readonly AuthenticatorTransport[] = [
  'ble',
  'hybrid',
  'internal',
  'nfc',
  'usb',
];

const isKnownTransport = (transport: string): transport is AuthenticatorTransport =>
  KNOWN_TRANSPORTS.some((known) => known === transport);

const TransportsSchema = z
  .array(z.string())
  .transform((transports) => transports.filter(isKnownTransport));

const DescriptorJsonSchema = z.object({
  type: z.literal('public-key'),
  id: z.string(),
  transports: TransportsSchema.optional(),
});
type DescriptorJson = z.infer<typeof DescriptorJsonSchema>;

const UserVerificationSchema = z.enum(['discouraged', 'preferred', 'required']);

export const PasskeyCreationOptionsJsonSchema = z.object({
  rp: z.object({ id: z.string(), name: z.string() }),
  user: z.object({ id: z.string(), name: z.string(), displayName: z.string() }),
  challenge: z.string(),
  pubKeyCredParams: z.array(z.object({ type: z.literal('public-key'), alg: z.number().int() })),
  timeout: z.number().optional(),
  excludeCredentials: z.array(DescriptorJsonSchema).optional(),
  authenticatorSelection: z
    .object({
      authenticatorAttachment: z.enum(['platform', 'cross-platform']).optional(),
      residentKey: z.enum(['discouraged', 'preferred', 'required']).optional(),
      requireResidentKey: z.boolean().optional(),
      userVerification: UserVerificationSchema.optional(),
    })
    .optional(),
  attestation: z.enum(['none', 'indirect', 'direct', 'enterprise']).optional(),
});
export type PasskeyCreationOptionsJson = z.infer<typeof PasskeyCreationOptionsJsonSchema>;

export const PasskeyRequestOptionsJsonSchema = z.object({
  challenge: z.string(),
  timeout: z.number().optional(),
  rpId: z.string().optional(),
  allowCredentials: z.array(DescriptorJsonSchema).optional(),
  userVerification: UserVerificationSchema.optional(),
});
export type PasskeyRequestOptionsJson = z.infer<typeof PasskeyRequestOptionsJsonSchema>;

const AttestationResponseJsonSchema = z.object({
  clientDataJSON: z.string(),
  attestationObject: z.string(),
  transports: z.array(z.string()).catch([]),
});

const AssertionResponseJsonSchema = z.object({
  clientDataJSON: z.string(),
  authenticatorData: z.string(),
  signature: z.string(),
  userHandle: z.string().nullable().catch(null),
});

const CREDENTIAL_FIELDS = {
  id: z.string(),
  rawId: z.string(),
  type: z.literal('public-key'),
  authenticatorAttachment: z.string().nullable().catch(null),
};

export const PasskeyAttestationJsonSchema = z.object({
  ...CREDENTIAL_FIELDS,
  response: AttestationResponseJsonSchema,
});
export type PasskeyAttestationJson = z.infer<typeof PasskeyAttestationJsonSchema>;

export const PasskeyAssertionJsonSchema = z.object({
  ...CREDENTIAL_FIELDS,
  response: AssertionResponseJsonSchema,
});
export type PasskeyAssertionJson = z.infer<typeof PasskeyAssertionJsonSchema>;

interface CredentialParts {
  id: string;
  rawId: ArrayBuffer;
  authenticatorAttachment: string | null;
}

export interface AttestationParts extends CredentialParts {
  response: {
    clientDataJSON: ArrayBuffer;
    attestationObject: ArrayBuffer;
    transports: readonly string[];
  };
}

export interface AssertionParts extends CredentialParts {
  response: {
    clientDataJSON: ArrayBuffer;
    authenticatorData: ArrayBuffer;
    signature: ArrayBuffer;
    userHandle: ArrayBuffer | null;
  };
}

const toDescriptor = (descriptor: DescriptorJson): PublicKeyCredentialDescriptor => ({
  type: descriptor.type,
  id: decodeBase64Url(descriptor.id),
  transports: descriptor.transports,
});

export const toCreationOptions = (
  json: PasskeyCreationOptionsJson,
): PublicKeyCredentialCreationOptions => ({
  rp: json.rp,
  user: {
    id: decodeBase64Url(json.user.id),
    name: json.user.name,
    displayName: json.user.displayName,
  },
  challenge: decodeBase64Url(json.challenge),
  pubKeyCredParams: json.pubKeyCredParams,
  timeout: json.timeout,
  excludeCredentials: json.excludeCredentials?.map(toDescriptor),
  authenticatorSelection: json.authenticatorSelection,
  attestation: json.attestation,
});

export const toRequestOptions = (
  json: PasskeyRequestOptionsJson,
): PublicKeyCredentialRequestOptions => ({
  challenge: decodeBase64Url(json.challenge),
  timeout: json.timeout,
  rpId: json.rpId,
  allowCredentials: json.allowCredentials?.map(toDescriptor),
  userVerification: json.userVerification,
});

export const toAttestationJson = (parts: AttestationParts): PasskeyAttestationJson => ({
  id: parts.id,
  rawId: encodeBase64Url(parts.rawId),
  type: 'public-key',
  authenticatorAttachment: parts.authenticatorAttachment,
  response: {
    clientDataJSON: encodeBase64Url(parts.response.clientDataJSON),
    attestationObject: encodeBase64Url(parts.response.attestationObject),
    transports: [...parts.response.transports],
  },
});

export const toAssertionJson = (parts: AssertionParts): PasskeyAssertionJson => ({
  id: parts.id,
  rawId: encodeBase64Url(parts.rawId),
  type: 'public-key',
  authenticatorAttachment: parts.authenticatorAttachment,
  response: {
    clientDataJSON: encodeBase64Url(parts.response.clientDataJSON),
    authenticatorData: encodeBase64Url(parts.response.authenticatorData),
    signature: encodeBase64Url(parts.response.signature),
    userHandle:
      parts.response.userHandle === null ? null : encodeBase64Url(parts.response.userHandle),
  },
});

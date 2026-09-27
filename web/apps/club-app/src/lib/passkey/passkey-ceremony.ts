import type {
  PasskeyAssertionJson,
  PasskeyAttestationJson,
  PasskeyCreationOptionsJson,
  PasskeyRequestOptionsJson,
} from './passkey-json';
import {
  PasskeyAssertionJsonSchema,
  PasskeyAttestationJsonSchema,
  toAssertionJson,
  toAttestationJson,
  toCreationOptions,
  toRequestOptions,
} from './passkey-json';

export class PasskeyUnavailableError extends Error {
  constructor() {
    super('The authenticator returned no passkey.');
    this.name = 'PasskeyUnavailableError';
  }
}

const hasJsonHelpers = (): boolean =>
  typeof PublicKeyCredential.parseCreationOptionsFromJSON === 'function' &&
  typeof PublicKeyCredential.parseRequestOptionsFromJSON === 'function';

const hasToJson = (credential: PublicKeyCredential): boolean =>
  typeof credential.toJSON === 'function';

const toPublicKeyCredential = (credential: Credential | null): PublicKeyCredential => {
  if (credential instanceof PublicKeyCredential) {
    return credential;
  }
  throw new PasskeyUnavailableError();
};

const toAttestation = (credential: PublicKeyCredential): PasskeyAttestationJson => {
  if (hasToJson(credential)) {
    return PasskeyAttestationJsonSchema.parse(credential.toJSON());
  }
  const { response } = credential;
  if (!(response instanceof AuthenticatorAttestationResponse)) {
    throw new PasskeyUnavailableError();
  }

  return toAttestationJson({
    id: credential.id,
    rawId: credential.rawId,
    authenticatorAttachment: credential.authenticatorAttachment,
    response: {
      clientDataJSON: response.clientDataJSON,
      attestationObject: response.attestationObject,
      transports: response.getTransports(),
    },
  });
};

const toAssertion = (credential: PublicKeyCredential): PasskeyAssertionJson => {
  if (hasToJson(credential)) {
    return PasskeyAssertionJsonSchema.parse(credential.toJSON());
  }
  const { response } = credential;
  if (!(response instanceof AuthenticatorAssertionResponse)) {
    throw new PasskeyUnavailableError();
  }

  return toAssertionJson({
    id: credential.id,
    rawId: credential.rawId,
    authenticatorAttachment: credential.authenticatorAttachment,
    response: {
      clientDataJSON: response.clientDataJSON,
      authenticatorData: response.authenticatorData,
      signature: response.signature,
      userHandle: response.userHandle,
    },
  });
};

export const createPasskey = async (
  options: PasskeyCreationOptionsJson,
): Promise<PasskeyAttestationJson> => {
  const publicKey = hasJsonHelpers()
    ? PublicKeyCredential.parseCreationOptionsFromJSON(options)
    : toCreationOptions(options);
  const credential = await navigator.credentials.create({ publicKey });

  return toAttestation(toPublicKeyCredential(credential));
};

export const assertPasskey = async (
  options: PasskeyRequestOptionsJson,
): Promise<PasskeyAssertionJson> => {
  const publicKey = hasJsonHelpers()
    ? PublicKeyCredential.parseRequestOptionsFromJSON(options)
    : toRequestOptions(options);
  const credential = await navigator.credentials.get({ publicKey });

  return toAssertion(toPublicKeyCredential(credential));
};

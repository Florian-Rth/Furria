import { spawn } from 'node:child_process';
import type { ZodType } from 'zod';
import { invitationTokenOf, mailSentSince } from './seed-mail.ts';
import {
  LoginResponseSchema,
  MailMessageSchema,
  MailSearchSchema,
  RedemptionSchema,
} from './seed-schemas.ts';

export interface Session {
  readonly label: string;
  readonly token: string;
}

const trimSlash = (url: string): string => url.replace(/\/$/, '');

export const API_BASE = trimSlash(process.env.SEED_API ?? 'http://localhost:5100');
const MAILPIT_BASE = trimSlash(process.env.SEED_MAILPIT ?? 'http://localhost:8025');
export const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@furria.local';
export const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'Furria-Dev-Admin-1!';
export const PERSONA_PASSWORD = process.env.SEED_PASSWORD ?? 'Furria-Persona-1!';
export const PSQL_COMMAND = process.env.SEED_PSQL ?? null;
const MAIL_WAIT_MS = 45_000;
const MAIL_POLL_MS = 750;
const MAIL_SEARCH_LIMIT = 10;
const NOT_FOUND = 404;
const TUS_VERSION = '1.0.0';
const CREATED = 201;

export const log = (line: string): void => {
  console.log(line);
};

export const fullNameOf = (firstName: string, lastName: string): string =>
  `${firstName} ${lastName}`;

export const lookUp = <TValue>(
  map: ReadonlyMap<string, TValue>,
  key: string,
  what: string,
): TValue => {
  const value = map.get(key);
  if (value === undefined) {
    throw new Error(`no ${what} "${key}"`);
  }
  return value;
};

export const request = async (
  method: string,
  route: string,
  session: Session | null,
  body?: object,
): Promise<Response> => {
  const headers: Record<string, string> = {};
  if (session !== null) {
    headers.authorization = `Bearer ${session.token}`;
  }
  if (body !== undefined) {
    headers['content-type'] = 'application/json';
  }
  const response = await fetch(`${API_BASE}/api/${route}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(
      `${method} /api/${route} as ${session?.label ?? 'anonymous'} → ${response.status} ${await response.text()}`,
    );
  }
  return response;
};

export const getJson = async <TResult>(
  route: string,
  session: Session,
  schema: ZodType<TResult>,
): Promise<TResult> => schema.parse(await (await request('GET', route, session)).json());

export const getJsonOrNull = async <TResult>(
  route: string,
  session: Session,
  schema: ZodType<TResult>,
): Promise<TResult | null> => {
  const response = await fetch(`${API_BASE}/api/${route}`, {
    headers: { authorization: `Bearer ${session.token}` },
  });
  if (response.status === NOT_FOUND) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`GET /api/${route} as ${session.label} → ${response.status}`);
  }
  return schema.parse(await response.json());
};

export const postJson = async <TResult>(
  route: string,
  session: Session | null,
  body: object,
  schema: ZodType<TResult>,
): Promise<TResult> => schema.parse(await (await request('POST', route, session, body)).json());

export const putJson = async <TResult>(
  route: string,
  session: Session,
  body: object,
  schema: ZodType<TResult>,
): Promise<TResult> => schema.parse(await (await request('PUT', route, session, body)).json());

export const send = async (
  method: 'POST' | 'PUT' | 'DELETE',
  route: string,
  session: Session,
  body?: object,
): Promise<void> => {
  await request(method, route, session, body);
};

const base64Of = (text: string): string => Buffer.from(text, 'utf8').toString('base64');

export const uploadMedia = async (
  session: Session,
  owner: string,
  fileName: string,
  bytes: Buffer,
): Promise<number> => {
  const authorization = `Bearer ${session.token}`;
  const created = await fetch(`${API_BASE}/api/media/uploads`, {
    method: 'POST',
    headers: {
      authorization,
      'tus-resumable': TUS_VERSION,
      'upload-length': String(bytes.length),
      'upload-metadata': `owner ${base64Of(owner)},filename ${base64Of(fileName)}`,
    },
  });
  const location = created.headers.get('location');
  if (created.status !== CREATED || location === null) {
    throw new Error(`creating the upload ${fileName} → ${created.status} ${await created.text()}`);
  }
  const patched = await fetch(new URL(location, API_BASE), {
    method: 'PATCH',
    headers: {
      authorization,
      'tus-resumable': TUS_VERSION,
      'upload-offset': '0',
      'content-type': 'application/offset+octet-stream',
    },
    body: new Uint8Array(bytes),
  });
  const mediaItemId = patched.headers.get('media-item-id');
  if (!patched.ok || mediaItemId === null) {
    throw new Error(`uploading ${fileName} → ${patched.status} ${await patched.text()}`);
  }
  return Number(mediaItemId);
};

export const signIn = async (label: string, email: string, password: string): Promise<Session> => {
  const login = await postJson('auth/login', null, { email, password }, LoginResponseSchema);
  return { label, token: login.accessToken };
};

export const pause = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const mailpitJson = async <TResult>(route: string, schema: ZodType<TResult>): Promise<TResult> => {
  const response = await fetch(`${MAILPIT_BASE}/api/v1/${route}`);
  if (!response.ok) {
    throw new Error(`Mailpit ${route} → ${response.status}`);
  }
  return schema.parse(await response.json());
};

const invitationTokenFor = async (email: string, sentAfter: Date): Promise<string> => {
  const deadline = Date.now() + MAIL_WAIT_MS;
  while (Date.now() < deadline) {
    const search = await mailpitJson(
      `search?query=${encodeURIComponent(`to:${email}`)}&limit=${MAIL_SEARCH_LIMIT}`,
      MailSearchSchema,
    );
    const mail = mailSentSince(search.messages, sentAfter);
    if (mail !== null) {
      const message = await mailpitJson(`message/${mail.ID}`, MailMessageSchema);
      const token = invitationTokenOf(message.Text);
      if (token === null) {
        throw new Error(`the invitation mail to ${email} carries no link`);
      }
      return token;
    }
    await pause(MAIL_POLL_MS);
  }
  throw new Error(`no invitation mail reached ${email} within ${MAIL_WAIT_MS / 1000} s`);
};

export const inviteAndRedeem = async (
  admin: Session,
  personId: number,
  email: string,
): Promise<void> => {
  const sentAfter = new Date();
  await send('POST', `manage/persons/${personId}/invitations`, admin, {});
  const token = await invitationTokenFor(email, sentAfter);
  const redemption = await postJson(
    'auth/invitations/redeem',
    null,
    { token, password: PERSONA_PASSWORD },
    RedemptionSchema,
  );
  if (redemption.outcome !== 'redeemed') {
    throw new Error(`redeeming the invitation of ${email} ended as ${redemption.outcome}`);
  }
};

export const applySql = (script: string, command: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const psql = spawn('sh', ['-c', command], { stdio: ['pipe', 'inherit', 'inherit'] });
    psql.on('error', reject);
    psql.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`psql exited with ${code}`));
      }
    });
    psql.stdin.end(script);
  });

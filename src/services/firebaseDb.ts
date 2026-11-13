import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import type { FormSchemaState } from '../constants/formSchema';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(
  app,
  (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId || '(default)'
);

export type OperationType = 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): FirestoreErrorInfo {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
  };
  console.warn('Firestore Error:', JSON.stringify(errInfo));
  return errInfo;
}

/**
 * Recursively strip `undefined` values so Firestore setDoc never rejects a document.
 */
export function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined)
      .map((item) => stripUndefined(item)) as unknown as T;
  }
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v !== undefined) {
        out[k] = stripUndefined(v);
      }
    }
    return out as T;
  }
  return value;
}

let connectionTested = false;

export async function testFirestoreConnection(): Promise<boolean> {
  if (connectionTested) return true;
  connectionTested = true;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('the client is offline') ||
        error.message.includes('Failed to get document because the client is offline'))
    ) {
      console.error('Please check your Firebase configuration (client offline).');
      return false;
    }
    // Missing document / permission on test doc still confirms network reachability
    return true;
  }
}

export async function loadSchemaFromFirestore(): Promise<Partial<FormSchemaState> | null> {
  const path = 'app_config/onboarding_schema';
  try {
    const snap = await getDoc(doc(db, 'app_config', 'onboarding_schema'));
    if (!snap.exists()) return null;
    const data = snap.data() as Record<string, any>;
    return {
      schemaVersion: data.schemaVersion,
      companyFields: data.companyFields,
      onboardingFields: data.onboardingFields,
      categoriesConfig: data.categoriesConfig,
      segmentsConfig: data.segmentsConfig,
      servicesConfig: data.servicesConfig,
      settings: data.settings,
    };
  } catch (err) {
    handleFirestoreError(err, 'get', path);
    return null;
  }
}

export async function saveSchemaToFirestore(
  schema: FormSchemaState,
  updatedBy = 'Localway Admin'
): Promise<boolean> {
  const path = 'app_config/onboarding_schema';
  try {
    const payload = stripUndefined({
      schemaVersion: schema.schemaVersion ?? 2,
      companyFields: schema.companyFields || [],
      onboardingFields: schema.onboardingFields || [],
      categoriesConfig: schema.categoriesConfig || [],
      segmentsConfig: schema.segmentsConfig || {},
      servicesConfig: schema.servicesConfig || {},
      settings: schema.settings || {
        googleScriptUrl: '',
        transferNowUrl: 'https://www.transfernow.net',
        supabaseUrl: '',
        supabaseAnonKey: '',
      },
      updatedAt: new Date().toISOString(),
      updatedBy: updatedBy.slice(0, 80) || 'Localway Admin',
    });

    await setDoc(doc(db, 'app_config', 'onboarding_schema'), payload);
    return true;
  } catch (err) {
    handleFirestoreError(err, 'write', path);
    return false;
  }
}

export async function loadSettingsFromFirestore(): Promise<FormSchemaState['settings'] | null> {
  const path = 'app_config/admin_settings';
  try {
    const snap = await getDoc(doc(db, 'app_config', 'admin_settings'));
    if (!snap.exists()) return null;
    const data = snap.data() as Record<string, any>;
    return (data.settings as FormSchemaState['settings']) || null;
  } catch (err) {
    handleFirestoreError(err, 'get', path);
    return null;
  }
}

export async function saveSettingsToFirestore(
  settings: FormSchemaState['settings'],
  updatedBy = 'Localway Admin'
): Promise<boolean> {
  const path = 'app_config/admin_settings';
  try {
    const payload = stripUndefined({
      settings: settings || {},
      googleScriptUrl: String(settings?.googleScriptUrl || '').slice(0, 500),
      transferNowUrl: String(settings?.transferNowUrl || 'https://www.transfernow.net').slice(0, 500),
      updatedAt: new Date().toISOString(),
      updatedBy: updatedBy.slice(0, 80) || 'Localway Admin',
    });
    await setDoc(doc(db, 'app_config', 'admin_settings'), payload);
    return true;
  } catch (err) {
    handleFirestoreError(err, 'write', path);
    return false;
  }
}

export interface FirestoreSubmissionRecord {
  codigoCliente: string;
  timestamp: string;
  lastModified?: string;
  finalized?: boolean;
  status?: 'Rascunho' | 'Finalizado';
  sheetSyncStatus?: 'synced' | 'pending' | 'error';
  sheetSyncError?: string | null;
  finalizedAt?: string | null;
  payload: {
    rowData: Record<string, string>;
    raw?: unknown;
    dataHora?: string;
  };
}

export async function saveSubmissionToFirestore(
  record: FirestoreSubmissionRecord
): Promise<boolean> {
  const code = String(record.codigoCliente || record.payload?.rowData?.['Código do cliente'] || '').trim().toUpperCase();
  if (!/^LW-\d{1,6}$/.test(code)) {
    return false;
  }
  const path = `onboarding_submissions/${code}`;
  try {
    const safeRowData: Record<string, string> = {};
    for (const [k, v] of Object.entries(record.payload?.rowData || {})) {
      safeRowData[k] = v == null ? '' : String(v);
    }

    const cleanDoc = stripUndefined({
      codigoCliente: code,
      timestamp: record.timestamp || new Date().toISOString(),
      lastModified: record.lastModified || new Date().toISOString(),
      finalized: Boolean(record.finalized ?? true),
      status: record.status === 'Rascunho' ? 'Rascunho' : 'Finalizado',
      sheetSyncStatus: record.sheetSyncStatus || 'pending',
      sheetSyncError: record.sheetSyncError ?? null,
      finalizedAt: record.finalizedAt ?? null,
      payload: {
        rowData: safeRowData,
        raw: record.payload?.raw ?? null,
        dataHora: record.payload?.dataHora || safeRowData['Data e hora'] || '',
      },
    });

    await setDoc(doc(db, 'onboarding_submissions', code), cleanDoc);
    return true;
  } catch (err) {
    handleFirestoreError(err, 'write', path);
    return false;
  }
}

export async function loadSubmissionsFromFirestore(): Promise<FirestoreSubmissionRecord[]> {
  const path = 'onboarding_submissions';
  try {
    const snapshot = await getDocs(collection(db, 'onboarding_submissions'));
    const list: FirestoreSubmissionRecord[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as FirestoreSubmissionRecord;
      if (data && data.payload?.rowData) {
        list.push(data);
      }
    });
    list.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
    return list;
  } catch (err) {
    handleFirestoreError(err, 'list', path);
    return [];
  }
}

export async function deleteSubmissionFromFirestore(codigoCliente: string): Promise<boolean> {
  const code = String(codigoCliente || '').trim().toUpperCase();
  if (!/^LW-\d{1,6}$/.test(code)) return false;
  const path = `onboarding_submissions/${code}`;
  try {
    await deleteDoc(doc(db, 'onboarding_submissions', code));
    return true;
  } catch (err) {
    handleFirestoreError(err, 'delete', path);
    return false;
  }
}

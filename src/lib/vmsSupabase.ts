import type {
  Alert,
  DatabaseState,
  Registration,
  SecurityRecord,
  Staff,
  User,
  VideoCapture,
} from '../types/vms';
import { getInitialDatabase, readDatabase, saveDatabase } from '../utils/dbStorage';
import { hasSupabaseConfig, supabase } from './supabase';

const tableNames = {
  users: ['user', 'users'],
  staff: ['staff'],
  registrations: ['registration', 'registrations'],
  security: ['security', 'security_records'],
  alerts: ['alert', 'alerts'],
  captures: ['video_capture', 'captures'],
} as const;

const getTableName = async (tableKey: keyof typeof tableNames) => {
  for (const table of tableNames[tableKey]) {
    const { error } = await supabase.from(table).select('id', { count: 'exact', head: true });
    if (!error) return table;
    const message = String(error.message ?? '').toLowerCase();
    if (!message.includes('does not exist') && !message.includes('relation') && !message.includes('not found')) {
      return table;
    }
  }

  return tableNames[tableKey][0];
};

const normalizeUser = (entry: Partial<User>): User => ({
  id: Number(entry.id ?? 0),
  Name: String(entry.Name ?? ''),
  Username: String(entry.Username ?? ''),
  Password: String(entry.Password ?? ''),
  Access: (entry.Access as User['Access']) ?? 'Visitor',
  Staff_No: String(entry.Staff_No ?? ''),
  isBlocked: Boolean(entry.isBlocked),
});

const normalizeStaff = (entry: Partial<Staff>): Staff => ({
  Staff_No: String(entry.Staff_No ?? ''),
  Name: String(entry.Name ?? ''),
  Email: String(entry.Email ?? ''),
  Dob: String(entry.Dob ?? ''),
  Address: String(entry.Address ?? ''),
  Degree: String(entry.Degree ?? ''),
  POS: String(entry.POS ?? ''),
  Phone_No: String(entry.Phone_No ?? ''),
  Sex: String(entry.Sex ?? ''),
  isAvailable: Boolean(entry.isAvailable),
});

const normalizeRegistration = (entry: Partial<Registration>): Registration => ({
  R_id: Number(entry.R_id ?? 0),
  Name: String(entry.Name ?? ''),
  Dated: String(entry.Dated ?? ''),
  Vtime: String(entry.Vtime ?? ''),
  Purpose: String(entry.Purpose ?? ''),
  Staff_No: String(entry.Staff_No ?? ''),
  Phone: String(entry.Phone ?? ''),
  Email: String(entry.Email ?? ''),
  Sex: String(entry.Sex ?? ''),
  Verified: Boolean(entry.Verified),
});

const normalizeSecurityRecord = (entry: Partial<SecurityRecord>): SecurityRecord => ({
  Security_ID: Number(entry.Security_ID ?? 0),
  R_id: Number(entry.R_id ?? 0),
  Staff_No: String(entry.Staff_No ?? ''),
  Visitor_Status: (entry.Visitor_Status as SecurityRecord['Visitor_Status']) ?? 'Pending',
  ID_Type: String(entry.ID_Type ?? ''),
  ID_Number: String(entry.ID_Number ?? ''),
  Check_Date: String(entry.Check_Date ?? ''),
  Check_Time: String(entry.Check_Time ?? ''),
  Security_Action: String(entry.Security_Action ?? ''),
  Remarks: String(entry.Remarks ?? ''),
  Alert_Status: (entry.Alert_Status as SecurityRecord['Alert_Status']) ?? 'Pending',
});

const normalizeAlert = (entry: Partial<Alert>): Alert => ({
  Alert_ID: Number(entry.Alert_ID ?? 0),
  R_id: Number(entry.R_id ?? 0),
  Staff_No: String(entry.Staff_No ?? ''),
  Alert_Type: String(entry.Alert_Type ?? ''),
  Alert_Message: String(entry.Alert_Message ?? ''),
  Alert_Date: String(entry.Alert_Date ?? ''),
  Alert_Time: String(entry.Alert_Time ?? ''),
  Delivery_Status: (entry.Delivery_Status as Alert['Delivery_Status']) ?? 'Pending',
  Response_Status: (entry.Response_Status as Alert['Response_Status']) ?? 'Pending',
});

const normalizeCapture = (entry: Partial<VideoCapture>): VideoCapture => ({
  Capture_ID: Number(entry.Capture_ID ?? 0),
  R_id: Number(entry.R_id ?? 0),
  Photo_Path: String(entry.Photo_Path ?? ''),
  Video_Path: entry.Video_Path ? String(entry.Video_Path) : undefined,
  Captured_At: String(entry.Captured_At ?? ''),
});

async function fetchTable<T>(tableCandidates: readonly string[], mapper: (entry: any) => T) {
  let lastError: Error | null = null;

  for (const table of tableCandidates) {
    const { data, error } = await supabase.from(table).select('*');
    if (!error) {
      return (data ?? []).map(mapper);
    }

    const message = String(error.message ?? '').toLowerCase();
    if (!(message.includes('does not exist') || message.includes('relation') || message.includes('not found'))) {
      throw error;
    }
    lastError = error;
  }

  if (lastError) {
    throw lastError;
  }

  return [];
}

export async function ensureSupabaseSeed() {
  if (!hasSupabaseConfig) return;

  const usersTable = await getTableName('users');
  const staffTable = await getTableName('staff');

  const { data: userCountData, error: userCountError } = await supabase
    .from(usersTable)
    .select('id', { count: 'exact', head: true });

  if (userCountError) {
    return;
  }

  if ((userCountData ?? null) !== null && (userCountData as unknown as { count?: number })?.count === 0) {
    const initial = getInitialDatabase();
    if (initial.staff.length > 0) {
      await supabase.from(staffTable).upsert(initial.staff, { onConflict: 'Staff_No' });
    }
    if (initial.users.length > 0) {
      await supabase.from(usersTable).upsert(initial.users, { onConflict: 'id' });
    }
  }
}

export async function readDatabaseFromSupabase(): Promise<DatabaseState> {
  if (!hasSupabaseConfig) {
    return readDatabase();
  }

  try {
    await ensureSupabaseSeed();

    const [users, staff, registrations, securityRecords, alerts, captures] = await Promise.all([
      fetchTable<User>(tableNames.users, normalizeUser),
      fetchTable<Staff>(tableNames.staff, normalizeStaff),
      fetchTable<Registration>(tableNames.registrations, normalizeRegistration),
      fetchTable<SecurityRecord>(tableNames.security, normalizeSecurityRecord),
      fetchTable<Alert>(tableNames.alerts, normalizeAlert),
      fetchTable<VideoCapture>(tableNames.captures, normalizeCapture),
    ]);

    return {
      users,
      staff,
      registrations,
      securityRecords,
      alerts,
      captures,
      movementLogs: [],
    };
  } catch {
    return readDatabase();
  }
}

export async function persistDatabaseToSupabase(database: DatabaseState) {
  if (!hasSupabaseConfig) {
    saveDatabase(database);
    return;
  }

  try {
    const [usersTable, staffTable, registrationsTable, securityTable, alertsTable, capturesTable] = await Promise.all([
      getTableName('users'),
      getTableName('staff'),
      getTableName('registrations'),
      getTableName('security'),
      getTableName('alerts'),
      getTableName('captures'),
    ]);

    await Promise.all([
      supabase.from(usersTable).upsert(database.users, { onConflict: 'id' }),
      supabase.from(staffTable).upsert(database.staff, { onConflict: 'Staff_No' }),
      supabase.from(registrationsTable).upsert(database.registrations, { onConflict: 'R_id' }),
      supabase.from(securityTable).upsert(database.securityRecords, { onConflict: 'Security_ID' }),
      supabase.from(alertsTable).upsert(database.alerts, { onConflict: 'Alert_ID' }),
      supabase.from(capturesTable).upsert(database.captures, { onConflict: 'Capture_ID' }),
    ]);

    saveDatabase(database);
  } catch {
    saveDatabase(database);
  }
}

export async function loginWithSupabase(username: string, password: string): Promise<User | null> {
  const database = await readDatabaseFromSupabase();
  const match = database.users.find(
    (candidate) =>
      candidate.Username.toLowerCase() === username.trim().toLowerCase() &&
      candidate.Password === password &&
      !candidate.isBlocked,
  );

  return match ?? null;
}

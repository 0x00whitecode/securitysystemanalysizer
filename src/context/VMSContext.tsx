import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Alert, DatabaseState, MovementLog, MovementStatus, Registration, SecurityRecord, Staff, User, VideoCapture } from '../types/vms';
import { persistDatabaseToSupabase, readDatabaseFromSupabase } from '../lib/vmsSupabase';
import { readDatabase, saveDatabase } from '../utils/dbStorage';

interface VMSContextValue {
  database: DatabaseState;
  staff: Staff[];
  users: User[];
  registrations: Registration[];
  securityRecords: SecurityRecord[];
  alerts: Alert[];
  captures: VideoCapture[];
  movementLogs: MovementLog[];
  addStaff: (staff: Staff) => Staff;
  addUser: (user: User) => User;
  updateUserRole: (userId: number, role: User['Access']) => User | null;
  resetUserPassword: (userId: number, password?: string) => User | null;
  toggleUserBlock: (userId: number) => User | null;
  createRegistration: (registration: Registration) => Registration;
  submitSecurityDecision: (decision: {
    R_id: number;
    Staff_No: string;
    Host_Staff_No?: string;
    Visitor_Status: 'Approved' | 'Rejected';
    ID_Type: string;
    ID_Number: string;
    Security_Action: string;
    Remarks: string;
    Alert_Status: 'Pending' | 'Sent';
  }) => SecurityRecord;
  addAlert: (alert: Alert) => Alert;
  acknowledgeAlert: (alertId: number, status: 'Acknowledged' | 'Resolved') => Alert | null;
  addCapture: (capture: VideoCapture) => VideoCapture;
  addMovementLog: (log: MovementLog) => MovementLog;
  updateMovementStatus: (moveId: number, status: MovementStatus, location?: string) => MovementLog | null;
  resetSystemData: () => void;
}

const VMSContext = createContext<VMSContextValue | undefined>(undefined);

export function VMSProvider({ children }: { children: ReactNode }) {
  const [database, setDatabase] = useState<DatabaseState>(() => readDatabase());

  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      try {
        const loaded = await readDatabaseFromSupabase();
        if (active) {
          setDatabase(loaded);
        }
      } catch {
        if (active) {
          setDatabase(readDatabase());
        }
      }
    };

    void hydrate();

    return () => {
      active = false;
    };
  }, []);

  const save = async (next: DatabaseState) => {
    setDatabase(next);
    await persistDatabaseToSupabase(next);
    saveDatabase(next);
  };

  const addStaff = (staff: Staff) => {
    const next = {
      ...database,
      staff: [...database.staff, staff],
    };
    void save(next);
    return staff;
  };

  const addUser = (user: User) => {
    const next = {
      ...database,
      users: [...database.users, user],
    };
    void save(next);
    return user;
  };

  const toggleUserBlock = (userId: number) => {
    const target = database.users.find((user) => user.id === userId);
    if (!target) return null;

    const updated = {
      ...target,
      isBlocked: !target.isBlocked,
    };

    const next = {
      ...database,
      users: database.users.map((user) => (user.id === userId ? updated : user)),
    };

    void save(next);
    return updated;
  };

  const updateUserRole = (userId: number, role: User['Access']) => {
    const target = database.users.find((user) => user.id === userId);
    if (!target) return null;

    const updated = {
      ...target,
      Access: role,
    };

    const next = {
      ...database,
      users: database.users.map((user) => (user.id === userId ? updated : user)),
    };

    void save(next);
    return updated;
  };

  const resetUserPassword = (userId: number, password = '12345') => {
    const target = database.users.find((user) => user.id === userId);
    if (!target) return null;

    const updated = {
      ...target,
      Password: password,
    };

    const next = {
      ...database,
      users: database.users.map((user) => (user.id === userId ? updated : user)),
    };

    void save(next);
    return updated;
  };

  const createRegistration = (registration: Registration) => {
    const next = {
      ...database,
      registrations: [...database.registrations, registration],
    };
    void save(next);
    return registration;
  };

  const addCapture = (capture: VideoCapture) => {
    const next = {
      ...database,
      captures: [...database.captures, capture],
    };
    void save(next);
    return capture;
  };

  const addMovementLog = (log: MovementLog) => {
    const next = {
      ...database,
      movementLogs: [...database.movementLogs, log],
    };
    void save(next);
    return log;
  };

  const updateMovementStatus = (moveId: number, status: MovementStatus, location = 'Gatehouse') => {
    const target = database.movementLogs.find((log) => log.Move_ID === moveId);
    if (!target) return null;

    const updated: MovementLog = {
      ...target,
      Status: status,
      Location: location,
      Last_Updated: new Date().toISOString(),
    };

    const next = {
      ...database,
      movementLogs: database.movementLogs.map((log) => (log.Move_ID === moveId ? updated : log)),
    };

    void save(next);
    return updated;
  };

  const addAlert = (alert: Alert) => {
    const next = {
      ...database,
      alerts: [...database.alerts, alert],
    };
    void save(next);
    return alert;
  };

  const acknowledgeAlert = (alertId: number, status: 'Acknowledged' | 'Resolved') => {
    const target = database.alerts.find((alert) => alert.Alert_ID === alertId);
    if (!target) return null;

    const updated: Alert = {
      ...target,
      Response_Status: status,
      Delivery_Status: 'Delivered',
    };

    const next: DatabaseState = {
      ...database,
      alerts: database.alerts.map((alert) => (alert.Alert_ID === alertId ? updated : alert)),
    };

    save(next);
    return updated;
  };

  const submitSecurityDecision = (decision: {
    R_id: number;
    Staff_No: string;
    Host_Staff_No?: string;
    Visitor_Status: 'Approved' | 'Rejected';
    ID_Type: string;
    ID_Number: string;
    Security_Action: string;
    Remarks: string;
    Alert_Status: 'Pending' | 'Sent';
  }) => {
    const securityEntry: SecurityRecord = {
      Security_ID: Date.now(),
      R_id: decision.R_id,
      Staff_No: decision.Staff_No,
      Visitor_Status: decision.Visitor_Status,
      ID_Type: decision.ID_Type,
      ID_Number: decision.ID_Number,
      Check_Date: new Date().toISOString().slice(0, 10),
      Check_Time: new Date().toTimeString().slice(0, 5),
      Security_Action: decision.Security_Action,
      Remarks: decision.Remarks,
      Alert_Status: decision.Alert_Status,
    };

    const registration = database.registrations.find((entry) => entry.R_id === decision.R_id);
    const nextRegistrations = database.registrations.map((entry) =>
      entry.R_id === decision.R_id ? { ...entry, Verified: decision.Visitor_Status === 'Approved' } : entry,
    );

    const alertMessage =
      decision.Visitor_Status === 'Approved'
        ? `${registration?.Name ?? 'Visitor'} has been approved and is now cleared to enter the facility.`
        : `${registration?.Name ?? 'Visitor'} was rejected after security verification.`;

    const nextAlert: Alert = {
      Alert_ID: Date.now() + 1,
      R_id: decision.R_id,
      Staff_No: decision.Host_Staff_No ?? decision.Staff_No,
      Alert_Type: decision.Visitor_Status === 'Approved' ? 'Arrival' : 'Security',
      Alert_Message: alertMessage,
      Alert_Date: new Date().toISOString().slice(0, 10),
      Alert_Time: new Date().toTimeString().slice(0, 5),
      Delivery_Status: decision.Alert_Status === 'Sent' ? 'Sent' : 'Pending',
      Response_Status: 'Pending',
    };

    const movementLog: MovementLog | null =
      decision.Visitor_Status === 'Approved'
        ? {
            Move_ID: Date.now() + 2,
            R_id: decision.R_id,
            Visitor_Name: registration?.Name ?? 'Visitor',
            Location: 'Gatehouse',
            Status: 'Checked In',
            Last_Updated: new Date().toISOString(),
          }
        : null;

    const autoMovementUpdate =
      decision.Visitor_Status === 'Approved'
        ? { ...database, movementLogs: movementLog ? [...database.movementLogs, movementLog] : database.movementLogs }
        : database;

    const next: DatabaseState = {
      ...autoMovementUpdate,
      registrations: nextRegistrations,
      securityRecords: [...database.securityRecords, securityEntry],
      alerts: [...database.alerts, nextAlert],
    };

    void save(next);
    return securityEntry;
  };

  const resetSystemData = async () => {
    const fresh = readDatabase();
    setDatabase(fresh);
    await persistDatabaseToSupabase(fresh);
  };

  const value = useMemo<VMSContextValue>(
    () => ({
      database,
      staff: database.staff,
      users: database.users,
      registrations: database.registrations,
      securityRecords: database.securityRecords,
      alerts: database.alerts,
      captures: database.captures,
      movementLogs: database.movementLogs,
      addStaff,
      addUser,
      updateUserRole,
      resetUserPassword,
      toggleUserBlock,
      createRegistration,
      submitSecurityDecision,
      addAlert,
      acknowledgeAlert,
      addCapture,
      addMovementLog,
      updateMovementStatus,
      resetSystemData,
    }),
    [database],
  );

  return <VMSContext.Provider value={value}>{children}</VMSContext.Provider>;
}

export function useVMS() {
  const context = useContext(VMSContext);

  if (!context) {
    throw new Error('useVMS must be used within a VMSProvider');
  }

  return context;
}

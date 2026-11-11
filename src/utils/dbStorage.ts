import type { DatabaseState, Staff, User } from '../types/vms';

export const STORAGE_KEY = 'vms-state';

const defaultStaff: Staff[] = [
  {
    Staff_No: 'ADM-001',
    Name: 'System Administrator',
    Email: 'admin@northgate.local',
    Dob: '1985-01-15',
    Address: 'Head Office',
    Degree: 'MBA',
    POS: 'Administrator',
    Phone_No: '+2348000000001',
    Sex: 'Male',
    isAvailable: true,
  },
  {
    Staff_No: 'SEC-001',
    Name: 'Security Desk',
    Email: 'security@northgate.local',
    Dob: '1988-04-12',
    Address: 'Main Gate Office',
    Degree: 'Security Management',
    POS: 'Head of Security',
    Phone_No: '+2348000000002',
    Sex: 'Female',
    isAvailable: true,
  },
  {
    Staff_No: 'FAC-201',
    Name: 'Faculty Host',
    Email: 'host@northgate.local',
    Dob: '1990-09-21',
    Address: 'Academic Block A',
    Degree: 'B.Sc. Computer Science',
    POS: 'Departmental Coordinator',
    Phone_No: '+2348000000003',
    Sex: 'Male',
    isAvailable: true,
  },
  {
    Staff_No: 'VIS-001',
    Name: 'Visitor Access Desk',
    Email: 'visitor@northgate.local',
    Dob: '1993-06-30',
    Address: 'Visitor Lounge',
    Degree: 'Public Administration',
    POS: 'Visitor Support',
    Phone_No: '+2348000000004',
    Sex: 'Female',
    isAvailable: true,
  },
];

const defaultUsers: User[] = [
  {
    id: 1,
    Name: 'System Administrator',
    Username: 'admin',
    Password: 'admin123',
    Access: 'Admin',
    Staff_No: 'ADM-001',
    isBlocked: false,
  },
  {
    id: 2,
    Name: 'Security Desk',
    Username: 'security',
    Password: 'security123',
    Access: 'Security',
    Staff_No: 'SEC-001',
    isBlocked: false,
  },
  {
    id: 3,
    Name: 'Faculty Host',
    Username: 'staff',
    Password: 'staff123',
    Access: 'Staff',
    Staff_No: 'FAC-201',
    isBlocked: false,
  },
  {
    id: 4,
    Name: 'Visitor Portal User',
    Username: 'visitor',
    Password: 'visitor123',
    Access: 'Visitor',
    Staff_No: 'VIS-001',
    isBlocked: false,
  },
];

export const getInitialDatabase = (): DatabaseState => ({
  users: defaultUsers,
  staff: defaultStaff,
  registrations: [],
  securityRecords: [],
  alerts: [],
  captures: [],
  movementLogs: [],
});

export const readDatabase = (): DatabaseState => {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    const initial = getInitialDatabase();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }

  try {
    return JSON.parse(raw) as DatabaseState;
  } catch {
    const initial = getInitialDatabase();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
};

export const saveDatabase = (database: DatabaseState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
};

export const resetDatabase = () => {
  const initial = getInitialDatabase();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

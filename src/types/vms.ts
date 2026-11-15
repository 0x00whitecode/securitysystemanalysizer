export type AccessLevel = 'Admin' | 'Security' | 'Staff' | 'Visitor';
export type VisitorStatus = 'Pending' | 'Approved' | 'Rejected';
export type AlertStatus = 'Pending' | 'Sent' | 'Failed' | 'Delivered';
export type ResponseStatus = 'Pending' | 'Acknowledged' | 'Resolved';
export type HostApprovalStatus = 'Pending' | 'Approved' | 'Rejected' | 'Expired';

export interface User {
  id: number;
  Name: string;
  Username: string;
  Password: string;
  Access: AccessLevel;
  Staff_No: string;
  isBlocked?: boolean;
}

export interface Staff {
  Staff_No: string;
  Name: string;
  Email: string;
  Dob: string;
  Address: string;
  Qualification: string;
  POS: string;
  Phone_No: string;
  Sex: string;
  isAvailable?: boolean;
}

export interface Registration {
  R_id: number;
  Name: string;
  Dated: string;
  Vtime: string;
  Purpose: string;
  Staff_No: string;
  Phone: string;
  Email: string;
  Sex: string;
  Host_Approval_Status?: HostApprovalStatus;
  Host_Request_At?: string;
  Host_Approval_At?: string;
  Host_Approved_By?: string;
  Verified?: boolean;
}

export interface SecurityRecord {
  Security_ID: number;
  R_id: number;
  Staff_No: string;
  Visitor_Status: VisitorStatus;
  ID_Type: string;
  ID_Number: string;
  Check_Date: string;
  Check_Time: string;
  Security_Action: string;
  Remarks: string;
  Alert_Status: AlertStatus;
}

export interface Alert {
  Alert_ID: number;
  R_id: number;
  Staff_No: string;
  Alert_Type: string;
  Alert_Message: string;
  Alert_Date: string;
  Alert_Time: string;
  Delivery_Status: AlertStatus;
  Response_Status: ResponseStatus;
}

export interface VideoCapture {
  Capture_ID: number;
  R_id: number;
  Photo_Path: string;
  Video_Path?: string;
  Captured_At: string;
}

export type MovementStatus = 'Checked In' | 'At Reception' | 'Inside Premises' | 'Exited';

export interface MovementLog {
  Move_ID: number;
  R_id: number;
  Visitor_Name: string;
  Location: string;
  Status: MovementStatus;
  Last_Updated: string;
}

export interface DatabaseState {
  users: User[];
  staff: Staff[];
  registrations: Registration[];
  securityRecords: SecurityRecord[];
  alerts: Alert[];
  captures: VideoCapture[];
  movementLogs: MovementLog[];
}

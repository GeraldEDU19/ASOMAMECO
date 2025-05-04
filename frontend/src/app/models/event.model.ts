export interface Event {
  _id?: string;
  name: string;
  description: string;
  date: string;
  location: string;
  active: boolean;
  attendees: string[];  // Array of affiliate IDs
  attendances: any[];   // Array of attendance records
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  capacity: number;
  status: string;
}

export interface EventResponse {
  controlled: boolean;
  data: Event[] | EventReport;
  message: string;
  status: string;
  success: boolean;
}

export interface EventReport {
  totalAttendances: number;
  confirmed: number;
  notConfirmed: number;
  attended: number;
  confirmedButDidNotAttend: number;
} 
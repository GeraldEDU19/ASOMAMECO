export interface Affiliate {
  _id: string;
  fullName: string;
  externalId: string;
  email: string;
}

export interface Attendance {
  _id: string;
  event: string;
  affiliate: Affiliate;
  attended: boolean;
  confirmed: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface AttendanceResponse {
  controlled: boolean;
  data: Attendance[];
  message: string;
  status: string;
  success: boolean;
} 
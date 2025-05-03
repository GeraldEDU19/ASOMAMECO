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
}

export interface EventResponse {
  controlled: boolean;
  data: Event[];
  message: string;
  status: string;
  success: boolean;
} 
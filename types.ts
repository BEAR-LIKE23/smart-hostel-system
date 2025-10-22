export interface Student {
  id: string; // Using Supabase UUID
  created_at: string;
  name: string;
  email: string;
  level: string; // e.g., '100L', '200L'
  gender: 'Male' | 'Female';
  room_id: number | null;
  rooms: Room | null; // Represents the joined room data
}

export interface Room {
  id: number;
  created_at: string;
  room_number: string;
  capacity: number;
  gender_type: 'Male' | 'Female' | 'Mixed';
  students?: { count: number }[];
}

export interface Complaint {
    id: number;
    created_at: string;
    student_id: string;
    student_name: string; // Denormalized for easier display
    room_number: string; // Denormalized for easier display
    description: string;
    status: 'Pending' | 'In Progress' | 'Resolved';
}

// NEW: Added Announcement interface
export interface Announcement {
    id: number;
    created_at: string;
    title: string;
    content: string;
}


// FIX: Added back the announcement modal types
export type ModalType = 'view' | 'viewComplaints' | 'submitComplaint' | 'roomOccupancy' | 'assignRoom' | 'viewRoommates' | 'addRoom' | 'studentProfile' | 'editProfile' | 'postAnnouncement' | 'viewAnnouncements' | null;
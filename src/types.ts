export type RoleClearance = 'coach' | 'admin' | 'player';

export type AttendanceState = 'present' | 'absent' | 'late';

export type PositionCode = 'GK' | 'DEF' | 'MID' | 'FWD';

export type SquadCategory = 'U-17 Academy' | 'U-15 Boys' | 'U-10 kids' | 'Girls Elite' | 'U-19 Reserves';

export interface Player {
  id: string;
  name: string;
  nickname?: string;
  photoUrl: string;
  kitNumber: number;
  position: PositionCode;
  positionFull: string;
  roleBadge?: string;
  squadCategory: SquadCategory;
  seasonFitRate: number;
  tacticalStatus: string;
  attendanceStatus: AttendanceState;
  coachNote: string;
  noteIcon: string;
  division?: string;
  kitSize?: string;
  emergencyContact?: {
    guardianName: string;
    phone: string;
    relationship: string;
  };
  medicalNotes?: string;
  preferredFoot?: 'Right' | 'Left' | 'Both';
  sprintSpeed?: string;
  matchFitnessRating?: number;
}

export interface TrainingSession {
  id: string;
  pitch: string;
  title: string;
  subtitle: string;
  timeRange: string;
  kitNotice: string;
  enrolledSquad: string;
}

export interface RegistrationFormData {
  fullName: string;
  nickname: string;
  dobDay: string;
  dobMonth: string;
  dobYear: string;
  position: PositionCode;
  kitNumber: number;
  kitSize: string;
  trainingSlot: 'A' | 'B';
  guardianName: string;
  guardianPhone: string;
  relationship: string;
  medicalNotes: string;
  termsAccepted: boolean;
  photoUrl: string;
}

export type UserRole = 'student' | 'teacher' | 'admin';
export type EducationLevel = 'primary' | 'middle' | 'secondary' | 'university';
export type PremiumPackage = 'none' | 'bronze' | 'silver' | 'gold';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  role: UserRole;
  wilaya: string;
  phoneNumber?: string;
  level?: EducationLevel;
  subjects?: string[];
  levels?: string[];
  proofOfCompetence?: string;
  ccp?: string;
  edahabia?: string;
  walletBalance: number;
  totalEarnings: number;
  premiumPackage: PremiumPackage;
  premiumExpiry?: string;
  rating: number;
  ratingCount: number;
  createdAt: string;
}

export interface Course {
  id: string;
  teacherId: string;
  teacherName: string;
  title: string;
  description: string;
  subject: string;
  level: string;
  semester: number;
  monthNumber: number;
  contentType: 'video' | 'pdf' | 'quiz' | 'mixed';
  contentUrl: string;
  isFree: boolean;
  publishedAt: string;
}

export interface Subscription {
  id: string;
  studentId: string;
  teacherId: string;
  type: 'monthly' | 'quarterly' | 'yearly' | 'late_access';
  monthNumber?: number;
  amount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired';
}

export interface Group {
  id: string;
  teacherId: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Exercise {
  id: string;
  groupId: string;
  title: string;
  contentUrl: string;
  deadline: string;
  correctionUrl?: string;
  createdAt: string;
}

export interface Submission {
  id: string;
  exerciseId: string;
  studentId: string;
  studentName: string;
  contentUrl: string;
  submittedAt: string;
}

export interface PrivateChat {
  id: string;
  studentId: string;
  teacherId: string;
  amount: number;
  durationMinutes: number;
  expiresAt: string;
  status: 'active' | 'expired';
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'payment' | 'earning';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

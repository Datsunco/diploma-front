export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'employee';
    avatar?: string;
    teamId?: string;
    createdAt: string;
    updatedAt: string;
  }
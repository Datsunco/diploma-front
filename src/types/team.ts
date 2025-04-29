import { User } from './user';

export interface Team {
  id: string;
  name: string;
  description?: string;
  members?: User[];
  leaderId?: string;
  createdAt: string;
  updatedAt: string;
}
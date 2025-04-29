export interface Report {
    id: string;
    title: string;
    description: string;
    date: string;
    teamId?: string;
    taskIds?: string[];
    attachments?: string[];
    createdBy: string;
    createdAt: string;
    updatedAt: string;
  }
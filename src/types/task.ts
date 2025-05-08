export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  assigneeId: string | null;
  assigneeName?: string;
  teamId: string | null;
  teamName?: string;
  tags: string[];
  attachments?: Attachment[];
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
  comments?: TaskComment[];
  photos?: TaskPhoto[];
  qrCodes?: TaskQrCode[];
}

export type TaskStatus =
  | "todo"
  | "in_progress"
  | "completed"
  | "overdue"
  | "review"
  | "done";

export interface TaskComment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface TaskPhoto {
  id: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface TaskQrCode {
  id: string;
  data: string;
  scannedAt: string;
  scannedBy: string;
}

export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  authorName: string;
}

export interface TaskFilter {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assigneeId?: string;
  teamId?: string;
  search?: string;
  tags?: string[];
  startDate?: string;
  endDate?: string;
}

export interface TaskSort {
  field:
    | "title"
    | "dueDate"
    | "priority"
    | "status"
    | "createdAt"
    | "updatedAt";
  direction: "asc" | "desc";
}

export interface TasksResponse {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  assigneeId?: string | null;
  teamId?: string | null;
  tags?: string[];
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  id: string;
}

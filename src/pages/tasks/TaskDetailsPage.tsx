import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetTaskByIdQuery,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from "@/store/api/taskApi";
import { useGetTeamsQuery } from "@/store/api/teamApi";
import { useAppSelector } from "@/hooks/redux";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TaskStatus } from "@/types/task";
import { format } from "date-fns";
import {
  ArrowLeft,
  Clock,
  Edit,
  Trash,
  Users,
  User,
  AlertTriangle,
  CheckCircle,
  BarChart,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const TaskDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAppSelector((state) => state.auth);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  // Получение данных задачи и команд
  const { data: task, isLoading, error } = useGetTaskByIdQuery(id as string);
  const { data: teamsData } = useGetTeamsQuery();

  // Мутации для обновления и удаления задачи
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  // Обработчик изменения статуса задачи
  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task) return;

    setStatusUpdateLoading(true);
    try {
      await updateTask({
        id: task.id,
        status: newStatus,
      }).unwrap();

      toast({
        title: "Status updated",
        description: `Task status changed to ${newStatus.replace("_", " ")}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to update status",
        description: "There was an error updating the task status.",
      });
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  // Обработчик удаления задачи
  const handleDeleteTask = async () => {
    if (!task) return;

    try {
      await deleteTask(task.id).unwrap();
      toast({
        title: "Task deleted",
        description: "The task has been successfully deleted.",
      });
      navigate("/tasks");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to delete task",
        description: "There was an error deleting the task.",
      });
    }
  };

  // Функция для отображения статуса задачи
  const renderTaskStatus = (status: TaskStatus) => {
    switch (status) {
      case "todo":
        return (
          <Badge variant="outline" className="bg-gray-100">
            To Do
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            In Progress
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Completed
          </Badge>
        );
      case "overdue":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Overdue
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Функция для отображения приоритета задачи
  const renderPriority = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case "low":
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Normal</Badge>;
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !task) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load task details. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const team = teamsData?.find((t) => t.id === task.teamId);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate("/tasks")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tasks
        </Button>
        <h1 className="text-3xl font-bold">{task.title}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Основная информация */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Details</CardTitle>
              <div className="flex space-x-2 mt-2">
                {renderTaskStatus(task.status)}
                {renderPriority(task.priority || "normal")}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Description
                  </h3>
                  <p className="mt-1">
                    {task.description || "No description provided."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Created At
                    </h3>
                    <p className="mt-1">
                      {format(new Date(task.createdAt), "MMM dd, yyyy HH:mm")}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Due Date
                    </h3>
                    <p className="mt-1 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {format(new Date(task.dueDate || ""), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Team
                    </h3>
                    <p className="mt-1 flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {team?.name || "No team assigned"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Assignee
                    </h3>
                    <p className="mt-1 flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {task.assignee?.name || "Unassigned"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => navigate(`/tasks/${task.id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Task
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete Task
              </Button>
            </CardFooter>
          </Card>

          {/* Комментарии или дополнительная информация */}
          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea placeholder="Add a comment..." className="mb-4" />
              <Button>Add Comment</Button>

              <div className="mt-6">
                <p className="text-center text-muted-foreground">
                  No comments yet.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Изменение статуса */}
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={task.status}
                onValueChange={handleStatusChange}
                disabled={statusUpdateLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      To Do
                    </div>
                  </SelectItem>
                  <SelectItem value="in_progress">
                    <div className="flex items-center">
                      <BarChart className="h-4 w-4 mr-2" />
                      In Progress
                    </div>
                  </SelectItem>
                  <SelectItem value="completed">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Completed
                    </div>
                  </SelectItem>
                  <SelectItem value="overdue">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Overdue
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Информация о команде */}
          {team && (
            <Card>
              <CardHeader>
                <CardTitle>Team</CardTitle>
                <CardDescription>{team.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Team Members:</p>
                  <div className="space-y-2">
                    {team.members && team.members?.length > 0 ? (
                      team.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center space-x-2"
                        >
                          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            {member.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase() || "U"}
                          </div>
                          <span>{member.name}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No members in this team.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Диалог подтверждения удаления */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Are you sure you want to delete this task?
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              task and remove it from our servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTask}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskDetailsPage;

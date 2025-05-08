import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetTaskByIdQuery,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useUploadTaskPhotoMutation,
  useAddQrCodeToTaskMutation,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Camera,
  QrCode,
  Image,
  MessageSquare,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import CameraCapture from "@/components/tasks/CameraCapture";
import QRCodeScanner from "@/components/tasks/QRCodeScanner";
import PhotoGallery from "@/components/tasks/PhotoGallery";
import ImageUploader from "./ImageUploader";

const TaskDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAppSelector((state) => state.auth);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [qrCodes, setQrCodes] = useState<string[]>([]);

  // Получение данных задачи и команд
  const {
    data: task,
    isLoading,
    error,
    refetch,
  } = useGetTaskByIdQuery(id as string);
  const { data: teamsData } = useGetTeamsQuery();

  // Мутации для обновления и удаления задачи
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [uploadPhoto, { isLoading: isUploading }] =
    useUploadTaskPhotoMutation();
  const [addQrCode, { isLoading: isAddingQr }] = useAddQrCodeToTaskMutation();

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

  // Обработчик добавления комментария
  const handleAddComment = async () => {
    if (!task || !comment.trim()) return;

    try {
      await updateTask({
        id: task.id,
        // comments: [
        //   ...(task.comments || []),
        //   {
        //     id: Date.now().toString(),
        //     text: comment,
        //     userId: user?.id || "unknown",
        //     userName: user?.name || "Unknown User",
        //     createdAt: new Date().toISOString(),
        //   },
        // ],
      }).unwrap();

      setComment("");
      toast({
        title: "Comment added",
        description: "Your comment has been added to the task.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to add comment",
        description: "There was an error adding your comment.",
      });
    }
  };

  // Обработчик захвата фотографии
  const handleCapturePhoto = async (photoData: string) => {
    if (!task) return;

    try {
      await uploadPhoto({
        taskId: task.id,
        photoData,
      }).unwrap();

      // Добавляем фото в локальный массив для немедленного отображения
      setPhotos([...photos, photoData]);

      toast({
        title: "Photo uploaded",
        description: "The photo has been added to the task.",
      });

      // Обновляем данные задачи
      refetch();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to upload photo",
        description: "There was an error uploading the photo.",
      });
    }
  };

  // Обработчик сканирования QR-кода
  const handleQrCodeScan = async (qrData: string) => {
    if (!task) return;

    try {
      await addQrCode({
        taskId: task.id,
        qrData,
      }).unwrap();

      // Добавляем QR-код в локальный массив
      setQrCodes([...qrCodes, qrData]);

      toast({
        title: "QR Code added",
        description: "The QR code has been added to the task.",
      });

      // Обновляем данные задачи
      refetch();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to add QR code",
        description: "There was an error adding the QR code.",
      });
    }
  };

  // Обработчик удаления фотографии
  const handleRemovePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
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
                      {format(
                        new Date(task.createdAt || Date.now()),
                        "MMM dd, yyyy HH:mm"
                      )}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Due Date
                    </h3>
                    <p className="mt-1 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {format(
                        new Date(task.dueDate || Date.now()),
                        "MMM dd, yyyy"
                      )}
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

          {/* Вкладки для фото, QR-кодов и комментариев */}
          <Tabs defaultValue="comments" className="w-full">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="comments">
                <MessageSquare className="h-4 w-4 mr-2" />
                Comments
              </TabsTrigger>
              <TabsTrigger value="photos">
                <Image className="h-4 w-4 mr-2" />
                Photos
              </TabsTrigger>
              <TabsTrigger value="qrcodes">
                <QrCode className="h-4 w-4 mr-2" />
                QR Codes
              </TabsTrigger>
            </TabsList>

            {/* Вкладка комментариев */}
            <TabsContent value="comments">
              <Card>
                <CardHeader>
                  <CardTitle>Comments</CardTitle>
                  <CardDescription>Task discussion and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {task.comments && task.comments.length > 0 ? (
                      task.comments.map((comment) => (
                        <div key={comment.id} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div className="font-medium">
                              {comment.userName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(
                                new Date(comment.createdAt),
                                "MMM dd, yyyy HH:mm"
                              )}
                            </div>
                          </div>
                          <p className="mt-2">{comment.text}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-4">
                        No comments yet.
                      </p>
                    )}
                  </div>

                  <div className="mt-6">
                    <Textarea
                      placeholder="Add a comment..."
                      className="mb-4"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <Button
                      onClick={handleAddComment}
                      disabled={!comment.trim()}
                    >
                      Add Comment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Вкладка фотографий */}
            <TabsContent value="photos">
              <Card>
                <CardHeader>
                  <CardTitle>Photos</CardTitle>
                  <CardDescription>
                    Capture and view task-related images
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 mb-6">
                    <CameraCapture onCapture={handleCapturePhoto} />
                    <ImageUploader
                      onUpload={handleCapturePhoto}
                      isLoading={isUploading}
                    />
                  </div>

                  {/* Отображение фотографий */}
                  {task.photos && task.photos.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {task.photos.map((photo, index) => (
                        <Card
                          key={index}
                          className="relative overflow-hidden group"
                        >
                          <CardContent className="p-0">
                            <img
                              src={photo.url}
                              alt={`Photo ${index + 1}`}
                              className="w-full aspect-square object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => window.open(photo.url, "_blank")}
                              >
                                View Full Size
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Image className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">
                        No photos added yet.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Take a photo to document your progress.
                      </p>
                    </div>
                  )}

                  {/* Отображение локально добавленных фотографий */}
                  <PhotoGallery photos={photos} onRemove={handleRemovePhoto} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Вкладка QR-кодов */}
            <TabsContent value="qrcodes">
              <Card>
                <CardHeader>
                  <CardTitle>QR Codes</CardTitle>
                  <CardDescription>
                    Scan and manage QR codes for this task
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <QRCodeScanner onScan={handleQrCodeScan} />
                  </div>

                  {/* Отображение QR-кодов */}
                  {(task.qrCodes && task.qrCodes.length > 0) ||
                  qrCodes.length > 0 ? (
                    <div className="space-y-4">
                      {task.qrCodes &&
                        task.qrCodes.map((qrCode, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <div className="font-medium">
                                QR Code {index + 1}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {format(
                                  new Date(qrCode.scannedAt),
                                  "MMM dd, yyyy HH:mm"
                                )}
                              </div>
                            </div>
                            <p className="mt-2 break-all">{qrCode.data}</p>
                          </div>
                        ))}

                      {qrCodes.map((qrData, index) => (
                        <div
                          key={`local-${index}`}
                          className="border rounded-lg p-3"
                        >
                          <div className="flex justify-between items-start">
                            <div className="font-medium">QR Code (New)</div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(), "MMM dd, yyyy HH:mm")}
                            </div>
                          </div>
                          <p className="mt-2 break-all">{qrData}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <QrCode className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">
                        No QR codes scanned yet.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Scan a QR code to track equipment or locations.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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
          {team && team.members && (
            <Card>
              <CardHeader>
                <CardTitle>Team</CardTitle>
                <CardDescription>{team.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Team Members:</p>
                  <div className="space-y-2">
                    {team.members?.length > 0 ? (
                      team.members.map((member: any) => (
                        <div
                          key={member.id}
                          className="flex items-center space-x-2"
                        >
                          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            {member.name
                              ?.split(" ")
                              .map((n: any) => n[0])
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

          {/* Быстрые действия */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate(`/tasks/${task.id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Task
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.print()}
              >
                <Image className="h-4 w-4 mr-2" />
                Print Task
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  const el = document.createElement("textarea");
                  el.value = window.location.href;
                  document.body.appendChild(el);
                  el.select();
                  document.execCommand("copy");
                  document.body.removeChild(el);
                  toast({
                    title: "Link Copied",
                    description: "Task link copied to clipboard",
                  });
                }}
              >
                <Users className="h-4 w-4 mr-2" />
                Share Task
              </Button>
            </CardContent>
          </Card>
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

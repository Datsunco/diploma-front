import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateTaskMutation } from "@/store/api/taskApi";
import { useGetTeamByIdQuery, useGetTeamsQuery } from "@/store/api/teamApi";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Схема валидации формы
const taskSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters" })
    .max(100),
  description: z.string().optional(),
  dueDate: z.string().min(1, { message: "Due date is required" }),
  teamId: z.string().optional(),
  assigneeId: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

const CreateTaskPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Получение данных о командах
  const { data: teamsData, isLoading: isTeamsLoading } = useGetTeamsQuery();

  // Инициализация формы
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: new Date().toISOString().split("T")[0], // Сегодняшняя дата как значение по умолчанию
      priority: "medium",
      teamId: "",
      assigneeId: "",
    },
  });

  // Получение данных о членах команды
  const {
    data: teamUsersData,
    isLoading: isTeamUsersLoading,
    isFetching: isTeamUsersFetching,
  } = useGetTeamByIdQuery(form.watch("teamId") || "", {
    skip: !form.watch("teamId"),
  });

  // Мутация для создания задачи
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();

  // Сброс выбранного исполнителя при изменении команды
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "teamId") {
        // Сбрасываем выбранного исполнителя при смене команды
        form.setValue("assigneeId", "");
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Обработчик отправки формы
  const onSubmit = async (data: TaskFormValues) => {
    try {
      const result = await createTask(data).unwrap();
      toast({
        title: "Task created",
        description: "The task has been successfully created.",
      });
      navigate(`/tasks/${result.id}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to create task",
        description: "There was an error creating the task.",
      });
    }
  };

  if (isTeamsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate("/tasks")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tasks
        </Button>
        <h1 className="text-3xl font-bold">Create New Task</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter task title" {...field} />
                    </FormControl>
                    <FormDescription>
                      A clear and concise title for the task.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter task description"
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Detailed description of what needs to be done.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        When should this task be completed by?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How important is this task?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="teamId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select team" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="test">No team</SelectItem>
                          {teamsData?.map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Which team is responsible for this task?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assigneeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assignee</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={
                          !form.watch("teamId") ||
                          isTeamUsersLoading ||
                          isTeamUsersFetching
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            {isTeamUsersLoading || isTeamUsersFetching ? (
                              <span>Loading team members...</span>
                            ) : (
                              <SelectValue
                                placeholder={
                                  !form.watch("teamId")
                                    ? "Select a team first"
                                    : "Select assignee"
                                }
                              />
                            )}
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {!form.watch("teamId") ? (
                            <SelectItem value="tmp" disabled>
                              Select a team first
                            </SelectItem>
                          ) : (
                            <>
                              <SelectItem value="tmp">Unassigned</SelectItem>
                              {teamUsersData?.members?.map((member) => (
                                <SelectItem key={member.id} value={member.id}>
                                  {member.name}
                                </SelectItem>
                              ))}
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Who is responsible for completing this task?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/tasks")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Task"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateTaskPage;

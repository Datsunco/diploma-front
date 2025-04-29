// pages/DashboardPage.tsx
import React from "react";
import { useGetTasksQuery } from "@/store/api/taskApi";
import { useGetTeamsQuery } from "@/store/api/teamApi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CheckCircle, Clock, AlertTriangle, Users } from "lucide-react";

const DashboardPage: React.FC = () => {
  const {
    data: tasksData,
    isLoading: isTasksLoading,
    error: tasksError,
  } = useGetTasksQuery();
  const {
    data: teamsData,
    isLoading: isTeamsLoading,
    error: teamsError,
  } = useGetTeamsQuery();

  const isLoading = isTasksLoading || isTeamsLoading;
  const hasError = tasksError || teamsError;

  // Подготовка данных для графика
  const taskStatusData = React.useMemo(() => {
    if (!tasksData) return [];

    const statusCounts = {
      todo: 0,
      inProgress: 0,
      completed: 0,
      overdue: 0,
    };

    tasksData.tasks.forEach((task) => {
      if (task.status === "todo") statusCounts.todo++;
      else if (task.status === "in_progress") statusCounts.inProgress++;
      else if (task.status === "completed") statusCounts.completed++;
      else if (task.status === "overdue") statusCounts.overdue++;
    });

    return [
      { name: "To Do", value: statusCounts.todo },
      { name: "In Progress", value: statusCounts.inProgress },
      { name: "Completed", value: statusCounts.completed },
      { name: "Overdue", value: statusCounts.overdue },
    ];
  }, [tasksData]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (hasError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load dashboard data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Tasks</CardDescription>
            <CardTitle className="text-3xl">{tasksData?.total || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              <span className="text-sm">All tasks</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed Tasks</CardDescription>
            <CardTitle className="text-3xl">
              {tasksData?.tasks.filter((task) => task.status === "completed")
                .length || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-green-500">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span className="text-sm">Completed</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Overdue Tasks</CardDescription>
            <CardTitle className="text-3xl">
              {tasksData?.tasks.filter((task) => task.status === "overdue")
                .length || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-red-500">
              <AlertTriangle className="h-4 w-4 mr-1" />
              <span className="text-sm">Requires attention</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Teams</CardDescription>
            <CardTitle className="text-3xl">{teamsData?.length || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-muted-foreground">
              <Users className="h-4 w-4 mr-1" />
              <span className="text-sm">Working teams</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* График */}
      <Card>
        <CardHeader>
          <CardTitle>Task Status Overview</CardTitle>
          <CardDescription>Distribution of tasks by status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Последние задачи */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
          <CardDescription>Your most recent tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasksData?.tasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between border-b pb-2"
              >
                <div>
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Due: {new Date(task.dueDate || "").toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      task.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : task.status === "overdue"
                        ? "bg-red-100 text-red-800"
                        : task.status === "in_progress"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {task.status === "in_progress"
                      ? "In Progress"
                      : task.status.charAt(0).toUpperCase() +
                        task.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGetTeamsQuery } from "@/store/api/teamApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Users } from "lucide-react";

const TeamsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetTeamsQuery();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load teams. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  useEffect(() => {
    console.log("teams data", data);
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Teams</h1>
        <Button onClick={() => navigate("/teams/create")}>
          <Plus className="h-4 w-4 mr-2" />
          New Team
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data &&
          data.map((team) => (
            <Card
              key={team.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/teams/${team.id}`)}
            >
              <CardHeader>
                <CardTitle>{team.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {team.description || "No description"}
                </p>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{team.members?.length || 0} members</span>
                </div>
              </CardContent>
            </Card>
          ))}

        {data?.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="mt-4 text-xl font-medium">No teams found</h2>
            <p className="mt-2 text-muted-foreground">
              Create a new team to get started
            </p>
            <Button className="mt-4" onClick={() => navigate("/teams/create")}>
              Create Team
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamsPage;

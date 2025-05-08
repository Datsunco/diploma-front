import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetTeamByIdQuery,
  useRemoveMemberFromTeamMutation,
} from "@/store/api/teamApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Edit, User, Users, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import AddTeamMemberDialog from "@/components/teams/AddTeamMemberDialog";

const TeamDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    data: team,
    isLoading,
    error,
    refetch,
  } = useGetTeamByIdQuery(id as string);
  const [removeMember, { isLoading: isRemoving }] =
    useRemoveMemberFromTeamMutation();

  const handleRemoveMember = async (userId: string) => {
    if (!team) return;

    try {
      await removeMember({ teamId: team.id, userId }).unwrap();
      toast({
        title: "Success",
        description: "Member removed from team successfully",
      });
      refetch(); // Обновляем данные команды
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove member from team",
      });
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !team) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load team details. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate("/teams")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Teams
        </Button>
        <h1 className="text-3xl font-bold">{team.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Team Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Description
                  </h3>
                  <p className="mt-1">
                    {team.description || "No description provided."}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Team Leader
                  </h3>
                  <p className="mt-1 flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {team.members?.find((m) => m.id === team.leaderId)?.name ||
                      "No leader assigned"}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/teams/${team.id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Team
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Team Members</CardTitle>
              <AddTeamMemberDialog teamId={team.id} onMemberAdded={refetch} />
            </CardHeader>
            <CardContent>
              {team.members && team.members.length > 0 ? (
                <div className="space-y-4">
                  {team.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                          {member.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {member.email}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={isRemoving || member.id === team.leaderId}
                        title={
                          member.id === team.leaderId
                            ? "Cannot remove team leader"
                            : "Remove member"
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Users className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="mt-2">No members in this team</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeamDetailsPage;

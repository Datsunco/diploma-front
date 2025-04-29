import React from "react";
import { useNavigate } from "react-router-dom";
import { useGetReportsQuery } from "@/store/api/reportApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, FileText, Download } from "lucide-react";
import { format } from "date-fns";
import { useLazyExportReportToCsvQuery } from "@/store/api/reportApi";

const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetReportsQuery();
  const [exportToCsv, { isLoading: isExporting }] =
    useLazyExportReportToCsvQuery();

  const handleExport = async () => {
    try {
      const blob = await exportToCsv().unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reports-${format(new Date(), "yyyy-MM-dd")}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load reports. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reports</h1>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            Export to CSV
          </Button>
          <Button onClick={() => navigate("/reports/create")}>
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.reports.map((report) => (
          <Card
            key={report.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(`/reports/${report.id}`)}
          >
            <CardHeader>
              <CardTitle>{report.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {report.description || "No description"}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {format(new Date(report.date), "MMM dd, yyyy")}
                </span>
                <FileText className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        ))}

        {data?.reports.length === 0 && (
          <div className="col-span-full text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="mt-4 text-xl font-medium">No reports found</h2>
            <p className="mt-2 text-muted-foreground">
              Create a new report to get started
            </p>
            <Button
              className="mt-4"
              onClick={() => navigate("/reports/create")}
            >
              Create Report
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;

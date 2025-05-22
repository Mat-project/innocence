import React, { useState, useEffect } from 'react';
import { 
  Printer, FileText, Download, Calendar, Filter, 
  BarChart2, PieChart, Clock, CheckCircle, RefreshCw, Loader
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../../component/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../../component/ui/card";
import { Button } from "../../component/ui/button";
import { Checkbox } from "../../component/ui/checkbox";
import { Switch } from "../../component/ui/switch";
import { Label } from "../../component/ui/label";
import { useToast } from "../../component/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../component/ui/Tabs";
import { Separator } from "../../component/ui/separator";
import { DatePickerWithRange } from "../../component/ui/date-range-picker";
import { reportsAPI } from "../../service/reportsAPI";
import { addDays, format } from "date-fns";

const ReportGeneratorPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState("summary");
  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -30),
    to: new Date()
  });
  const [format, setFormat] = useState("pdf");
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeMetrics, setIncludeMetrics] = useState(true);
  const [previewData, setPreviewData] = useState(null);
  const [sections, setSections] = useState({
    tasks: true,
    pomodoro: true,
    habits: true,
    profile: true
  });

  // Fetch preview data when report parameters change
  useEffect(() => {
    const fetchPreviewData = async () => {
      try {
        // Avoid fetching on initial render
        if (!reportType) return;

        setLoading(true);
        const data = await reportsAPI.getReportPreview({
          report_type: reportType,
          date_from: dateRange.from,
          date_to: dateRange.to,
          sections: Object.keys(sections).filter(key => sections[key])
        });
        setPreviewData(data);
      } catch (error) {
        console.error("Error fetching report preview:", error);
        toast({
          title: "Failed to load preview",
          description: "Could not generate report preview. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchPreviewData();
    }, 500); // Debounce

    return () => clearTimeout(timeoutId);
  }, [reportType, dateRange, sections, toast]);

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      
      const response = await reportsAPI.generateReport({
        report_type: reportType,
        format: format,
        date_from: dateRange.from,
        date_to: dateRange.to,
        include_charts: includeCharts,
        include_metrics: includeMetrics,
        sections: Object.keys(sections).filter(key => sections[key])
      });
      
      // Create a download link for the file
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      const fileName = `${reportType}_report_${format}.${format}`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Report generated successfully",
        description: `Your ${reportType} report has been downloaded.`,
        variant: "default"
      });
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Report generation failed",
        description: "Could not generate the requested report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-[1200px]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Report Generator</h1>
          <p className="text-muted-foreground mt-1">
            Generate comprehensive reports of your productivity and activity
          </p>
        </div>
        <Button 
          className="mt-4 md:mt-0" 
          disabled={loading}
          onClick={handleGenerateReport}
        >
          {loading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Generate Report
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Report Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Report Type */}
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select 
                value={reportType} 
                onValueChange={setReportType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary Report</SelectItem>
                  <SelectItem value="detailed">Detailed Report</SelectItem>
                  <SelectItem value="tasks">Task Report</SelectItem>
                  <SelectItem value="pomodoro">Pomodoro Report</SelectItem>
                  <SelectItem value="habits">Habits Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <DatePickerWithRange 
                dateRange={dateRange}
                onChange={setDateRange}
              />
            </div>

            {/* Format */}
            <div className="space-y-2">
              <Label>Format</Label>
              <div className="flex space-x-2">
                <Tabs 
                  defaultValue="pdf" 
                  value={format} 
                  onValueChange={setFormat}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="pdf">PDF</TabsTrigger>
                    <TabsTrigger value="excel">Excel</TabsTrigger>
                    <TabsTrigger value="csv">CSV</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            
            <Separator />

            {/* Include Sections */}
            <div className="space-y-3">
              <Label>Include Sections</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="tasks" 
                    checked={sections.tasks} 
                    onCheckedChange={(checked) => 
                      setSections({...sections, tasks: checked})
                    }
                  />
                  <Label htmlFor="tasks" className="cursor-pointer">Tasks</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="pomodoro" 
                    checked={sections.pomodoro} 
                    onCheckedChange={(checked) => 
                      setSections({...sections, pomodoro: checked})
                    }
                  />
                  <Label htmlFor="pomodoro" className="cursor-pointer">Pomodoro Sessions</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="habits" 
                    checked={sections.habits} 
                    onCheckedChange={(checked) => 
                      setSections({...sections, habits: checked})
                    }
                  />
                  <Label htmlFor="habits" className="cursor-pointer">Habit Tracking</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="profile" 
                    checked={sections.profile} 
                    onCheckedChange={(checked) => 
                      setSections({...sections, profile: checked})
                    }
                  />
                  <Label htmlFor="profile" className="cursor-pointer">Profile Activity</Label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Other Options */}
            <div className="space-y-3">
              <Label>Options</Label>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="charts" className="cursor-pointer">Include Charts</Label>
                  <p className="text-xs text-muted-foreground">
                    Add visual charts to your report
                  </p>
                </div>
                <Switch 
                  id="charts" 
                  checked={includeCharts} 
                  onCheckedChange={setIncludeCharts}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="metrics" className="cursor-pointer">Include Metrics</Label>
                  <p className="text-xs text-muted-foreground">
                    Add numerical metrics to your report
                  </p>
                </div>
                <Switch 
                  id="metrics" 
                  checked={includeMetrics} 
                  onCheckedChange={setIncludeMetrics}
                />
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Report Preview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <BarChart2 className="mr-2 h-5 w-5" />
              Report Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="min-h-[60vh]">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <RefreshCw className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Generating preview...</p>
                </div>
              </div>
            ) : previewData ? (
              <div className="space-y-6">
                {/* Preview Header */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-center">
                    {reportType === "summary" && "Summary Report"}
                    {reportType === "detailed" && "Detailed Activity Report"}
                    {reportType === "tasks" && "Task Completion Report"}
                    {reportType === "pomodoro" && "Focus Time Report"}
                    {reportType === "habits" && "Habit Tracker Report"}
                  </h2>
                  <p className="text-center text-muted-foreground">
                    {dateRange.from && dateRange.to ? (
                      <>
                        {format(dateRange.from, 'PPP')} - {format(dateRange.to, 'PPP')}
                      </>
                    ) : (
                      "All time"
                    )}
                  </p>
                </div>

                {/* Summary Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {previewData?.metrics?.map((metric, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center">
                          <div className="p-2 bg-muted rounded-full mb-4">
                            {metric.icon === 'tasks' && <CheckCircle className="h-6 w-6 text-primary" />}
                            {metric.icon === 'time' && <Clock className="h-6 w-6 text-primary" />}
                            {metric.icon === 'calendar' && <Calendar className="h-6 w-6 text-primary" />}
                          </div>
                          <h3 className="text-3xl font-bold">{metric.value}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{metric.label}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Content Preview */}
                <div className="space-y-6">
                  {sections.tasks && previewData?.tasks?.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2 text-primary" />
                        Tasks
                      </h3>
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="py-2 text-left">Title</th>
                            <th className="py-2 text-left">Status</th>
                            <th className="py-2 text-left">Due Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.tasks.slice(0, 5).map((task, i) => (
                            <tr key={i} className="border-b">
                              <td className="py-2">{task.title}</td>
                              <td className="py-2 capitalize">{task.status}</td>
                              <td className="py-2">{task.due_date}</td>
                            </tr>
                          ))}
                          {previewData.tasks.length > 5 && (
                            <tr>
                              <td colSpan={3} className="py-2 text-center text-muted-foreground">
                                +{previewData.tasks.length - 5} more tasks
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {sections.pomodoro && previewData?.pomodoro?.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-primary" />
                        Pomodoro Sessions
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Focus Time (hours)</p>
                          <div className="h-40 bg-muted/30 rounded-md flex items-center justify-center text-muted-foreground">
                            [Chart Preview]
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Session Distribution</p>
                          <div className="h-40 bg-muted/30 rounded-md flex items-center justify-center text-muted-foreground">
                            [Chart Preview]
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {sections.habits && previewData?.habits?.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-primary" />
                        Habit Tracking
                      </h3>
                      <div className="bg-muted/30 p-4 rounded-md">
                        <p className="text-center text-muted-foreground mb-2">Habit Completion Heatmap</p>
                        <div className="h-32 flex items-center justify-center text-muted-foreground">
                          [Habit Tracker Visualization]
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Report Footer */}
                <div className="border-t pt-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Generated with InnoSence - {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Report Preview</h3>
                  <p className="text-muted-foreground mt-1 max-w-md">
                    Select your report parameters to see a preview. The generated 
                    report will include more detailed information.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportGeneratorPage;

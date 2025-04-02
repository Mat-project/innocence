import { Calendar, Clock, CheckCircle, Briefcase, Flame } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card"
import { Separator } from "@components/ui/separator"

export default function ProfileActivity({
  taskCompletionRate,
  totalTasks,
  projectsCount,
  pomodoroTime,
  habitStreak,
  activities,
}) {
  const metrics = [
    {
      label: "Task Completion",
      value: `${taskCompletionRate}%`,
      icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
      description: "Completed tasks rate",
    },
    {
      label: "Total Tasks",
      value: totalTasks,
      icon: <CheckCircle className="h-5 w-5 text-blue-500" />,
      description: "Tasks created",
    },
    {
      label: "Projects",
      value: projectsCount,
      icon: <Briefcase className="h-5 w-5 text-indigo-500" />,
      description: "Active projects",
    },
    {
      label: "Focus Time",
      value: `${pomodoroTime}h`,
      icon: <Clock className="h-5 w-5 text-red-500" />,
      description: "Pomodoro sessions",
    },
    {
      label: "Streak",
      value: habitStreak,
      icon: <Flame className="h-5 w-5 text-amber-500" />,
      description: "Day streak",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Productivity Insights</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50">
              <div className="mb-2">{metric.icon}</div>
              <span className="text-2xl font-bold">{metric.value}</span>
              <span className="text-xs text-muted-foreground mt-1">{metric.label}</span>
            </div>
          ))}
        </div>

        <Separator />

        {/* Recent Activity */}
        {activities && activities.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <h3 className="text-sm font-medium">Recent Activity</h3>
            </div>

            <div className="space-y-2">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm">{activity.description}</span>
                  <span className="text-xs text-muted-foreground">{activity.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


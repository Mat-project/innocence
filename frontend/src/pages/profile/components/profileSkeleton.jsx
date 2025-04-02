import { Skeleton } from "@components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@components/ui/card"

export default function ProfileSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="relative bg-background rounded-b-xl shadow-sm overflow-hidden">
        <Skeleton className="h-48 md:h-64 w-full" />

        <div className="relative px-4 sm:px-6 pb-6 -mt-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-4">
              <Skeleton className="h-32 w-32 rounded-full" />

              <div className="text-center sm:text-left pt-2 sm:pt-0 sm:pb-1 space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>

            <div className="flex mt-4 sm:mt-0 space-x-2 justify-center sm:justify-end">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>

          <div className="mt-6 bg-card rounded-lg p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-8" />
            </div>
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container px-4 py-8 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center text-center p-3">
                      <Skeleton className="h-5 w-5 rounded-full mb-2" />
                      <Skeleton className="h-8 w-12" />
                      <Skeleton className="h-3 w-16 mt-1" />
                    </div>
                  ))}
                </div>

                <Skeleton className="h-px w-full" />

                <div className="space-y-3">
                  <Skeleton className="h-5 w-32" />
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center p-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-6">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="overflow-hidden rounded-lg border shadow-sm">
                      <Skeleton className="h-48 w-full" />
                      <div className="p-4 space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}


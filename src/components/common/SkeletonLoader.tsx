import { Skeleton } from "@/components/ui/skeleton";

export const SkeletonLoader = () => {
  return (
    <div className="w-full h-full min-h-screen flex flex-col items-center justify-center space-y-4 p-8 bg-background">
      <div className="flex flex-col space-y-3 w-full max-w-3xl">
        <Skeleton className="h-[125px] w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[80%]" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl pt-8">
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-[100px] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[20%]" />
          </div>
        </div>
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-[100px] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[20%]" />
          </div>
        </div>
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-[100px] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[20%]" />
          </div>
        </div>
      </div>
    </div>
  );
};

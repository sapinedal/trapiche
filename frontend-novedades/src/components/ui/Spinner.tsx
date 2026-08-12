import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("size-5 animate-spin text-primary-500", className)} />;
}

export function PageLoader() {
  return (
    <div className="flex h-full min-h-[240px] w-full items-center justify-center">
      <Spinner className="size-8" />
    </div>
  );
}

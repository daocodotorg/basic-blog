import { FileText } from "lucide-react";

export function AdminEmpty() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <FileText className="text-muted-foreground h-12 w-12" />
      <div>
        <p className="text-lg font-medium">Select a post</p>
        <p className="text-muted-foreground mt-1 max-w-sm text-sm">
          Choose an article from the list or create a new draft.
        </p>
      </div>
    </div>
  );
}

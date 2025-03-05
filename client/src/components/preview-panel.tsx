import { Card } from "@/components/ui/card";

interface PreviewPanelProps {
  code: string;
  isFullscreen?: boolean;
}

export function PreviewPanel({ code, isFullscreen }: PreviewPanelProps) {
  return (
    <Card className={`overflow-hidden ${isFullscreen ? 'h-[calc(100vh-12rem)]' : ''}`}>
      <div className="bg-muted border-b px-4 py-2 flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="text-xs text-muted-foreground">Preview</div>
      </div>
      <iframe
        srcDoc={code}
        className={`w-full ${isFullscreen ? 'h-full' : 'h-[500px]'} border-0`}
        title="Preview"
        sandbox="allow-scripts"
      />
    </Card>
  );
}
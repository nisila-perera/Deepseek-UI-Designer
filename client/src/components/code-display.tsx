import { useEffect, useRef, useState } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CodeDisplayProps {
  code: string;
  reasoning?: string;
}

export function CodeDisplay({ code, reasoning }: CodeDisplayProps) {
  const { toast } = useToast();
  const preRef = useRef<HTMLPreElement>(null);
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    if (preRef.current) {
      Prism.highlightElement(preRef.current);
    }
  }, [code]);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard"
    });
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "design.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="relative space-y-4">
      {reasoning && (
        <div className="p-4 border-b">
          <h3 className="font-medium mb-2">Design Reasoning:</h3>
          <p className="text-sm whitespace-pre-wrap">{reasoning}</p>
        </div>
      )}

      <div className="flex items-center justify-between px-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowCode(!showCode)}
          className="flex items-center gap-2"
        >
          {showCode ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {showCode ? "Hide Code" : "Show Code"}
        </Button>

        <div className="space-x-2">
          <Button size="sm" variant="outline" onClick={copyCode}>
            <Copy className="h-4 w-4 mr-1" />
            Copy
          </Button>
          <Button size="sm" onClick={downloadCode}>
            Download
          </Button>
        </div>
      </div>

      {showCode && (
        <pre ref={preRef} className="p-4 overflow-x-auto">
          <code className="language-html">{code}</code>
        </pre>
      )}
    </Card>
  );
}
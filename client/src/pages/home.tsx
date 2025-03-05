import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Maximize2, Minimize2, BookOpen, Heart, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { styleSchema, type StylePreferences } from "@shared/schema";
import { generateDesign } from "@/lib/ai";
import { ConfigModal } from "@/components/config-modal";
import { PreviewPanel } from "@/components/preview-panel";
import { CodeDisplay } from "@/components/code-display";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [showConfig, setShowConfig] = useState(!localStorage.getItem("config"));
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [reasoning, setReasoning] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [showReasoning, setShowReasoning] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const reasoningRef = useRef<HTMLDivElement>(null);
  const [styles, setStyles] = useState<StylePreferences>(styleSchema.parse({
    modern: true,
    minimal: true,
    darkMode: false,
    borderRadius: 'medium',
    colorScheme: 'default',
    spacing: 'comfortable',
    typography: 'modern',
    animations: 'smooth',
    iconStyle: 'outline',
    buttonStyle: 'rounded',
    layout: 'centered'
  }));

  const { toast } = useToast();

  useEffect(() => {
    if (reasoningRef.current) {
      reasoningRef.current.scrollTop = reasoningRef.current.scrollHeight;
    }
  }, [reasoning]);

  const designMutation = useMutation({
    mutationFn: async () => {
      setReasoning("");
      setGeneratedCode(null);
      setError(null);

      await generateDesign(prompt, negativePrompt, styles, {
        onReasoning: (content) => setReasoning(prev => prev + content),
        onCode: (code) => {
          setGeneratedCode(code);
          setIsGenerating(true); // Keep generating state true after receiving code
        },
        onError: (error) => {
          setError(error);
          setIsGenerating(false); // Reset generating state on error
          toast({
            title: "Error",
            description: error,
            variant: "destructive"
          });
        }
      });
    }
  });

  const previewContainerClass = isFullscreen 
    ? "fixed inset-0 z-50 bg-background p-6" 
    : "space-y-6";

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <ConfigModal open={showConfig} onClose={() => setShowConfig(false)} />

      <div className={`max-w-7xl mx-auto transition-all duration-500 ease-in-out ${isGenerating ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'flex justify-center'}`}>
        <Card className={`p-6 ${isGenerating ? 'w-full' : 'w-[600px]'} transition-all duration-500`}>
          {/* Header section inside the card */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Deepseek UI Designer</h1>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                Made with <Heart className="h-4 w-4 text-red-500 fill-current" /> by Nisila
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowConfig(true)}
              className="hover:bg-muted"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="prompt">Design Prompt</Label>
              <Input
                id="prompt"
                placeholder="Describe your desired UI design..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="negativePrompt">Negative Prompt (Optional)</Label>
              <Input
                id="negativePrompt"
                placeholder="Describe what you don't want in the design..."
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Style Preferences</Label>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(styles)
                  .filter(([key]) => typeof styles[key as keyof StylePreferences] === 'boolean')
                  .map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={value as boolean}
                        onCheckedChange={(checked) => 
                          setStyles(prev => ({ ...prev, [key]: checked }))
                        }
                      />
                      <Label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
                    </div>
                  ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label>Design Customization</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="borderRadius">Border Radius</Label>
                  <Select
                    value={styles.borderRadius}
                    onValueChange={(value) => 
                      setStyles(prev => ({ ...prev, borderRadius: value as StylePreferences['borderRadius'] }))
                    }
                  >
                    <SelectTrigger id="borderRadius">
                      <SelectValue placeholder="Select border radius" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="colorScheme">Color Scheme</Label>
                  <Select
                    value={styles.colorScheme}
                    onValueChange={(value) => {
                      const colorScheme = value as StylePreferences['colorScheme'];
                      setStyles(prev => ({ ...prev, colorScheme }));
                    }}
                  >
                    <SelectTrigger id="colorScheme">
                      <SelectValue placeholder="Select color scheme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="black">Black</SelectItem>
                      <SelectItem value="white">White</SelectItem>
                      <SelectItem value="custom">Custom Colors</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {styles.colorScheme === 'custom' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <Input
                        id="primaryColor"
                        type="color"
                        value={styles.primaryColor || "#000000"}
                        onChange={(e) => 
                          setStyles(prev => ({ ...prev, primaryColor: e.target.value }))
                        }
                        className="h-10 p-1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor">Secondary Color</Label>
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={styles.secondaryColor || "#ffffff"}
                        onChange={(e) => 
                          setStyles(prev => ({ ...prev, secondaryColor: e.target.value }))
                        }
                        className="h-10 p-1"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="spacing">Spacing</Label>
                  <Select
                    value={styles.spacing}
                    onValueChange={(value) => 
                      setStyles(prev => ({ ...prev, spacing: value as StylePreferences['spacing'] }))
                    }
                  >
                    <SelectTrigger id="spacing">
                      <SelectValue placeholder="Select spacing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="comfortable">Comfortable</SelectItem>
                      <SelectItem value="spacious">Spacious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="typography">Typography</Label>
                  <Select
                    value={styles.typography}
                    onValueChange={(value) => 
                      setStyles(prev => ({ ...prev, typography: value as StylePreferences['typography'] }))
                    }
                  >
                    <SelectTrigger id="typography">
                      <SelectValue placeholder="Select typography" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="classic">Classic</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buttonStyle">Button Style</Label>
                  <Select
                    value={styles.buttonStyle}
                    onValueChange={(value) => 
                      setStyles(prev => ({ ...prev, buttonStyle: value as StylePreferences['buttonStyle'] }))
                    }
                  >
                    <SelectTrigger id="buttonStyle">
                      <SelectValue placeholder="Select button style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rounded">Rounded</SelectItem>
                      <SelectItem value="pill">Pill</SelectItem>
                      <SelectItem value="square">Square</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button 
              onClick={() => {
                setIsGenerating(true);
                designMutation.mutate();
              }}
              disabled={!prompt || designMutation.isPending}
              className="w-full"
            >
              {designMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Generate Design
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReasoning(!showReasoning)}
                className="flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                {showReasoning ? "Hide Thoughts" : "Read My Thoughts"}
              </Button>
            </div>

            {showReasoning && reasoning && (
              <div
                ref={reasoningRef}
                className="relative mt-4 w-full h-[200px] overflow-y-auto rounded-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80 pointer-events-none" />
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {reasoning}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {isGenerating && (
          <div className={previewContainerClass}>
            {designMutation.isPending && !generatedCode ? (
              <div className="flex items-center justify-center h-[500px]">
                <div className="text-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="text-lg font-medium">Cooking up your design...</p>
                </div>
              </div>
            ) : generatedCode && (
              <>
                <div className="flex justify-end mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="flex items-center gap-2"
                  >
                    {isFullscreen ? (
                      <>
                        <Minimize2 className="h-4 w-4" />
                        Exit Fullscreen
                      </>
                    ) : (
                      <>
                        <Maximize2 className="h-4 w-4" />
                        View Fullscreen
                      </>
                    )}
                  </Button>
                </div>
                <PreviewPanel code={generatedCode} isFullscreen={isFullscreen} />
                <CodeDisplay code={generatedCode} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
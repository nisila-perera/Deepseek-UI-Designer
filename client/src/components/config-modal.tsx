import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const configSchema = z.object({
  deepseekApiKey: z.string().min(1, "DeepSeek API key is required")
});

type Config = z.infer<typeof configSchema>;

interface ConfigModalProps {
  open: boolean;
  onClose: () => void;
}

export function ConfigModal({ open, onClose }: ConfigModalProps) {
  const { toast } = useToast();
  const form = useForm<Config>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      deepseekApiKey: localStorage.getItem("deepseekApiKey") || ""
    }
  });

  const onSubmit = (data: Config) => {
    localStorage.setItem("deepseekApiKey", data.deepseekApiKey);
    localStorage.setItem("config", "true");
    toast({
      title: "Configuration saved",
      description: "Your API key has been saved successfully."
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure API Key</DialogTitle>
          <DialogDescription>
            Enter your DeepSeek API key to use the AI UI Designer. This key will be stored locally in your browser.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="deepseekApiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DeepSeek API Key</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Save Configuration
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
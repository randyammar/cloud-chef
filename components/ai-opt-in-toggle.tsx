"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function AiOptInToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isPending, startTransition] = useTransition();

  function update(value: boolean) {
    setEnabled(value);
    startTransition(async () => {
      const response = await fetch("/api/profile/ai-opt-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: value })
      });
      const data = await response.json();
      if (!response.ok) {
        setEnabled(!value);
        toast.error(data.error ?? "Could not update preference.");
        return;
      }
      toast.success(value ? "AI enabled." : "AI disabled.");
    });
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border bg-card p-4">
      <div className="space-y-1">
        <Label htmlFor="ai-opt-in">Enable AI features</Label>
        <p className="text-sm text-muted-foreground">
          When enabled, CloudChef can use your recipe data for AI actions you trigger.
        </p>
      </div>
      <Switch id="ai-opt-in" checked={enabled} disabled={isPending} onCheckedChange={update} />
    </div>
  );
}

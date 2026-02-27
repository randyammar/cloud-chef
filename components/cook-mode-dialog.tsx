"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function CookModeDialog({ instructions }: { instructions: string }) {
  const steps = useMemo(() => {
    const cleaned = instructions.trim();
    if (!cleaned) return [];

    const lines = cleaned
      .split(/\r?\n+/)
      .map((line) => line.trim())
      .filter(Boolean);

    const stepCandidates =
      lines.length === 1
        ? cleaned
            .split(/(?=\d+\s*[\).\-\:]\s+)/)
            .map((item) => item.trim())
            .filter(Boolean)
        : lines;

    return stepCandidates
      .map((step) =>
        step
          .replace(/^\d+\s*[\).\-\:]\s*/, "")
          .replace(/^[-*]\s*/, "")
          .trim()
      )
      .filter(Boolean);
  }, [instructions]);
  const [index, setIndex] = useState(0);

  if (steps.length === 0) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <ChefHat className="mr-2 h-4 w-4" />
          Cook Mode
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Cook Mode</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Step {index + 1} of {steps.length}
          </p>
          <div className="rounded-lg border bg-secondary/40 p-5 text-lg">{steps[index]}</div>
          <div className="flex justify-between">
            <Button variant="outline" disabled={index === 0} onClick={() => setIndex((prev) => Math.max(prev - 1, 0))}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button disabled={index >= steps.length - 1} onClick={() => setIndex((prev) => Math.min(prev + 1, steps.length - 1))}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

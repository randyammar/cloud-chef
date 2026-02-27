"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { RecipeRecord } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RecipeAiPanelProps {
  recipe: RecipeRecord;
  aiEnabled: boolean;
}

export function RecipeAiPanel({ recipe, aiEnabled }: RecipeAiPanelProps) {
  const [summary, setSummary] = useState("");
  const [substitutions, setSubstitutions] = useState("");
  const [isPending, startTransition] = useTransition();

  function runSummary() {
    startTransition(async () => {
      const response = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructions: recipe.instructions })
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error ?? "Could not summarize instructions.");
        return;
      }
      setSummary(data.data.summary);
      toast.success("Summary generated.");
    });
  }

  function runSubstitutions() {
    startTransition(async () => {
      const response = await fetch("/api/ai/substitutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients: recipe.ingredients.map((ingredient) => ingredient.name)
        })
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error ?? "Could not generate substitutions.");
        return;
      }
      setSubstitutions(data.data.suggestions);
      toast.success("Substitution ideas generated.");
    });
  }

  if (!aiEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            AI features are currently off for your account. Enable them in Settings.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3">
        <Sparkles className="h-5 w-5 text-primary" />
        <CardTitle>AI Assistant</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary">
          <TabsList>
            <TabsTrigger value="summary">Summarize</TabsTrigger>
            <TabsTrigger value="subs">Substitutions</TabsTrigger>
          </TabsList>
          <TabsContent value="summary" className="space-y-3">
            <Button onClick={runSummary} disabled={isPending}>
              Summarize instructions
            </Button>
            <Textarea
              readOnly
              value={summary}
              placeholder="AI summary will appear here."
              className="min-h-32"
            />
          </TabsContent>
          <TabsContent value="subs" className="space-y-3">
            <Button onClick={runSubstitutions} disabled={isPending}>
              Suggest substitutions
            </Button>
            <Textarea
              readOnly
              value={substitutions}
              placeholder="Ingredient swaps and notes will appear here."
              className="min-h-32"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

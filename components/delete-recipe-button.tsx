"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function DeleteRecipeButton({ recipeId }: { recipeId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onDelete() {
    if (!window.confirm("Delete this recipe? This action cannot be undone.")) return;
    startTransition(async () => {
      const response = await fetch(`/api/recipes/${recipeId}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error ?? "Could not delete recipe.");
        return;
      }
      toast.success("Recipe deleted.");
      router.push("/app/recipes");
      router.refresh();
    });
  }

  return (
    <Button onClick={onDelete} variant="destructive" disabled={isPending}>
      <Trash2 className="mr-2 h-4 w-4" />
      Delete
    </Button>
  );
}

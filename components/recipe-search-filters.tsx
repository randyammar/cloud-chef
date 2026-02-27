"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { dietTagOptions, recipeDifficultyOptions } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function RecipeSearchFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const currentPath = pathname ?? "/app/recipes";

  const [q, setQ] = useState(params?.get("q") ?? "");
  const [ingredient, setIngredient] = useState(params?.get("ingredient") ?? "");
  const [cuisine, setCuisine] = useState(params?.get("cuisine") ?? "");
  const [maxPrep, setMaxPrep] = useState(params?.get("maxPrep") ?? "");
  const [difficulty, setDifficulty] = useState(params?.get("difficulty") ?? "");
  const [diet, setDiet] = useState(params?.get("diet") ?? "");

  const canReset = useMemo(
    () => Boolean(q || ingredient || cuisine || maxPrep || difficulty || diet),
    [q, ingredient, cuisine, maxPrep, difficulty, diet]
  );

  function applyFilters() {
    startTransition(() => {
      const search = new URLSearchParams();
      if (q.trim()) search.set("q", q.trim());
      if (ingredient.trim()) search.set("ingredient", ingredient.trim());
      if (cuisine.trim()) search.set("cuisine", cuisine.trim());
      if (maxPrep.trim()) search.set("maxPrep", maxPrep.trim());
      if (difficulty) search.set("difficulty", difficulty);
      if (diet) search.set("diet", diet);
      router.push(`${currentPath}?${search.toString()}`);
    });
  }

  function resetFilters() {
    startTransition(() => {
      setQ("");
      setIngredient("");
      setCuisine("");
      setMaxPrep("");
      setDifficulty("");
      setDiet("");
      router.push(currentPath);
    });
  }

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Input placeholder="Search by name or instructions" value={q} onChange={(event) => setQ(event.target.value)} />
        <Input placeholder="Ingredient" value={ingredient} onChange={(event) => setIngredient(event.target.value)} />
        <Input placeholder="Cuisine" value={cuisine} onChange={(event) => setCuisine(event.target.value)} />
        <Input
          type="number"
          min={0}
          placeholder="Max prep minutes"
          value={maxPrep}
          onChange={(event) => setMaxPrep(event.target.value)}
        />
        <Select value={difficulty || "all"} onValueChange={(value) => setDifficulty(value === "all" ? "" : value)}>
          <SelectTrigger>
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All difficulties</SelectItem>
            {recipeDifficultyOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={diet || "all"} onValueChange={(value) => setDiet(value === "all" ? "" : value)}>
          <SelectTrigger>
            <SelectValue placeholder="Dietary tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All diet tags</SelectItem>
            {dietTagOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={applyFilters} disabled={isPending}>
          <Search className="mr-2 h-4 w-4" />
          Apply filters
        </Button>
        <Button variant="outline" onClick={resetFilters} disabled={!canReset || isPending}>
          Reset
        </Button>
      </div>
    </div>
  );
}

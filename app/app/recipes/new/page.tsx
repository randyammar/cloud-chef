import { RecipeForm } from "@/components/recipe-form";

export default function NewRecipePage() {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold">New Recipe</h1>
        <p className="text-sm text-muted-foreground">
          Start with a recipe name, or have AI generate the first version instantly.
        </p>
      </div>
      <RecipeForm mode="create" />
    </section>
  );
}

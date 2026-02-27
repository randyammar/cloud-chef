import { requireUser } from "@/lib/auth";
import { getProfileAiOptIn, listRecipes } from "@/lib/data/recipes";
import { isDbNotReadyError } from "@/lib/errors";
import type { RecipeRecord } from "@/lib/types";
import { AiOptInToggle } from "@/components/ai-opt-in-toggle";
import { DatabaseSetupAlert } from "@/components/database-setup-alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SettingsPage() {
  const user = await requireUser();
  let aiEnabled = false;
  let typedRecipes: RecipeRecord[] = [];
  let setupError: string | null = null;

  try {
    const [profileAiEnabled, recipes] = await Promise.all([
      getProfileAiOptIn(user.id),
      listRecipes(user.id)
    ]);
    aiEnabled = profileAiEnabled;
    typedRecipes = recipes as RecipeRecord[];
  } catch (error) {
    if (isDbNotReadyError(error)) {
      setupError = error instanceof Error ? error.message : String(error);
    } else {
      throw error;
    }
  }

  const avgPrep =
    typedRecipes.length > 0
      ? Math.round(
          typedRecipes.reduce((sum, recipe) => sum + (recipe.prep_time_minutes ?? 0), 0) / typedRecipes.length
        )
      : 0;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure privacy preferences and review personal usage stats.
        </p>
      </div>
      {setupError ? <DatabaseSetupAlert message={setupError} /> : null}
      {!setupError ? <AiOptInToggle initialEnabled={aiEnabled} /> : null}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total recipes</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{typedRecipes.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">To try</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {typedRecipes.filter((recipe) => recipe.status === "to_try").length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Average prep</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{avgPrep} min</CardContent>
        </Card>
      </div>
    </section>
  );
}

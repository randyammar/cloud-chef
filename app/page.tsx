import Link from "next/link";
import { ChefHat, Search, Share2, Sparkles } from "lucide-react";
import { HomeHeroCarousel } from "@/components/home-hero-carousel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Manage Recipes",
    description: "Create, edit, and organize recipes with ingredients, instructions, and metadata.",
    icon: ChefHat
  },
  {
    title: "Smart Search",
    description: "Find recipes by name, ingredient, cuisine, status, prep time, and dietary tags.",
    icon: Search
  },
  {
    title: "Share in One Click",
    description: "Generate unlisted read-only links for fast sharing with friends and family.",
    icon: Share2
  },
  {
    title: "AI Kitchen Assistant",
    description: "Generate recipe drafts, summarize steps, and suggest ingredient substitutions.",
    icon: Sparkles
  }
];

export default function HomePage() {
  return (
    <main className="home-kitchen container pt-4 pb-8 sm:pt-6 sm:pb-12 lg:pt-8 lg:pb-16">
      <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-secondary/40 via-background to-accent/30 p-5 shadow-lg sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-accent/30 blur-3xl" />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-6">
            <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Your Smart Recipe Workspace. Powered by AI.
            </h1>
            <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
              CloudChef helps you manage, discover, and share recipes effortlessly. Search instantly, collaborate with others, and generate creative dishes from the ingredients you already have.
            </p>
            <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              <div className="rounded-lg border bg-background/70 px-3 py-2">Organize recipes with smart tags</div>
              <div className="rounded-lg border bg-background/70 px-3 py-2">Find dishes by ingredient in seconds</div>
              <div className="rounded-lg border bg-background/70 px-3 py-2">Share clean links with family and teams</div>
              <div className="rounded-lg border bg-background/70 px-3 py-2">Generate complete drafts with AI Recipe</div>
            </div>
          </div>
          <HomeHeroCarousel />
        </div>
      </section>

      <section className="mt-12 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Everything you need to cook better</h2>
            <p className="text-sm text-muted-foreground sm:text-base">Designed to keep recipe planning and execution fast, visual, and collaborative.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
        {features.map((feature) => (
          <Card key={feature.title} className="group bg-card/80 transition duration-200 hover:-translate-y-1 hover:shadow-lg">
            <CardHeader className="space-y-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/12 text-primary">
                <feature.icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl leading-tight">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground sm:text-base">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
        </div>
      </section>

      <section className="mt-10">
        <Card className="border-primary/20 bg-gradient-to-r from-primary/10 via-background to-secondary/30">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold">Ready to build your next favorite recipe?</h3>
              <p className="text-sm text-muted-foreground">Create an account and let CloudChef handle organization, search, sharing, and AI-assisted ideation.</p>
            </div>
            <Button asChild size="lg">
              <Link href="/login">Get Started</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

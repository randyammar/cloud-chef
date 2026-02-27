"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const slides = [
  {
    src: "/hero/recipe-fresh-salad.svg",
    title: "Fresh Ingredients, Bright Flavors",
    description: "Colorful produce and crisp textures for everyday healthy meals."
  },
  {
    src: "/hero/recipe-pasta-pan.svg",
    title: "Comfort Cooking at Home",
    description: "Warm, rich, and satisfying recipes made simple."
  },
  {
    src: "/hero/recipe-grill-veggies.svg",
    title: "Sizzle, Roast, and Serve",
    description: "From stovetop to oven, keep your cooking flow organized."
  },
  {
    src: "/hero/recipe-breakfast-board.svg",
    title: "Plan Better Meals",
    description: "Save favorites, try new dishes, and build your weekly menu."
  }
];

export function HomeHeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  function goNext() {
    setIndex((prev) => (prev + 1) % slides.length);
  }

  function goPrev() {
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-xl">
      <div className="relative h-[320px] sm:h-[380px] lg:h-[420px]">
        {slides.map((slide, slideIndex) => (
          <div
            key={slide.src}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              slideIndex === index ? "opacity-100" : "pointer-events-none opacity-0"
            )}
          >
            <Image
              src={slide.src}
              alt={slide.title}
              fill
              priority={slideIndex === 0}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-6">
              <p className="text-lg font-semibold sm:text-xl">{slide.title}</p>
              <p className="mt-1 text-sm text-white/90">{slide.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute left-3 top-1/2 flex -translate-y-1/2">
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="h-8 w-8 rounded-full bg-white/90 text-foreground hover:bg-white"
          onClick={goPrev}
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      <div className="absolute right-3 top-1/2 flex -translate-y-1/2">
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="h-8 w-8 rounded-full bg-white/90 text-foreground hover:bg-white"
          onClick={goNext}
          aria-label="Next slide"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="absolute bottom-3 right-3 flex gap-1.5">
        {slides.map((slide, slideIndex) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => setIndex(slideIndex)}
            className={cn(
              "h-2.5 w-2.5 rounded-full border border-white/70 transition",
              slideIndex === index ? "bg-white" : "bg-white/30"
            )}
            aria-label={`Go to slide ${slideIndex + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useTransition } from "react";
import { Copy, Link as LinkIcon, Link2Off } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ShareLinkControls({ recipeId }: { recipeId: string }) {
  const [isPending, startTransition] = useTransition();
  const [isLoadingLink, setIsLoadingLink] = useState(true);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadShareLink() {
      setIsLoadingLink(true);
      try {
        const response = await fetch(`/api/recipes/${recipeId}/share-link`, {
          method: "GET"
        });
        const data = await response.json();
        if (!response.ok) {
          if (mounted) toast.error(data.error ?? "Could not load existing link.");
          return;
        }
        if (mounted) {
          setShareUrl(data.shareUrl ?? "");
        }
      } finally {
        if (mounted) setIsLoadingLink(false);
      }
    }

    void loadShareLink();
    return () => {
      mounted = false;
    };
  }, [recipeId]);

  function createShareLink() {
    startTransition(async () => {
      const response = await fetch(`/api/recipes/${recipeId}/share-link`, {
        method: "POST"
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error ?? "Could not generate link.");
        return;
      }
      setShareUrl(data.shareUrl);
      toast.success("Share link ready.");
    });
  }

  function revokeLink() {
    startTransition(async () => {
      const response = await fetch(`/api/recipes/${recipeId}/revoke-share-link`, {
        method: "POST"
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error ?? "Could not revoke link.");
        return;
      }
      setShareUrl("");
      toast.success("Share link revoked.");
    });
  }

  async function copyLink() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied.");
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>Share</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">Generate an unlisted, read-only link for this recipe.</p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={createShareLink} disabled={isPending || isLoadingLink}>
            <LinkIcon className="mr-2 h-4 w-4" />
            Create Link
          </Button>
          <Button variant="outline" onClick={revokeLink} disabled={isPending || isLoadingLink}>
            <Link2Off className="mr-2 h-4 w-4" />
            Revoke
          </Button>
        </div>
        <div className="flex gap-2">
          <Input value={shareUrl} readOnly placeholder={isLoadingLink ? "Loading link..." : "No link generated yet."} />
          <Button variant="outline" onClick={copyLink} disabled={!shareUrl || isLoadingLink}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { requireApiUser } from "@/lib/api-auth";
import { createShareLink, getActiveShareLink } from "@/lib/data/recipes";
import { isDbNotReadyError } from "@/lib/errors";

interface Context {
  params: Promise<{ id: string }>;
}

async function buildShareUrl(token: string) {
  const headerList = await headers();
  const host = headerList.get("host");
  const forwardedProto = headerList.get("x-forwarded-proto");
  const protocol = forwardedProto ?? (process.env.NODE_ENV === "production" ? "https" : "http");
  return `${protocol}://${host}/shared/${token}`;
}

export async function GET(_: Request, context: Context) {
  const { user, response } = await requireApiUser();
  if (!user) return response;

  const { id } = await context.params;
  try {
    const share = await getActiveShareLink(user.id, id);
    if (!share) {
      return NextResponse.json({ share: null, shareUrl: null });
    }
    const shareUrl = await buildShareUrl(share.token);
    return NextResponse.json({ share, shareUrl });
  } catch (error) {
    const status = isDbNotReadyError(error) ? 503 : 500;
    return NextResponse.json({ error: "Failed to fetch share link.", details: String(error) }, { status });
  }
}

export async function POST(_: Request, context: Context) {
  const { user, response } = await requireApiUser();
  if (!user) return response;

  const { id } = await context.params;
  try {
    const share = await createShareLink(user.id, id);
    const shareUrl = await buildShareUrl(share.token);
    return NextResponse.json({ share, shareUrl });
  } catch (error) {
    const status = isDbNotReadyError(error) ? 503 : 500;
    return NextResponse.json({ error: "Failed to generate share link.", details: String(error) }, { status });
  }
}

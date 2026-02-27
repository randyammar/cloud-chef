import { NextResponse } from "next/server";
import { getProfileAiOptIn } from "@/lib/data/recipes";
import { requireApiUser } from "@/lib/api-auth";
import { isDbNotReadyError } from "@/lib/errors";

export async function requireAiEnabled() {
  const { user, response } = await requireApiUser();
  if (!user) {
    return { user: null, response };
  }
  let enabled = false;
  try {
    enabled = await getProfileAiOptIn(user.id);
  } catch (error) {
    const status = isDbNotReadyError(error) ? 503 : 500;
    return {
      user: null,
      response: NextResponse.json({ error: String(error) }, { status })
    };
  }
  if (!enabled) {
    return {
      user: null,
      response: NextResponse.json(
        { error: "AI features are disabled. Enable AI in settings first." },
        { status: 403 }
      )
    };
  }
  return { user, response: null };
}

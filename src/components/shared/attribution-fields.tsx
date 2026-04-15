"use client";

import { useEffect, useState } from "react";
import { getSessionContext, type SessionContext } from "@/lib/session-tracking";

/**
 * Hidden form fields that attach lead attribution metadata to any form submission.
 * Drop into any <form> and the server action will read them via extractAttribution().
 */
export function AttributionFields() {
  const [ctx, setCtx] = useState<SessionContext | null>(null);

  useEffect(() => {
    setCtx(getSessionContext());
  }, []);

  if (!ctx) return null;

  return (
    <>
      <input type="hidden" name="_session_id" value={ctx.session_id} />
      <input type="hidden" name="_source_page" value={ctx.source_page} />
      <input type="hidden" name="_utm_source" value={ctx.utm_source ?? ""} />
      <input type="hidden" name="_utm_medium" value={ctx.utm_medium ?? ""} />
      <input type="hidden" name="_utm_campaign" value={ctx.utm_campaign ?? ""} />
      <input type="hidden" name="_utm_content" value={ctx.utm_content ?? ""} />
      <input type="hidden" name="_utm_term" value={ctx.utm_term ?? ""} />
      <input type="hidden" name="_referrer" value={ctx.referrer ?? ""} />
      <input type="hidden" name="_user_agent" value={ctx.user_agent ?? ""} />
    </>
  );
}

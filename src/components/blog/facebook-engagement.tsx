"use client";

import { useEffect, useState } from "react";
import { ThumbsUp, MessageCircle, Share2 } from "lucide-react";

interface Engagement {
  reaction_count: number;
  comment_count: number;
  share_count: number;
}

export function FacebookEngagement({ slug }: { slug: string }) {
  const [data, setData] = useState<Engagement | null>(null);

  useEffect(() => {
    const url = `https://level8.bg/blog/${slug}`;
    fetch(`/api/facebook/engagement?url=${encodeURIComponent(url)}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {});
  }, [slug]);

  if (!data) return null;

  const total = data.reaction_count + data.comment_count + data.share_count;
  if (total === 0) return null;

  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      {data.reaction_count > 0 && (
        <span className="flex items-center gap-1">
          <ThumbsUp size={13} className="text-neon/60" />
          {data.reaction_count}
        </span>
      )}
      {data.comment_count > 0 && (
        <span className="flex items-center gap-1">
          <MessageCircle size={13} className="text-neon/60" />
          {data.comment_count}
        </span>
      )}
      {data.share_count > 0 && (
        <span className="flex items-center gap-1">
          <Share2 size={13} className="text-neon/60" />
          {data.share_count}
        </span>
      )}
    </div>
  );
}

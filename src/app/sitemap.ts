import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { CASE_STUDIES } from "@/lib/case-studies";
import { SKILLS } from "@/lib/skills-data";
import type { Database } from "@/types/database";

// Lazy-init anon client for sitemap generation
let _supabase: ReturnType<typeof createClient<Database>> | null = null;
function getSupabase() {
  if (
    !_supabase &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    _supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return _supabase;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://level8.bg";

  const projectPages = CASE_STUDIES.map((cs) => ({
    url: `${base}/projects/${cs.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const skillPages = SKILLS.map((skill) => ({
    url: `${base}/tools/skills/${skill.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Blog pages
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const supabase = getSupabase();
    if (supabase) {
      const { data: posts } = await supabase
        .from("blog_posts")
        .select("slug, updated_at")
        .eq("published", true);

      if (posts) {
        blogPages = posts.map((post) => ({
          url: `${base}/blog/${post.slug}`,
          lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }));
      }
    }
  } catch {
    // Supabase not available at build time — skip blog pages
  }

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${base}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${base}/design`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/tools/skills`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...projectPages,
    ...skillPages,
    ...blogPages,
    {
      url: `${base}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}

import { createClient } from "@/lib/supabase/server";
import { BlogPostList } from "@/components/admin/blog-post-list";
import type { BlogPost } from "@/types/admin";

export default async function BlogPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  return <BlogPostList posts={(data as BlogPost[]) || []} />;
}

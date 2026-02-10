import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BlogPostEditor } from "@/components/admin/blog-post-editor";
import type { BlogPost } from "@/types/admin";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();

  return <BlogPostEditor post={data as BlogPost} />;
}

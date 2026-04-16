import { BlogGenerateForm } from "@/components/admin/blog-generate-form";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NewBlogPostPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("category")
    .not("category", "is", null);

  const categories = Array.from(
    new Set((data ?? []).map((r) => r.category).filter(Boolean) as string[])
  ).sort();

  return <BlogGenerateForm existingCategories={categories} />;
}

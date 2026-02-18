"use client";

import { useEffect, useState } from "react";
import { Instagram } from "lucide-react";
import { SectionWrapper } from "@/components/layout/section-wrapper";
import { FadeIn } from "@/components/animations/fade-in";
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children";

interface InstagramPost {
  id: string;
  mediaUrl: string;
  permalink: string;
  caption: string;
  timestamp: string;
  mediaType: string;
}

interface ProfileData {
  followers: number;
  posts: number;
  username: string;
}

export function InstagramFeed() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    fetch("/api/instagram/feed")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts || []))
      .catch(() => {});

    fetch("/api/instagram/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.username) setProfile(d);
      })
      .catch(() => {});
  }, []);

  // Don't render the section if there are no posts
  if (posts.length === 0) return null;

  return (
    <SectionWrapper id="instagram">
      <FadeIn>
        <div className="text-center mb-12 md:mb-16">
          <span className="font-mono-terminal text-neon/40 text-xs tracking-[0.25em] uppercase">
            {"// INSTAGRAM"}
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mt-4">
            {"@level8.bg в "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon to-emerald-400">
              Instagram
            </span>
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {"Следвайте ни за полезни съвети, AI тенденции и зад кулисите на нашите проекти."}
          </p>
          {profile && profile.followers > 0 && (
            <div className="flex items-center justify-center gap-6 mt-5">
              <span className="text-sm text-muted-foreground">
                <span className="font-bold text-foreground">{profile.followers}</span>{" "}
                последователи
              </span>
              <span className="text-sm text-muted-foreground">
                <span className="font-bold text-foreground">{profile.posts}</span>{" "}
                публикации
              </span>
            </div>
          )}
        </div>
      </FadeIn>

      <StaggerChildren className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 max-w-5xl mx-auto">
        {posts.slice(0, 9).map((post) => (
          <StaggerItem key={post.id}>
            <a
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-square rounded-2xl overflow-hidden border border-border bg-surface"
            >
              <img
                src={post.mediaUrl}
                alt={post.caption || "Instagram post"}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                <p className="text-white text-xs md:text-sm text-center line-clamp-4 leading-relaxed">
                  {post.caption || ""}
                </p>
              </div>
              {/* Neon border glow on hover */}
              <div className="absolute inset-0 rounded-2xl border-2 border-neon/0 group-hover:border-neon/40 transition-colors duration-300 pointer-events-none" />
            </a>
          </StaggerItem>
        ))}
      </StaggerChildren>

      {/* Follow CTA */}
      <FadeIn delay={0.3}>
        <div className="text-center mt-10">
          <a
            href="https://www.instagram.com/level8.bg"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border bg-surface hover:border-neon/40 hover:bg-neon/5 text-foreground text-sm font-semibold transition-all duration-300 group"
          >
            <Instagram size={18} className="text-neon group-hover:scale-110 transition-transform" />
            {"Последвай @level8.bg"}
          </a>
        </div>
      </FadeIn>
    </SectionWrapper>
  );
}

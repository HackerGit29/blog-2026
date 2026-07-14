export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      admin_articles: {
        Row: {
          id: string
          author_id: string | null
          title: string
          slug: string
          summary: string | null
          content: string | null
          image_url: string | null
          video_url: string | null
          media_type: Database["public"]["Enums"]["media_type"] | null
          tags: string[] | null
          category_id: string | null
          meta_description: string | null
          reading_time: number | null
          status: Database["public"]["Enums"]["article_status"] | null
          is_published: boolean | null
          featured_order: number | null
          published_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          author_id?: string | null
          title: string
          slug: string
          summary?: string | null
          content?: string | null
          image_url?: string | null
          video_url?: string | null
          media_type?: Database["public"]["Enums"]["media_type"] | null
          tags?: string[] | null
          category_id?: string | null
          meta_description?: string | null
          reading_time?: number | null
          status?: Database["public"]["Enums"]["article_status"] | null
          is_published?: boolean | null
          featured_order?: number | null
          published_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          author_id?: string | null
          title?: string
          slug?: string
          summary?: string | null
          content?: string | null
          image_url?: string | null
          video_url?: string | null
          media_type?: Database["public"]["Enums"]["media_type"] | null
          tags?: string[] | null
          category_id?: string | null
          meta_description?: string | null
          reading_time?: number | null
          status?: Database["public"]["Enums"]["article_status"] | null
          is_published?: boolean | null
          featured_order?: number | null
          published_at?: string | null
          created_at?: string | null
        }
      }
      blog_categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon: string | null
          color: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          icon?: string | null
          color?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          icon?: string | null
          color?: string | null
          created_at?: string | null
        }
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          source: string | null
          status: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          email: string
          source?: string | null
          status?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          source?: string | null
          status?: string | null
          created_at?: string | null
        }
      }
    }
    Enums: {
      article_status: "draft" | "scheduled" | "published" | "archived"
      media_type: "image" | "video"
    }
  }
}

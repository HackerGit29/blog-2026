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
      blog_categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon: string | null
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          icon?: string | null
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          icon?: string | null
          color?: string | null
          created_at?: string
        }
      }
      admin_articles: {
        Row: {
          id: string
          author_id: string
          title: string
          slug: string
          summary: string | null
          content: string | null
          image_url: string | null
          video_url: string | null
          media_type: 'image' | 'video' | null
          tags: string[] | null
          category_id: string | null
          meta_description: string | null
          reading_time: number | null
          status: 'draft' | 'scheduled' | 'published' | 'archived' | null
          is_published: boolean | null
          featured_order: number | null
          published_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          author_id?: string
          title: string
          slug: string
          summary?: string | null
          content?: string | null
          image_url?: string | null
          video_url?: string | null
          media_type?: 'image' | 'video' | null
          tags?: string[] | null
          category_id?: string | null
          meta_description?: string | null
          reading_time?: number | null
          status?: 'draft' | 'scheduled' | 'published' | 'archived' | null
          is_published?: boolean | null
          featured_order?: number | null
          published_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          title?: string
          slug?: string
          summary?: string | null
          content?: string | null
          image_url?: string | null
          video_url?: string | null
          media_type?: 'image' | 'video' | null
          tags?: string[] | null
          category_id?: string | null
          meta_description?: string | null
          reading_time?: number | null
          status?: 'draft' | 'scheduled' | 'published' | 'archived' | null
          is_published?: boolean | null
          featured_order?: number | null
          published_at?: string | null
          created_at?: string
        }
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          source: string | null
          status: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          source?: string | null
          status?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          source?: string | null
          status?: string | null
          created_at?: string
        }
      }
    }
  }
}

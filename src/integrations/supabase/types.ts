export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admin_articles: {
        Row: {
          author_id: string | null
          category_id: string | null
          content: string | null
          created_at: string | null
          featured_order: number | null
          id: string
          image_url: string | null
          is_published: boolean | null
          media_type: Database["public"]["Enums"]["media_type"] | null
          meta_description: string | null
          published_at: string | null
          reading_time: number | null
          slug: string
          status: Database["public"]["Enums"]["article_status"] | null
          summary: string | null
          tags: string[] | null
          title: string
          video_url: string | null
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string | null
          featured_order?: number | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          media_type?: Database["public"]["Enums"]["media_type"] | null
          meta_description?: string | null
          published_at?: string | null
          reading_time?: number | null
          slug: string
          status?: Database["public"]["Enums"]["article_status"] | null
          summary?: string | null
          tags?: string[] | null
          title: string
          video_url?: string | null
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string | null
          featured_order?: number | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          media_type?: Database["public"]["Enums"]["media_type"] | null
          meta_description?: string | null
          published_at?: string | null
          reading_time?: number | null
          slug?: string
          status?: Database["public"]["Enums"]["article_status"] | null
          summary?: string | null
          tags?: string[] | null
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      message_reads: {
        Row: { message_id: string; read_at: string | null; user_id: string }
        Insert: { message_id: string; read_at?: string | null; user_id: string }
        Update: { message_id?: string; read_at?: string | null; user_id?: string }
        Relationships: []
      }
      messages: {
        Row: {
          author_id: string | null
          body: string
          cover_url: string | null
          cta_label: string | null
          cta_target: string | null
          cta_url: string | null
          id: string
          sent_at: string | null
          status: string | null
          title: string
          created_at: string | null
        }
        Insert: {
          author_id?: string | null
          body: string
          cover_url?: string | null
          cta_label?: string | null
          cta_target?: string | null
          cta_url?: string | null
          id?: string
          sent_at?: string | null
          status?: string | null
          title: string
          created_at?: string | null
        }
        Update: {
          author_id?: string | null
          body?: string
          cover_url?: string | null
          cta_label?: string | null
          cta_target?: string | null
          cta_url?: string | null
          id?: string
          sent_at?: string | null
          status?: string | null
          title?: string
          created_at?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          source: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          source?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          source?: string | null
          status?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          followers: string | null
          following: string | null
          id: string
          likes: string | null
          location: string | null
          name: string | null
          socials: Json | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          followers?: string | null
          following?: string | null
          id?: string
          likes?: string | null
          location?: string | null
          name?: string | null
          socials?: Json | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          followers?: string | null
          following?: string | null
          id?: string
          likes?: string | null
          location?: string | null
          name?: string | null
          socials?: Json | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      notification_reads: {
        Row: { notification_id: string; read_at: string | null; user_id: string }
        Insert: { notification_id: string; read_at?: string | null; user_id: string }
        Update: { notification_id?: string; read_at?: string | null; user_id?: string }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          cta_label: string | null
          cta_target: string | null
          cta_url: string | null
          icon: string | null
          id: string
          kind: Database["public"]["Enums"]["notif_kind"]
          metadata: Json | null
          title: string
          user_id: string
          created_at: string | null
        }
        Insert: {
          body?: string | null
          cta_label?: string | null
          cta_target?: string | null
          cta_url?: string | null
          icon?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["notif_kind"]
          metadata?: Json | null
          title: string
          user_id: string
          created_at?: string | null
        }
        Update: {
          body?: string | null
          cta_label?: string | null
          cta_target?: string | null
          cta_url?: string | null
          icon?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["notif_kind"]
          metadata?: Json | null
          title?: string
          user_id?: string
          created_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      article_list: {
        Row: {
          category: Json | null
          category_id: string | null
          created_at: string | null
          featured_order: number | null
          id: string | null
          image_url: string | null
          media_type: Database["public"]["Enums"]["media_type"] | null
          published_at: string | null
          reading_time: number | null
          slug: string | null
          summary: string | null
          tags: string[] | null
          title: string | null
          video_url: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      article_status: "draft" | "scheduled" | "published" | "archived"
      media_type: "image" | "video"
      notif_kind: "announcement" | "event" | "article" | "video" | "message" | "system"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      article_status: ["draft", "scheduled", "published", "archived"],
      media_type: ["image", "video"],
      notif_kind: ["announcement", "event", "article", "video", "message", "system"],
    },
  },
} as const

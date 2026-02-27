export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      ai_usage_logs: {
        Row: {
          id: string;
          user_id: string | null;
          feature: string;
          success: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          feature: string;
          success: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          feature?: string;
          success?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ai_usage_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          ai_opt_in: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          ai_opt_in?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          ai_opt_in?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      recipe_shares: {
        Row: {
          id: string;
          recipe_id: string;
          token: string;
          access: "viewer";
          is_revoked: boolean;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipe_id: string;
          token: string;
          access?: "viewer";
          is_revoked?: boolean;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipe_id?: string;
          token?: string;
          access?: "viewer";
          is_revoked?: boolean;
          created_by?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_shares_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recipe_shares_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          }
        ];
      };
      recipes: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          ingredients: Json;
          instructions: string;
          cuisine: string | null;
          prep_time_minutes: number | null;
          difficulty: "easy" | "medium" | "hard" | null;
          diet_tags: string[];
          status: "favorite" | "to_try" | "made_before";
          servings: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          ingredients?: Json;
          instructions: string;
          cuisine?: string | null;
          prep_time_minutes?: number | null;
          difficulty?: "easy" | "medium" | "hard" | null;
          diet_tags?: string[];
          status: "favorite" | "to_try" | "made_before";
          servings?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          ingredients?: Json;
          instructions?: string;
          cuisine?: string | null;
          prep_time_minutes?: number | null;
          difficulty?: "easy" | "medium" | "hard" | null;
          diet_tags?: string[];
          status?: "favorite" | "to_try" | "made_before";
          servings?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recipes_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_shared_recipe: {
        Args: { share_token: string };
        Returns: {
          id: string;
          name: string;
          ingredients: Json;
          instructions: string;
          cuisine: string | null;
          prep_time_minutes: number | null;
          difficulty: "easy" | "medium" | "hard" | null;
          diet_tags: string[];
          status: "favorite" | "to_try" | "made_before";
          servings: number | null;
          updated_at: string;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      bids: {
        Row: {
          availability: string | null
          bid_fee: number | null
          counter_offer_count: number | null
          created_at: string | null
          delivery_options: string | null
          estimated_time: string | null
          id: string
          images: string[] | null
          listing_id: string
          message: string
          negotiation_status:
            | Database["public"]["Enums"]["negotiation_status"]
            | null
          offer_valid_until: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          price: number
          seller_id: string
          seller_location: string | null
        }
        Insert: {
          availability?: string | null
          bid_fee?: number | null
          counter_offer_count?: number | null
          created_at?: string | null
          delivery_options?: string | null
          estimated_time?: string | null
          id?: string
          images?: string[] | null
          listing_id: string
          message: string
          negotiation_status?:
            | Database["public"]["Enums"]["negotiation_status"]
            | null
          offer_valid_until?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          price: number
          seller_id: string
          seller_location?: string | null
        }
        Update: {
          availability?: string | null
          bid_fee?: number | null
          counter_offer_count?: number | null
          created_at?: string | null
          delivery_options?: string | null
          estimated_time?: string | null
          id?: string
          images?: string[] | null
          listing_id?: string
          message?: string
          negotiation_status?:
            | Database["public"]["Enums"]["negotiation_status"]
            | null
          offer_valid_until?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          price?: number
          seller_id?: string
          seller_location?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bids_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          min_budget: number | null
          name: string
          type: Database["public"]["Enums"]["category_type"]
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          min_budget?: number | null
          name: string
          type: Database["public"]["Enums"]["category_type"]
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          min_budget?: number | null
          name?: string
          type?: Database["public"]["Enums"]["category_type"]
        }
        Relationships: []
      }
      connections: {
        Row: {
          bid_id: string
          buyer_id: string
          created_at: string | null
          id: string
          listing_id: string
          seller_id: string
        }
        Insert: {
          bid_id: string
          buyer_id: string
          created_at?: string | null
          id?: string
          listing_id: string
          seller_id: string
        }
        Update: {
          bid_id?: string
          buyer_id?: string
          created_at?: string | null
          id?: string
          listing_id?: string
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connections_bid_id_fkey"
            columns: ["bid_id"]
            isOneToOne: false
            referencedRelation: "bids"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          buyer_id: string
          category_id: string | null
          condition: Database["public"]["Enums"]["condition_type"] | null
          contact_method: Database["public"]["Enums"]["contact_method"] | null
          created_at: string | null
          delivery_preference:
            | Database["public"]["Enums"]["delivery_preference"]
            | null
          description: string
          expires_at: string | null
          flagged_at: string | null
          flagged_reason: string | null
          id: string
          images: string[] | null
          is_flagged: boolean | null
          is_negotiable: boolean | null
          listing_type: Database["public"]["Enums"]["listing_type"]
          location: string | null
          required_date: string | null
          status: Database["public"]["Enums"]["listing_status"] | null
          title: string
          updated_at: string | null
          urgency: Database["public"]["Enums"]["urgency_level"] | null
          visibility_days: number | null
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          buyer_id: string
          category_id?: string | null
          condition?: Database["public"]["Enums"]["condition_type"] | null
          contact_method?: Database["public"]["Enums"]["contact_method"] | null
          created_at?: string | null
          delivery_preference?:
            | Database["public"]["Enums"]["delivery_preference"]
            | null
          description: string
          expires_at?: string | null
          flagged_at?: string | null
          flagged_reason?: string | null
          id?: string
          images?: string[] | null
          is_flagged?: boolean | null
          is_negotiable?: boolean | null
          listing_type: Database["public"]["Enums"]["listing_type"]
          location?: string | null
          required_date?: string | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          title: string
          updated_at?: string | null
          urgency?: Database["public"]["Enums"]["urgency_level"] | null
          visibility_days?: number | null
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          buyer_id?: string
          category_id?: string | null
          condition?: Database["public"]["Enums"]["condition_type"] | null
          contact_method?: Database["public"]["Enums"]["contact_method"] | null
          created_at?: string | null
          delivery_preference?:
            | Database["public"]["Enums"]["delivery_preference"]
            | null
          description?: string
          expires_at?: string | null
          flagged_at?: string | null
          flagged_reason?: string | null
          id?: string
          images?: string[] | null
          is_flagged?: boolean | null
          is_negotiable?: boolean | null
          listing_type?: Database["public"]["Enums"]["listing_type"]
          location?: string | null
          required_date?: string | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          title?: string
          updated_at?: string | null
          urgency?: Database["public"]["Enums"]["urgency_level"] | null
          visibility_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      negotiations: {
        Row: {
          bid_id: string
          created_at: string
          from_user_id: string
          id: string
          listing_id: string
          message: string
          price: number
          responded_at: string | null
          round_number: number
          status: Database["public"]["Enums"]["negotiation_status"]
          to_user_id: string
        }
        Insert: {
          bid_id: string
          created_at?: string
          from_user_id: string
          id?: string
          listing_id: string
          message: string
          price: number
          responded_at?: string | null
          round_number?: number
          status?: Database["public"]["Enums"]["negotiation_status"]
          to_user_id: string
        }
        Update: {
          bid_id?: string
          created_at?: string
          from_user_id?: string
          id?: string
          listing_id?: string
          message?: string
          price?: number
          responded_at?: string | null
          round_number?: number
          status?: Database["public"]["Enums"]["negotiation_status"]
          to_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "negotiations_bid_id_fkey"
            columns: ["bid_id"]
            isOneToOne: false
            referencedRelation: "bids"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "negotiations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          read: boolean | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          bid_id: string | null
          created_at: string | null
          currency: string | null
          flutterwave_tx_ref: string | null
          id: string
          payment_type: Database["public"]["Enums"]["payment_type"]
          status: Database["public"]["Enums"]["transaction_status"] | null
          subscription_id: string | null
          transaction_ref: string | null
          user_id: string
        }
        Insert: {
          amount: number
          bid_id?: string | null
          created_at?: string | null
          currency?: string | null
          flutterwave_tx_ref?: string | null
          id?: string
          payment_type: Database["public"]["Enums"]["payment_type"]
          status?: Database["public"]["Enums"]["transaction_status"] | null
          subscription_id?: string | null
          transaction_ref?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          bid_id?: string | null
          created_at?: string | null
          currency?: string | null
          flutterwave_tx_ref?: string | null
          id?: string
          payment_type?: Database["public"]["Enums"]["payment_type"]
          status?: Database["public"]["Enums"]["transaction_status"] | null
          subscription_id?: string | null
          transaction_ref?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_bid_id_fkey"
            columns: ["bid_id"]
            isOneToOne: false
            referencedRelation: "bids"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          average_rating: number | null
          created_at: string | null
          email: string
          id: string
          is_suspended: boolean | null
          name: string
          phone: string | null
          response_rate: number | null
          suspended_at: string | null
          suspended_reason: string | null
          total_connections: number | null
          trust_level: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          average_rating?: number | null
          created_at?: string | null
          email: string
          id: string
          is_suspended?: boolean | null
          name: string
          phone?: string | null
          response_rate?: number | null
          suspended_at?: string | null
          suspended_reason?: string | null
          total_connections?: number | null
          trust_level?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          average_rating?: number | null
          created_at?: string | null
          email?: string
          id?: string
          is_suspended?: boolean | null
          name?: string
          phone?: string | null
          response_rate?: number | null
          suspended_at?: string | null
          suspended_reason?: string | null
          total_connections?: number | null
          trust_level?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      seller_ratings: {
        Row: {
          buyer_id: string
          connection_id: string
          created_at: string
          id: string
          rating: number
          review: string | null
          seller_id: string
        }
        Insert: {
          buyer_id: string
          connection_id: string
          created_at?: string
          id?: string
          rating: number
          review?: string | null
          seller_id: string
        }
        Update: {
          buyer_id?: string
          connection_id?: string
          created_at?: string
          id?: string
          rating?: number
          review?: string | null
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_ratings_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: true
            referencedRelation: "connections"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          bid_limit: number | null
          created_at: string | null
          features: Json | null
          id: string
          is_popular: boolean | null
          name: string
          price: number
        }
        Insert: {
          bid_limit?: number | null
          created_at?: string | null
          features?: Json | null
          id?: string
          is_popular?: boolean | null
          name: string
          price: number
        }
        Update: {
          bid_limit?: number | null
          created_at?: string | null
          features?: Json | null
          id?: string
          is_popular?: boolean | null
          name?: string
          price?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          auto_renew: boolean | null
          bid_limit: number | null
          bids_used: number | null
          created_at: string | null
          end_date: string
          id: string
          plan_name: string
          seller_id: string
          start_date: string | null
          status: Database["public"]["Enums"]["subscription_status"] | null
        }
        Insert: {
          auto_renew?: boolean | null
          bid_limit?: number | null
          bids_used?: number | null
          created_at?: string | null
          end_date: string
          id?: string
          plan_name: string
          seller_id: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
        }
        Update: {
          auto_renew?: boolean | null
          bid_limit?: number | null
          bids_used?: number | null
          created_at?: string | null
          end_date?: string
          id?: string
          plan_name?: string
          seller_id?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
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
          role: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_notification: {
        Args: {
          _message: string
          _metadata?: Json
          _title: string
          _type: Database["public"]["Enums"]["notification_type"]
          _user_id: string
        }
        Returns: string
      }
      get_trust_discount: { Args: { _seller_id: string }; Returns: number }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "buyer" | "seller" | "admin"
      category_type: "product" | "service"
      condition_type: "new" | "used" | "any"
      contact_method: "email" | "phone" | "both" | "whatsapp" | "any"
      delivery_preference: "delivery" | "pickup" | "both" | "either"
      listing_status: "open" | "resolved"
      listing_type: "product" | "service"
      negotiation_status:
        | "pending"
        | "accepted"
        | "rejected"
        | "countered"
        | "expired"
      notification_type:
        | "new_bid"
        | "bid_accepted"
        | "subscription_expiring"
        | "listing_resolved"
        | "connection_made"
      payment_method: "single_bid" | "subscription"
      payment_status: "pending" | "paid" | "failed"
      payment_type: "single_bid" | "subscription" | "subscription_renewal"
      subscription_status: "active" | "expired" | "cancelled"
      transaction_status: "pending" | "successful" | "failed" | "refunded"
      urgency_level: "low" | "medium" | "high" | "urgent"
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
  public: {
    Enums: {
      app_role: ["buyer", "seller", "admin"],
      category_type: ["product", "service"],
      condition_type: ["new", "used", "any"],
      contact_method: ["email", "phone", "both", "whatsapp", "any"],
      delivery_preference: ["delivery", "pickup", "both", "either"],
      listing_status: ["open", "resolved"],
      listing_type: ["product", "service"],
      negotiation_status: [
        "pending",
        "accepted",
        "rejected",
        "countered",
        "expired",
      ],
      notification_type: [
        "new_bid",
        "bid_accepted",
        "subscription_expiring",
        "listing_resolved",
        "connection_made",
      ],
      payment_method: ["single_bid", "subscription"],
      payment_status: ["pending", "paid", "failed"],
      payment_type: ["single_bid", "subscription", "subscription_renewal"],
      subscription_status: ["active", "expired", "cancelled"],
      transaction_status: ["pending", "successful", "failed", "refunded"],
      urgency_level: ["low", "medium", "high", "urgent"],
    },
  },
} as const

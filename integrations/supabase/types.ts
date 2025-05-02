export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bottles: {
        Row: {
          cost_per_unit: number
          created_at: string | null
          id: string
          name: string
          size_ml: number
          stock: number
          updated_at: string | null
        }
        Insert: {
          cost_per_unit?: number
          created_at?: string | null
          id?: string
          name: string
          size_ml: number
          stock?: number
          updated_at?: string | null
        }
        Update: {
          cost_per_unit?: number
          created_at?: string | null
          id?: string
          name?: string
          size_ml?: number
          stock?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      car_requests: {
        Row: {
          id: string
          request_time: string | null
          status: string
          ticket_id: string | null
        }
        Insert: {
          id?: string
          request_time?: string | null
          status: string
          ticket_id?: string | null
        }
        Update: {
          id?: string
          request_time?: string | null
          status?: string
          ticket_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "car_requests_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      oils: {
        Row: {
          cost_per_ml: number
          created_at: string | null
          id: string
          name: string
          stock_ml: number
          updated_at: string | null
        }
        Insert: {
          cost_per_ml?: number
          created_at?: string | null
          id?: string
          name: string
          stock_ml?: number
          updated_at?: string | null
        }
        Update: {
          cost_per_ml?: number
          created_at?: string | null
          id?: string
          name?: string
          stock_ml?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      sales: {
        Row: {
          bottle_id: string | null
          created_at: string | null
          id: string
          oil_amount_ml: number
          oil_id: string | null
          quantity: number
          sale_date: string | null
          total_amount: number
          unit_price: number
        }
        Insert: {
          bottle_id?: string | null
          created_at?: string | null
          id?: string
          oil_amount_ml: number
          oil_id?: string | null
          quantity: number
          sale_date?: string | null
          total_amount: number
          unit_price: number
        }
        Update: {
          bottle_id?: string | null
          created_at?: string | null
          id?: string
          oil_amount_ml?: number
          oil_id?: string | null
          quantity?: number
          sale_date?: string | null
          total_amount?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_bottle_id_fkey"
            columns: ["bottle_id"]
            isOneToOne: false
            referencedRelation: "bottles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_oil_id_fkey"
            columns: ["oil_id"]
            isOneToOne: false
            referencedRelation: "oils"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          amount_ml: number
          created_at: string | null
          id: string
          notes: string | null
          oil_id: string | null
          reference_id: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
        }
        Insert: {
          amount_ml: number
          created_at?: string | null
          id?: string
          notes?: string | null
          oil_id?: string | null
          reference_id?: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
        }
        Update: {
          amount_ml?: number
          created_at?: string | null
          id?: string
          notes?: string | null
          oil_id?: string | null
          reference_id?: string | null
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_oil_id_fkey"
            columns: ["oil_id"]
            isOneToOne: false
            referencedRelation: "oils"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          company_name: string
          id: string
          instructions: string | null
          is_paid: boolean | null
          issue_date: string | null
          price: number
          ticket_number: string
          ticket_type: string | null
        }
        Insert: {
          company_name: string
          id?: string
          instructions?: string | null
          is_paid?: boolean | null
          issue_date?: string | null
          price: number
          ticket_number: string
          ticket_type?: string | null
        }
        Update: {
          company_name?: string
          id?: string
          instructions?: string | null
          is_paid?: boolean | null
          issue_date?: string | null
          price?: number
          ticket_number?: string
          ticket_type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      transaction_type: "sale" | "purchase" | "adjustment"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      transaction_type: ["sale", "purchase", "adjustment"],
    },
  },
} as const

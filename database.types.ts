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
      entities: {
        Row: {
          address_en: string | null
          address_kr: string | null
          client_code: string | null
          created_at: string
          has_poa: boolean | null
          id: string
          name_en: string | null
          name_kr: string
          representative_name: string | null
          signature_image_url: string | null
          signer_name: string | null
          signer_position: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address_en?: string | null
          address_kr?: string | null
          client_code?: string | null
          created_at?: string
          has_poa?: boolean | null
          id?: string
          name_en?: string | null
          name_kr: string
          representative_name?: string | null
          signature_image_url?: string | null
          signer_name?: string | null
          signer_position: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address_en?: string | null
          address_kr?: string | null
          client_code?: string | null
          created_at?: string
          has_poa?: boolean | null
          id?: string
          name_en?: string | null
          name_kr?: string
          representative_name?: string | null
          signature_image_url?: string | null
          signer_name?: string | null
          signer_position?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      inventors: {
        Row: {
          address_en: string | null
          address_kr: string | null
          created_at: string
          id: string
          id_number: string | null
          name_en: string | null
          name_kr: string
          nationality: string | null
          residence_country: string | null
          updated_at: string
          user_id: string
          zipcode: string | null
        }
        Insert: {
          address_en?: string | null
          address_kr?: string | null
          created_at?: string
          id?: string
          id_number?: string | null
          name_en?: string | null
          name_kr: string
          nationality?: string | null
          residence_country?: string | null
          updated_at?: string
          user_id: string
          zipcode?: string | null
        }
        Update: {
          address_en?: string | null
          address_kr?: string | null
          created_at?: string
          id?: string
          id_number?: string | null
          name_en?: string | null
          name_kr?: string
          nationality?: string | null
          residence_country?: string | null
          updated_at?: string
          user_id?: string
          zipcode?: string | null
        }
        Relationships: []
      }
      patents: {
        Row: {
          abandonment_date: string | null
          abandonment_reason: string | null
          annuity_due_date: string | null
          applicant: Json | null
          applicant_reference: string | null
          application_number: string | null
          application_type: string
          assignee: Json | null
          attorney_name: string | null
          claims_due_date: string | null
          claims_submitted_at: string | null
          country_code: string | null
          created_at: string
          decision_to_register_date: string | null
          earliest_priority_date: string | null
          electronic_certificate_selected: boolean | null
          examination_request_due: string | null
          examination_requested: Database["public"]["Enums"]["yes_no"] | null
          examination_requested_at: string | null
          expedited_examination_date: string | null
          expedited_examination_requested: boolean | null
          filing_date: string | null
          filing_deadline: string | null
          final_claim_count: number | null
          inventor: Json | null
          is_annuity_managed: boolean | null
          is_paid: boolean | null
          late_registration_penalty_due: string | null
          metadata: Json | null
          our_ref: string
          paid_at: string | null
          patent_id: number
          pct_application_date: string | null
          pct_application_number: string | null
          prior_disclosure_documents: Json | null
          prior_disclosure_exception_claimed: boolean | null
          priority_claimed: Database["public"]["Enums"]["yes_no"] | null
          priority_date: string | null
          priority_rights: Json | null
          protection_term: string | null
          publication_date: string | null
          publication_number: string | null
          registration_date: string | null
          registration_deadline: string | null
          registration_number: string | null
          request_date: string | null
          status: string
          title_en: string | null
          title_kr: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          abandonment_date?: string | null
          abandonment_reason?: string | null
          annuity_due_date?: string | null
          applicant?: Json | null
          applicant_reference?: string | null
          application_number?: string | null
          application_type: string
          assignee?: Json | null
          attorney_name?: string | null
          claims_due_date?: string | null
          claims_submitted_at?: string | null
          country_code?: string | null
          created_at?: string
          decision_to_register_date?: string | null
          earliest_priority_date?: string | null
          electronic_certificate_selected?: boolean | null
          examination_request_due?: string | null
          examination_requested?: Database["public"]["Enums"]["yes_no"] | null
          examination_requested_at?: string | null
          expedited_examination_date?: string | null
          expedited_examination_requested?: boolean | null
          filing_date?: string | null
          filing_deadline?: string | null
          final_claim_count?: number | null
          inventor?: Json | null
          is_annuity_managed?: boolean | null
          is_paid?: boolean | null
          late_registration_penalty_due?: string | null
          metadata?: Json | null
          our_ref: string
          paid_at?: string | null
          patent_id?: never
          pct_application_date?: string | null
          pct_application_number?: string | null
          prior_disclosure_documents?: Json | null
          prior_disclosure_exception_claimed?: boolean | null
          priority_claimed?: Database["public"]["Enums"]["yes_no"] | null
          priority_date?: string | null
          priority_rights?: Json | null
          protection_term?: string | null
          publication_date?: string | null
          publication_number?: string | null
          registration_date?: string | null
          registration_deadline?: string | null
          registration_number?: string | null
          request_date?: string | null
          status: string
          title_en?: string | null
          title_kr?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          abandonment_date?: string | null
          abandonment_reason?: string | null
          annuity_due_date?: string | null
          applicant?: Json | null
          applicant_reference?: string | null
          application_number?: string | null
          application_type?: string
          assignee?: Json | null
          attorney_name?: string | null
          claims_due_date?: string | null
          claims_submitted_at?: string | null
          country_code?: string | null
          created_at?: string
          decision_to_register_date?: string | null
          earliest_priority_date?: string | null
          electronic_certificate_selected?: boolean | null
          examination_request_due?: string | null
          examination_requested?: Database["public"]["Enums"]["yes_no"] | null
          examination_requested_at?: string | null
          expedited_examination_date?: string | null
          expedited_examination_requested?: boolean | null
          filing_date?: string | null
          filing_deadline?: string | null
          final_claim_count?: number | null
          inventor?: Json | null
          is_annuity_managed?: boolean | null
          is_paid?: boolean | null
          late_registration_penalty_due?: string | null
          metadata?: Json | null
          our_ref?: string
          paid_at?: string | null
          patent_id?: never
          pct_application_date?: string | null
          pct_application_number?: string | null
          prior_disclosure_documents?: Json | null
          prior_disclosure_exception_claimed?: boolean | null
          priority_claimed?: Database["public"]["Enums"]["yes_no"] | null
          priority_date?: string | null
          priority_rights?: Json | null
          protection_term?: string | null
          publication_date?: string | null
          publication_number?: string | null
          registration_date?: string | null
          registration_deadline?: string | null
          registration_number?: string | null
          request_date?: string | null
          status?: string
          title_en?: string | null
          title_kr?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          approved_at: string
          created_at: string
          metadata: Json
          order_id: string
          order_name: string
          payment_id: number
          payment_key: string
          raw_data: Json
          receipt_url: string
          requested_at: string
          status: string
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          approved_at: string
          created_at?: string
          metadata: Json
          order_id: string
          order_name: string
          payment_id?: never
          payment_key: string
          raw_data: Json
          receipt_url: string
          requested_at: string
          status: string
          total_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          approved_at?: string
          created_at?: string
          metadata?: Json
          order_id?: string
          order_name?: string
          payment_id?: never
          payment_key?: string
          raw_data?: Json
          receipt_url?: string
          requested_at?: string
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          marketing_consent: boolean
          name: string
          profile_id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          marketing_consent?: boolean
          name: string
          profile_id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          marketing_consent?: boolean
          name?: string
          profile_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      pop: {
        Args: { queue_name: string }
        Returns: {
          msg_id: number
          read_ct: number
          enqueued_at: string
          vt: string
          message: Json
        }[]
      }
    }
    Enums: {
      yes_no: "예" | "아니오"
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
      yes_no: ["예", "아니오"],
    },
  },
} as const

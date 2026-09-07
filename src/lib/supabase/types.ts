// Hand-written to match ../../../revelo-project-spec/data-model.md exactly.
// Once the schema is deployed to a real Supabase project, regenerate this
// file with `supabase gen types typescript` and replace it wholesale.

export type Role = "buyer" | "seller" | "admin";

export type BikeType =
  | "hardtail"
  | "cargo"
  | "city"
  | "folding"
  | "mountain"
  | "hybrid";

export type ListingType = "self" | "certified";

export type SelfBikeStatus = "live" | "reserved" | "sold";
export type CertifiedBikeStatus =
  | "in_workshop"
  | "photographed"
  | "live"
  | "reserved"
  | "delivered"
  | "paid_out";
export type BikeStatus = SelfBikeStatus | CertifiedBikeStatus;

export type SubmissionChosenPath = "self" | "certify";
export type SubmissionStatus = "pending" | "approved" | "rejected" | "flagged";

export type OfferStatus = "pending" | "countered" | "accepted" | "rejected";

export type Fulfillment = "delivery" | "pickup";
export type WarrantyTier = "included" | "extended_6mo" | "annual_care";

export type SelfTestRideStatus = "pending" | "accepted" | "rejected";
export type CertifiedTestRideStatus = "accepted";
export type TestRideStatus = SelfTestRideStatus | CertifiedTestRideStatus;

export type SenderRole = "buyer" | "seller_mock";

export type NotificationRecipientRole = "seller" | "admin";

export interface ConditionNote {
  text: string;
  photo_ref: string | null;
}

export interface BatteryHealth {
  percent: number;
  cycles: number;
  tested_on: string;
}

export interface AutomatedChecks {
  phone_verified: boolean;
  photos_original: boolean;
  price_in_range: boolean;
  repeat_seller: boolean;
}

export interface Finding {
  text: string;
  photo_ref: string | null;
}

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: "13";
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: Role;
          display_name: string | null;
        };
        Insert: {
          id: string;
          role: Role;
          display_name?: string | null;
        };
        Update: Partial<{
          id: string;
          role: Role;
          display_name: string | null;
        }>;
        Relationships: [];
      };
      sell_submissions: {
        Row: {
          id: string;
          seller_id: string;
          brand: string;
          model: string;
          year: number;
          km: number;
          type: BikeType;
          estimated_range_low: number | null;
          estimated_range_high: number | null;
          chosen_path: SubmissionChosenPath;
          asking_price: number | null;
          seller_photos: string[] | null;
          status: SubmissionStatus;
          automated_checks: AutomatedChecks | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          brand: string;
          model: string;
          year: number;
          km: number;
          type: BikeType;
          estimated_range_low?: number | null;
          estimated_range_high?: number | null;
          chosen_path: SubmissionChosenPath;
          asking_price?: number | null;
          seller_photos?: string[] | null;
          status?: SubmissionStatus;
          automated_checks?: AutomatedChecks | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["sell_submissions"]["Insert"]>;
        Relationships: [];
      };
      bikes: {
        Row: {
          id: string;
          seller_id: string;
          source_submission_id: string | null;
          brand: string;
          model: string;
          year: number;
          km: number;
          type: BikeType;
          /** Nullable — not collected at submission time; admin fills via Edit. */
          frame_size: string | null;
          rider_height_range: string | null;
          price: number;
          listing_type: ListingType;
          photos: string[];
          condition_notes: ConditionNote[];
          battery_health: BatteryHealth | null;
          /** Generated column: (battery_health->>'percent')::int. Read-only. */
          battery_percent: number | null;
          // Not in data-model.md — added in 0006_bikes_spec_fields.sql for
          // P1's bike-detail spec grid, which needs them but data-model.md
          // (and P2's admin edit fields) never defined a column for them.
          range_km: number | null;
          motor_spec: string | null;
          serviced_note: string | null;
          status: BikeStatus;
          certified_live_since: string | null;
          // Added post-P0 (see 0009_bikes_pending_certification.sql): P3's
          // seller self-service edit flow can request certification on an
          // already-live self-listed bike without changing the bike itself
          // — this flags it on the seller's own listings page.
          pending_certification: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          source_submission_id?: string | null;
          brand: string;
          model: string;
          year: number;
          km: number;
          type: BikeType;
          frame_size?: string | null;
          rider_height_range?: string | null;
          price: number;
          listing_type: ListingType;
          photos?: string[];
          condition_notes?: ConditionNote[];
          battery_health?: BatteryHealth | null;
          range_km?: number | null;
          motor_spec?: string | null;
          serviced_note?: string | null;
          status?: BikeStatus;
          certified_live_since?: string | null;
          pending_certification?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["bikes"]["Insert"]>;
        Relationships: [];
      };
      certifications: {
        Row: {
          id: string;
          bike_id: string;
          submission_id: string;
          points_passed: number;
          points_total: number;
          findings: Finding[];
          repair_cost: number;
          seller_approved: boolean;
          comps_range_low: number;
          comps_range_high: number;
          comps_sample_size: number;
          comps_days: number;
          list_price: number;
          commission_amount: number;
          repair_deduction: number;
          inspection_fee_waived: boolean;
          seller_payout: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          bike_id: string;
          submission_id: string;
          points_passed: number;
          points_total: number;
          findings?: Finding[];
          repair_cost?: number;
          seller_approved?: boolean;
          comps_range_low: number;
          comps_range_high: number;
          comps_sample_size: number;
          comps_days: number;
          list_price: number;
          commission_amount: number;
          repair_deduction?: number;
          inspection_fee_waived?: boolean;
          seller_payout: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["certifications"]["Insert"]>;
        Relationships: [];
      };
      offers: {
        Row: {
          id: string;
          bike_id: string;
          buyer_id: string;
          proposed_price: number;
          counter_price: number | null;
          status: OfferStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          bike_id: string;
          buyer_id: string;
          proposed_price: number;
          counter_price?: number | null;
          status?: OfferStatus;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["offers"]["Insert"]>;
        Relationships: [];
      };
      reservations: {
        Row: {
          id: string;
          bike_id: string;
          buyer_id: string;
          offer_id: string | null;
          fulfillment: Fulfillment;
          warranty_tier: WarrantyTier;
          buyer_protection_fee: number;
          delivery_fee: number;
          total: number;
          reservation_amount: number;
          emi_opted: boolean;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          bike_id: string;
          buyer_id: string;
          offer_id?: string | null;
          fulfillment: Fulfillment;
          warranty_tier: WarrantyTier;
          buyer_protection_fee: number;
          delivery_fee?: number;
          total: number;
          reservation_amount: number;
          emi_opted?: boolean;
          status?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["reservations"]["Insert"]>;
        Relationships: [];
      };
      test_rides: {
        Row: {
          id: string;
          bike_id: string;
          buyer_id: string;
          requested_slot: string;
          status: TestRideStatus;
          rejection_reason: string | null;
          alternative_dates: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          bike_id: string;
          buyer_id: string;
          requested_slot: string;
          status?: TestRideStatus;
          rejection_reason?: string | null;
          alternative_dates?: string[] | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["test_rides"]["Insert"]>;
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          bike_id: string;
          buyer_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          bike_id: string;
          buyer_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["conversations"]["Insert"]>;
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_role: SenderRole;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_role: SenderRole;
          body: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>;
        Relationships: [];
      };
      service_bookings: {
        Row: {
          id: string;
          bike_brand_model: string;
          issue_category: string;
          fulfillment: Fulfillment;
          phone: string;
          slot_date: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          bike_brand_model: string;
          issue_category: string;
          fulfillment: Fulfillment;
          phone: string;
          slot_date: string;
          status?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["service_bookings"]["Insert"]>;
        Relationships: [];
      };
      service_slots: {
        Row: {
          id: string;
          date: string;
          slots_available: number;
        };
        Insert: {
          id?: string;
          date: string;
          slots_available: number;
        };
        Update: Partial<Database["public"]["Tables"]["service_slots"]["Insert"]>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          recipient_role: NotificationRecipientRole;
          recipient_id: string | null;
          type: string;
          body: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_role: NotificationRecipientRole;
          recipient_id: string | null;
          type: string;
          body: string;
          read?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      // 0010_book_inspection_slot_fn.sql — atomically claims one inspection
      // slot; returns false (not an error) when none is left.
      book_inspection_slot: {
        Args: { p_date: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

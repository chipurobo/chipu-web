// Hand-written types that mirror supabase/migrations/20260601000000_init.sql.
//
// When the schema changes meaningfully, regenerate properly with:
//   npx supabase gen types typescript --local > src/lib/database.types.ts
// (you'll lose the human-friendly comments, but it'll always be in sync).

export type SchoolType = 'special' | 'integrated' | 'mainstream';
export type UserRole = 'admin' | 'school_lead';
export type OrderStatus =
  | 'placed'
  | 'accepted'
  | 'in_production'
  | 'shipped'
  | 'delivered'
  | 'cancelled';
export type UnitStatus =
  | 'with_maker'
  | 'in_transit'
  | 'with_school'
  | 'with_user'
  | 'returned'
  | 'retired';

export interface School {
  id: string;
  name: string;
  type: SchoolType;
  is_maker_space: boolean;
  county: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface CodeClub {
  id: string;
  school_id: string;
  registered_by: string;
  roster_image_path: string | null;
  member_count: number;
  registered_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  school_id: string | null;
  created_at: string;
}

// Despite the name (kept for backwards-compat with the table), this is
// the canonical "person at this school we can assign equipment to" row.
// in_club distinguishes the code-club roster from other students.
export interface ClubMember {
  id: string;
  school_id: string;
  full_name: string;
  grade: string | null;
  is_active: boolean;
  in_club: boolean;
  joined_at: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  is_durable: boolean;
  sku: string | null;
  designed_by_school_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  placed_by_school_id: string;
  fulfilled_by_school_id: string | null;
  product_id: string;
  quantity: number;
  status: OrderStatus;
  notes: string | null;
  expected_delivery: string | null;
  placed_at: string;
  accepted_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
}

export interface ProductUnit {
  id: string;
  serial_number: string;
  product_id: string;
  order_id: string | null;
  fabricated_by_school_id: string;
  current_school_id: string | null;
  current_member_id: string | null;
  status: UnitStatus;
  fabricated_at: string;
  assigned_at: string | null;
  notes: string | null;
}

export interface StockLedgerEntry {
  id: string;
  school_id: string;
  product_id: string;
  delta: number;
  order_id: string | null;
  recorded_by: string;
  recorded_at: string;
  note: string | null;
}

// RPC return types
export interface RegisterSchoolWithClubArgs {
  p_school_name: string;
  p_county: string;
  p_school_type: SchoolType;
  p_is_maker_space: boolean;
  p_member_count: number;
  p_full_name: string;
  p_phone: string;
  p_contact_email?: string | null;
}

export type UserRole = "user" | "store" | "admin";

export type MembershipType = "free" | "pro1" | "pro2" | "pro3" | "special";

export interface MembershipHistory {
  id: string;
  user_id: string;
  from_type: MembershipType;
  to_type: MembershipType;
  changed_by_admin_id: string;
  changed_at: string; // ISO Date string
}

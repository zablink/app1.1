import { User } from "./user";

export type MembershipHistory = {
  id: string;
  user_id: string;
  from_type: "free" | "pro1" | "pro2" | "pro3" | "special";
  to_type: "free" | "pro1" | "pro2" | "pro3" | "special";
  changed_by_admin_id: string;
  changed_at: string;
  users?: Pick<User, "email" | "name">; // เอาเฉพาะ email กับ name
};

export type Membership = {
  Membership: "free" | "pro1" | "pro2" | "pro3" | "special";
}
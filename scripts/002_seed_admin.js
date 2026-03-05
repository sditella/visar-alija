import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const username = "xadmin";
const password = "ViSar2026!";

const salt = bcrypt.genSaltSync(12);
const hash = bcrypt.hashSync(password, salt);

const { data, error } = await supabase
  .from("admin_users")
  .upsert({ username, password_hash: hash }, { onConflict: "username" })
  .select();

if (error) {
  console.error("Error seeding admin:", error);
} else {
  console.log("Admin user seeded:", data);
}

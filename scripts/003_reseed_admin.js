import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const password = "MoMo2026!";
  const hash = await bcrypt.hash(password, 12);
  console.log("Generated hash:", hash);

  // Delete existing admin
  await supabase.from("admin_users").delete().eq("username", "xadmin");

  // Insert fresh
  const { data, error } = await supabase
    .from("admin_users")
    .insert({ username: "xadmin", password_hash: hash })
    .select();

  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Admin seeded:", data);
  }

  // Verify
  const { data: check } = await supabase
    .from("admin_users")
    .select("*")
    .eq("username", "xadmin")
    .single();
  
  if (check) {
    const valid = await bcrypt.compare(password, check.password_hash);
    console.log("Verification - password matches:", valid);
  }
}

main();

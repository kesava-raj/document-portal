const { createClient } = require('@supabase/supabase-js');

async function testInsert() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: client, error: clientError } = await supabaseAdmin.from("clients").insert({
    name: "Test Client",
    platform: "Test Platform",
    sector: "Test Sector",
    short_code: "TE",
    logo_url: null,
    phone: "1234567890",
    is_active: true
  }).select().single();

  console.log("Client Error:", clientError);
  console.log("Client Data:", client);
}

testInsert();

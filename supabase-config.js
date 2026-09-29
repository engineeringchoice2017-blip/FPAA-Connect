/* =====================================================================
   FPAA Connect 2.0 — Supabase configuration
   ---------------------------------------------------------------------
   Leave SUPABASE_URL and SUPABASE_ANON_KEY empty to run in DEMO MODE
   (all data is stored in this browser's localStorage).

   To connect a real backend:
     1. Create a Supabase project and run schema.sql in the SQL editor.
     2. Paste your Project URL and the *anon public* key below.

   SECURITY: only the anon (public) key belongs here. NEVER paste the
   service_role key into any frontend file — it bypasses Row Level
   Security and would expose every member's private data.
   ===================================================================== */

window.FPAA_CONFIG = {
  SUPABASE_URL: "",        // e.g. "https://abcdefghijkl.supabase.co"
  SUPABASE_ANON_KEY: "",   // e.g. "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

  // Branding — replace the file to use the official emblem (SVG/PNG/WEBP)
  LOGO_URL: "assets/fpaa-logo.png",

  // Public URL used on certificates, membership cards and verification links.
  // Leave empty to use the current page address.
  PUBLIC_SITE_URL: "",

  // Official details shown in the footer, About page, Home contact panel and certificate
  // (from the FPAA rule books). Leave CONTACT_PHONE empty to hide the phone row.
  CONTACT_EMAIL: "falakatapolytechnicalumni@gmail.com",
  CONTACT_PHONE: "",
  CONTACT_ADDRESS: "Baganbari, Falakata, Dist - Alipurduar, West Bengal – 735211",
  REGISTRATION_NO: "S0058184 of 2025-26",
  // Website printed on the certificate. Leave empty to use the address the app is opened from.
  WEBSITE: "",

  // Memories — photo albums kept on Google Drive (no storage used by the app).
  // Each folder must be shared as "Anyone with the link can view".
  MEMORY_DRIVE_FOLDERS: [
    { title: "Falakata Polytechnic Days", url: "https://drive.google.com/drive/folders/1xsHdpEoHGcnRvFl7dHFYrSnUrCiRXqlV" },
    { title: "All Photos", url: "https://drive.google.com/drive/folders/13_RJdUDNJ-djSp4AoTA2T7b7mPvUPvJ7" }
  ]
};

/* Guard: refuse to run if a service-role key is ever pasted here. */
(function () {
  try {
    var k = window.FPAA_CONFIG.SUPABASE_ANON_KEY || "";
    var parts = k.split(".");
    if (parts.length === 3) {
      var payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
      if (payload && payload.role === "service_role") {
        console.error("FPAA Connect 2.0: a service_role key was found in supabase-config.js. It has been ignored. Use the anon key only.");
        window.FPAA_CONFIG.SUPABASE_ANON_KEY = "";
        window.FPAA_CONFIG.SUPABASE_URL = "";
      }
    }
  } catch (e) { /* not a JWT — ignore */ }
})();

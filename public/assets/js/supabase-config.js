export const SUPABASE_URL = 'https://wefqtfabkyvkbnmxhyrj.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_vRgHaGstWmyiVtFxahs2fw_C4n8T68y';

export const supabaseReady =
  !SUPABASE_URL.includes('YOUR_PROJECT_REF') &&
  !SUPABASE_ANON_KEY.includes('YOUR_SUPABASE_ANON_KEY');
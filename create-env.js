const fs = require('fs');

const envContent = `VITE_SUPABASE_URL=https://jcdottewlpabezbqtruv.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_IM6mPuzzTb_zz9nhoYtxPg_vxIpbXZQ`;

fs.writeFileSync('c:\\TimeShit\\.env', envContent, 'utf8');

console.log('Arquivo .env criado com sucesso!');

import { createClient } from '@supabase/supabase-js'

// Forçar valores direto para contornar problema do .env
const url = 'https://jcdottewlpabezbqtruv.supabase.co'
const key = 'sb_publishable_IM6mPuzzTb_zz9nhoYtxPg_vxIpbXZQ'

// Debug logs
console.log('Environment variables:')
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('VITE_SUPABASE_ANON_KEY exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY)
console.log('Using URL:', url)
console.log('Using Key exists:', !!key)

export const supabase = createClient(url, key)

import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnon) {
  console.error(
    '[Gravan] VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não configuradas. ' +
    'Adicione essas variáveis de ambiente no painel da Vercel.'
  )
}

export const supabase = createClient(
  supabaseUrl  || 'https://placeholder.supabase.co',
  supabaseAnon || 'placeholder-anon-key'
)

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wrhkqffxjokowabmhija.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyaGtxZmZ4am9rb3dhYm1oaWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2MTg0NzMsImV4cCI6MjEwMzE5NDQ3M30.I-Sr3i95DgUsRF7zI5-TQ1zLT8oHbQhAYDGdnbz3BpU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

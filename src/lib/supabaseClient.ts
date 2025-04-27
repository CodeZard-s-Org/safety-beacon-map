import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lmiapvucdcaetykjtris.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtaWFwdnVjZGNhZXR5a2p0cmlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MzMxMTUsImV4cCI6MjA2MTMwOTExNX0.kmdNIZMzp8ihQ_eYbq4mbRDKXnPjVYYMSDSWIM0ZIJw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

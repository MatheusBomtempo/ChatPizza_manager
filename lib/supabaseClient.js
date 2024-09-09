// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ukvpxbxncyvuuukfditp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrdnB4YnhuY3l2dXV1a2ZkaXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUzMzc1NjIsImV4cCI6MjA0MDkxMzU2Mn0.C2vqqc9cZL5Jyiy0KK9aSnaiDmOA5U6bLhQbikxi67U'
export const supabase = createClient(supabaseUrl, supabaseKey)

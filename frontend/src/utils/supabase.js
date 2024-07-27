import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  })
  return { user: data.user, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export function getSession() {
  return supabase.auth.getSession()
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session)
  })
}

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      stock_levels (
        bar_count,
        count_100g,
        count_50g
      )
    `)
  return { data, error }
}

export async function updateStockLevels(productId, updates) {
  const { data, error } = await supabase
    .from('stock_levels')
    .update(updates)
    .eq('product_id', productId)
  return { data, error }
}

export async function addActionLog(userId, productId, actionType, quantity) {
  const { data, error } = await supabase
    .from('action_logs')
    .insert({ user_id: userId, product_id: productId, action_type: actionType, quantity })
  return { data, error }
}

// Add more functions as needed for other operations
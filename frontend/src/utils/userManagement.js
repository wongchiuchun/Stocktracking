import { supabase } from './supabase';

export async function createUser(email, password, isAdmin = false) {
  // Sign up the user
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
  });

  if (error) {
    console.error('Error creating user:', error);
    return { success: false, error: error.message };
  }

  // If signup successful, add additional user data
  if (data.user) {
    const { error: profileError } = await supabase
      .from('users')
      .upsert({ 
        id: data.user.id, 
        email: email,
        is_admin: isAdmin,
        username: email.split('@')[0] // Using email prefix as username
      });

    if (profileError) {
      console.error('Error adding user profile:', profileError);
      return { success: false, error: profileError.message };
    }
  }

  return { success: true, user: data.user };
}

export async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    console.error('Error logging in:', error);
    return { success: false, error: error.message };
  }

  return { success: true, user: data.user };
}
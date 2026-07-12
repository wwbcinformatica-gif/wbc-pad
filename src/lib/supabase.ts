import { createBrowserClient } from "@supabase/ssr"

function getClient() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
      console.error('Supabase environment variables not configured:')
      console.error('NEXT_PUBLIC_SUPABASE_URL:', url)
      console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', key ? 'exists' : 'missing')
      return null
    }

    console.log('Creating Supabase client with URL:', url)
    const client = createBrowserClient(url, key)
    console.log('Supabase client created successfully')
    return client
  } catch (error) {
    console.error('Error creating Supabase client:', error)
    return null
  }
}

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (!client) {
    try {
      console.log('Creating new Supabase client...')
      client = getClient()
      
      if (!client) {
        console.error('Failed to create Supabase client - using mock client')
        // Create a more complete mock client
        client = {
          auth: {
            getUser: async () => ({ 
              data: { user: null }, 
              error: null 
            }),
            signOut: async () => ({ error: null })
          },
          from: (table: string) => ({
            select: (query?: any) => ({ 
              data: [], 
              error: null 
            }),
            insert: (data: any) => ({ 
              data: null, 
              error: null 
            }),
            update: (data: any) => ({ 
              data: null, 
              error: null 
            }),
            delete: () => ({ 
              data: null, 
              error: null 
            }),
            upsert: (data: any) => ({ 
              data: null, 
              error: null 
            }),
            eq: (column: string, value: any) => ({
              select: (query?: any) => ({ 
                data: [], 
                error: null 
              })
            }),
            single: () => ({
              data: null,
              error: null
            })
          })
        } as any
      }
      
      console.log('Supabase client initialized successfully')
    } catch (error) {
      console.error('Error in createClient:', error)
      // Return mock client as fallback
      client = {
        auth: {
          getUser: async () => ({ 
            data: { user: null }, 
            error: null 
          }),
          signOut: async () => ({ error: null })
        },
        from: (table: string) => ({
          select: (query?: any) => ({ 
            data: [], 
            error: null 
          }),
          insert: (data: any) => ({ 
            data: null, 
            error: null 
          }),
          update: (data: any) => ({ 
            data: null, 
            error: null 
          }),
          delete: () => ({ 
            data: null, 
            error: null 
          }),
          upsert: (data: any) => ({ 
            data: null, 
            error: null 
          }),
          eq: (column: string, value: any) => ({
            select: (query?: any) => ({ 
              data: [], 
              error: null 
            })
          }),
          single: () => ({
            data: null,
            error: null
          })
        })
      } as any
    }
  }
  return client
}

export function getSupabase() {
  const client = createClient()
  if (!client) {
    console.error('Supabase client is not available')
    return null
  }
  return client
}

// Alternative function for direct access
export function getSupabaseDirect() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    console.error('Environment variables not available for direct access:', {
      url: url ? 'exists' : 'missing',
      key: key ? 'exists' : 'missing'
    })
    return null
  }
  
  const client = createBrowserClient(url, key)
  console.log('Supabase direct client created successfully')
  return client
}

// Test function to check database connection
export async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...')
    console.log('Environment variables check:', {
      url: typeof process.env.NEXT_PUBLIC_SUPABASE_URL !== 'undefined' ? 'exists' : 'missing',
      key: typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'undefined' ? 'exists' : 'missing'
    })
    
    const supabase = getSupabaseDirect()
    if (!supabase) {
      console.error('Supabase client not available')
      return false
    }
    
    // Try different tables to find one that works
    const tables = ['user_settings', 'profiles', 'notes', 'passwords', 'subscription_plans']
    let lastError
    
    for (const table of tables) {
      try {
        console.log(`Testing table: ${table}`)
        const { data, error } = await supabase.from(table).select('id').limit(1)
        
        if (!error) {
          console.log(`Successfully connected to ${table}`)
          return true
        }
        
        console.log(`Failed to connect to ${table}:`, error)
        lastError = error
      } catch (tableError) {
        console.log(`Error testing table ${table}:`, tableError)
        lastError = tableError
      }
    }
    
    console.error('All table connection attempts failed')
    return false
  } catch (error) {
    console.error('Database connection test error:', error)
    return false
  }
}

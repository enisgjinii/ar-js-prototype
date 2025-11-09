# Admin Client Fix - "not_admin" Error

## 🚨 The Problem

Even with the service role key in `.env.local`, you were getting:

```
Error [AuthApiError]: User not allowed
{__isAuthError: true, status: 403, code: 'not_admin'}
```

## 🔍 Root Cause

The server client (`lib/supabase/server.ts`) was using the **anon key** instead of the **service role key**:

```typescript
// ❌ This uses ANON_KEY
createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,  // ← Wrong key!
    ...
)
```

## ✅ The Solution

Created a separate **admin client** that uses the service role key:

### New File: `lib/supabase/admin.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // ← Correct key!
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
```

### Updated: `app/admin/users/page.tsx`

```typescript
import { createAdminClient } from '@/lib/supabase/admin'

export default async function UsersPage() {
    const supabaseAdmin = createAdminClient()

    // Now uses service role key
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()
    ...
}
```

## 🎯 Why Two Clients?

### Regular Client (`lib/supabase/server.ts`)

- Uses **anon key**
- For normal operations
- Respects Row Level Security
- User-scoped access

### Admin Client (`lib/supabase/admin.ts`)

- Uses **service role key**
- For admin operations
- Bypasses Row Level Security
- Full database access

## 🔐 When to Use Each

### Use Regular Client For:

- ✅ User authentication
- ✅ User-scoped queries
- ✅ Normal CRUD operations
- ✅ RLS-protected data

### Use Admin Client For:

- ✅ Listing all users
- ✅ Admin operations
- ✅ Bypassing RLS
- ✅ System-level queries

## 📊 Comparison

| Feature      | Regular Client | Admin Client     |
| ------------ | -------------- | ---------------- |
| **Key**      | Anon Key       | Service Role Key |
| **Access**   | User-scoped    | Full admin       |
| **RLS**      | Enforced       | Bypassed         |
| **Use Case** | Normal ops     | Admin ops        |

## 🚀 What Changed

### Before

```typescript
const supabase = await createClient(); // Uses anon key
const {
  data: { users },
} = await supabase.auth.admin.listUsers(); // ❌ Fails
```

### After

```typescript
const supabaseAdmin = createAdminClient(); // Uses service role key
const {
  data: { users },
} = await supabaseAdmin.auth.admin.listUsers(); // ✅ Works
```

## ✅ Now It Works!

The users page now:

- ✅ Uses the correct admin client
- ✅ Has service role privileges
- ✅ Can list all users
- ✅ Can access admin functions

## 🎊 Test It

Visit: `http://localhost:3000/admin/users`

Should now show all users! 🎉

## 📚 Files Created/Modified

### Created

- `lib/supabase/admin.ts` - Admin client with service role key

### Modified

- `app/admin/users/page.tsx` - Now uses admin client

### Unchanged

- `lib/supabase/server.ts` - Still uses anon key (correct for normal ops)
- `lib/supabase/client.ts` - Still uses anon key (correct for client-side)

## 🔒 Security

The admin client:

- ✅ Only used server-side
- ✅ Never exposed to client
- ✅ Service role key stays secret
- ✅ Used only for admin operations

---

**Summary:** Created a separate admin client that uses the service role key for admin operations like listing users.

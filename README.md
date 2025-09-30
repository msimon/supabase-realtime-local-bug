# Supabase Realtime Test

 Application that demonstrates the Supabase Realtime API does not work with publishable key locally

### Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start Supabase locally:**
   ```bash
   npx supabase start
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Testing the Realtime Functionality

1. Click the "Start Listening" button in the app
2. Open Supabase Studio at [http://127.0.0.1:54323](http://127.0.0.1:54323)
3. Will be able to connect if NEXT_PUBLIC_SUPABASE_ANON_KEY is set but not NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

This is using the default setup with supabase-js v2.58.0 & supabase-cli v2.47.2

## How to test the issues

In .env.local uncomment the key you want to use and re-run `npm run dev`
- ✅ **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** - Subscriptions work correctly
- ❌ **`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`** - Subscriptions will fail

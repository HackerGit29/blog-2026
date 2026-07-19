// Cleanup function for old notifications
// This function purges notifications older than 7 days
// Run via: supabase functions deploy cleanup-notifications --schedule "0 0 * * 0"
// Using Supabase-js for cleaner DB access in Edge Functions
//
// Cascade behavior:
//   - notification_reads.notification_id  → FK references notifications(id) ON DELETE CASCADE
//     → Automatically cleaned when parent notification is deleted
//   - notification_deletes.notification_id → plain uuid (NO FK constraint)
//     → Must be cleaned separately (see orphan cleanup in STEP 2b)

import { createClient } from 'https://esm.run/@supabase/supabase-js@2';

export const handler = {
  async serve(req: Request, ctx: { env: Record<string, string> }) {
    const supabaseUrl = ctx.env.SUPABASE_URL;
    const serviceRoleKey = ctx.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create admin client with service role (bypasses RLS)
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Calculate cutoff date (7 days ago)
    const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    try {
      // ──────────────────────────────────────────────
      // STEP 1: Delete notifications older than 7 days
      // ──────────────────────────────────────────────
      // This CASCADE deletes from notification_reads (has FK with CASCADE).
      // It does NOT cascade to notification_deletes (no FK constraint).
      const { data: deletedNotifications, error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .lt('created_at', cutoffDate)
        .select('id');

      if (deleteError) {
        return new Response(
          JSON.stringify({ error: `Failed to delete notifications: ${deleteError.message}` }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const deletedIds = (deletedNotifications || []).map((n: { id: string }) => n.id);
      const deletedCount = deletedIds.length;

      // ──────────────────────────────────────────────────────
      // STEP 2: Clean up notification_deletes records
      // ──────────────────────────────────────────────────────
      // Two categories of rows to remove:
      //   a) Rows older than 7 days (same cutoff as notifications)
      //   b) Rows referencing notifications that were just deleted (orphans)
      //
      // Note: (b) catches edge cases where an admin manually deleted a notification
      // but the notification_deletes row persisted (no FK cascade).

      // 2a: Delete old notification_deletes by timestamp
      const { error: oldDeletesError } = await supabase
        .from('notification_deletes')
        .delete()
        .lt('deleted_at', cutoffDate);

      if (oldDeletesError) {
        console.error('Failed to clean old notification_deletes by timestamp:', oldDeletesError.message);
      }

      // 2b: Delete notification_deletes for notifications that were just removed
      // (orphans — the notification no longer exists, but its deletes record remains)
      if (deletedIds.length > 0) {
        const { error: orphanError } = await supabase
          .from('notification_deletes')
          .delete()
          .in('notification_id', deletedIds);

        if (orphanError) {
          console.error('Failed to clean orphan notification_deletes:', orphanError.message);
        }
      }

      return new Response(
        JSON.stringify({
          message: 'Cleanup completed',
          deletedNotifications: deletedCount,
          cutoffDate,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (e: any) {
      return new Response(
        JSON.stringify({ error: e.message || 'Unknown error during cleanup' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  },
};

export default handler.serve;
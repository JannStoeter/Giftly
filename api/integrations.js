import { requireAdmin, send, fail } from './_lib/auth.js';
import { igConfigured, account } from './_lib/instagram.js';
import { gadsConfigured } from './_lib/gads.js';
import { aiConfigured } from './_lib/draft.js';

/** Zeigt, welche Verbindungen eingerichtet sind. Gibt nie Schlüssel heraus, nur ja oder nein. */
export default async function handler(req, res) {
  try {
    await requireAdmin(req);
    const ig = { configured: igConfigured(), username: '', error: '' };
    if (ig.configured) { try { ig.username = (await account()).username; } catch (e) { ig.error = e.message; } }
    return send(res, 200, {
      instagram: ig,
      googleAds: { configured: gadsConfigured() },
      ai: { configured: aiConfigured() },
      cron: { secret: !!process.env.CRON_SECRET, serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY },
    });
  } catch (e) { return fail(res, e); }
}

// Vercel Serverless Function — runs on the server, never in the browser.
// Keeps the Google Safe Browsing API key hidden from users.
//
// SETUP:
// 1. Go to https://console.cloud.google.com/ → create a project (free).
// 2. Enable "Safe Browsing API" for that project.
// 3. Create an API key under "Credentials".
// 4. In your Vercel project → Settings → Environment Variables, add:
//      Name:  GOOGLE_SAFE_BROWSING_KEY
//      Value: <the key you just created>
// 5. Redeploy. That's it — no code changes needed.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body || {};
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing url' });
  }

  const apiKey = process.env.GOOGLE_SAFE_BROWSING_KEY;
  if (!apiKey) {
    // API key not set up yet — tell the client so it can fall back gracefully.
    return res.status(200).json({ configured: false, flagged: false, matches: [] });
  }

  try {
    const gRes = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: { clientId: 'acat-link-checker', clientVersion: '1.0.0' },
          threatInfo: {
            threatTypes: [
              'MALWARE',
              'SOCIAL_ENGINEERING',
              'UNWANTED_SOFTWARE',
              'POTENTIALLY_HARMFUL_APPLICATION',
            ],
            platformTypes: ['ANY_PLATFORM'],
            threatEntryTypes: ['URL'],
            threatEntries: [{ url }],
          },
        }),
      }
    );

    if (!gRes.ok) {
      return res.status(200).json({ configured: true, error: true, flagged: false, matches: [] });
    }

    const data = await gRes.json();
    const matches = data.matches || [];
    return res.status(200).json({ configured: true, flagged: matches.length > 0, matches });
  } catch (e) {
    return res.status(200).json({ configured: true, error: true, flagged: false, matches: [] });
  }
}

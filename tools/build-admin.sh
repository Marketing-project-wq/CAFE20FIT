#!/usr/bin/env bash
# Build the online-order CMS (source: Cafe-POS repo, artifacts/pos-cafe/src/cms) as static files for
# cafe.20fit.id/admin and copy them into ./admin.
#
#   tools/build-admin.sh [path-to-Cafe-POS-checkout]      (default: ../cafe-pos)
#
# Login: CMS password (checked server-side by the cafe_admin_login_password RPC against a bcrypt hash in
# cf_cafe_secret -- the password is never in these files) or barista PIN. Only the publishable key is embedded.
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
pos="${1:-$here/../cafe-pos}/artifacts/pos-cafe"
export VITE_SUPABASE_URL="${VITE_SUPABASE_URL:-https://cpvzwqptzcxnwzfzgrmt.supabase.co}"
export VITE_SUPABASE_ANON_KEY="${VITE_SUPABASE_ANON_KEY:-sb_publishable_0t9vEOYeIo_YM1__X5iNMQ_qXofEozw}"
(cd "$pos" && npx vite build --config vite.admin.config.ts)
rm -rf "$here/admin"
cp -r "$pos/dist/admin" "$here/admin"
mv "$here/admin/admin.html" "$here/admin/index.html"
echo "admin/ updated:"; ls -la "$here/admin" "$here/admin/assets"

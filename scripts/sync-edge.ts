/**
 * sync-edge.ts
 * Copie supabase/functions/ → functions/ (racine) avant le déploiement
 * Cloudflare Pages. Les sources canoniques restent dans supabase/functions/.
 *
 * Usage : node --loader tsx scripts/sync-edge.ts
 */
import { copyFileSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const SRC = join(process.cwd(), 'supabase', 'functions');
const DEST = join(process.cwd(), 'functions');

function copyDir(src: string, dest: string) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    if (statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
      console.log(`  ✓ ${relative(process.cwd(), destPath)}`);
    }
  }
}

// Clean destination first
try {
  rmSync(DEST, { recursive: true, force: true });
} catch { /* ignore */ }

console.log('🔄 Syncing supabase/functions/ → functions/ (Cloudflare Pages)');
copyDir(SRC, DEST);
console.log('✅ Sync complete.');

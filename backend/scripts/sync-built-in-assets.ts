import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import * as path from 'path';

const MIME_TYPES: Record<string, string> = {
  '.gif': 'image/gif',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
};

interface AssetSource {
  directory: string;
  objectPrefix: string;
  kind: 'sticker' | 'image' | 'video';
}

async function filesUnder(directory: string): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);
      return entry.isDirectory() ? filesUnder(fullPath) : [fullPath];
    }),
  );
  return files.flat();
}

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required to sync built-in assets',
    );
  }

  const repositoryRoot = path.resolve(process.cwd(), '..');
  const sources: AssetSource[] = [
    {
      directory: path.join(repositoryRoot, 'frontend/public/stickers'),
      objectPrefix: 'stickers',
      kind: 'sticker',
    },
  ];
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  let synced = 0;

  for (const source of sources) {
    const files = await filesUnder(source.directory);
    for (const filePath of files) {
      const extension = path.extname(filePath).toLowerCase();
      const mimeType = MIME_TYPES[extension];
      if (!mimeType) {
        continue;
      }

      const relativePath = path
        .relative(source.directory, filePath)
        .split(path.sep)
        .join('/');
      const objectPath = `${source.objectPrefix}/${relativePath}`;
      const buffer = await fs.readFile(filePath);
      const category = relativePath.includes('/')
        ? relativePath.split('/')[0]
        : null;
      const displayName = path
        .basename(filePath, extension)
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase());

      const { error: uploadError } = await supabase.storage
        .from('built-in-assets')
        .upload(objectPath, buffer, {
          contentType: mimeType,
          upsert: true,
        });
      if (uploadError) {
        throw new Error(`Failed to upload ${objectPath}: ${uploadError.message}`);
      }

      const { error: metadataError } = await supabase
        .from('media_assets')
        .upsert(
          {
            owner_id: null,
            source: 'built_in',
            kind: source.kind,
            bucket_id: 'built-in-assets',
            object_path: objectPath,
            display_name: displayName,
            category,
            mime_type: mimeType,
            byte_size: buffer.byteLength,
            status: 'ready',
          },
          { onConflict: 'bucket_id,object_path' },
        );
      if (metadataError) {
        throw new Error(
          `Failed to save metadata for ${objectPath}: ${metadataError.message}`,
        );
      }
      synced += 1;
    }
  }

  console.log(`Synced ${synced} built-in assets`);
}

void main();

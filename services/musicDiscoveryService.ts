import {
  getAssetsAsync,
  getAssetInfoAsync,
  MediaType,
  type Asset,
} from 'expo-media-library';
import type { Song } from '@/types/Song';

const MIN_DURATION_MS = 30_000;

export async function discoverSongs(): Promise<Song[]> {
  const allAssets: Asset[] = [];
  let after: string | undefined = undefined;

  do {
    const result = await getAssetsAsync({
      mediaType: MediaType.audio,
      first: 100,
      after,
    });

    allAssets.push(...result.assets);
    after = result.hasNextPage ? result.endCursor : undefined;
  } while (after);

  const songs: Song[] = [];
  const seenUris = new Set<string>();

  const batchSize = 20;
  for (let i = 0; i < allAssets.length; i += batchSize) {
    const batch = allAssets.slice(i, i + batchSize);
    const detailedInfos = await Promise.all(
      batch.map((asset) => getAssetInfoAsync(asset))
    );

    for (const info of detailedInfos) {
      if (!info.localUri || seenUris.has(info.localUri)) continue;
      if ((info.duration || 0) < MIN_DURATION_MS / 1000) continue;

      seenUris.add(info.localUri);

      const filename = info.filename?.replace(/\.[^/.]+$/, '') || 'Unknown';

      const artist = (info as unknown as { artist?: string }).artist || 'Unknown Artist';
      const album = (info as unknown as { album?: string }).album || 'Unknown Album';

      songs.push({
        id: info.id,
        title: filename,
        artist,
        album,
        duration: (info.duration || 0) * 1000,
        uri: info.localUri,
        artwork: info.uri,
      });
    }
  }

  return songs;
}
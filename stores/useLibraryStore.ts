import { create } from 'zustand';

interface Album {
  id: string;
  name: string;
  songIds: string[];
  createdAt: string;
}

interface LibraryState {
  likedSongIds: string[];
  albums: Album[];
  isLoading: boolean;

  toggleLike: (songId: string) => void;
  isLiked: (songId: string) => boolean;
  addAlbum: (name: string) => void;
  deleteAlbum: (albumId: string) => void;
  renameAlbum: (albumId: string, name: string) => void;
  addSongToAlbum: (albumId: string, songId: string) => void;
  removeSongFromAlbum: (albumId: string, songId: string) => void;
  setLikedSongIds: (ids: string[]) => void;
  setAlbums: (albums: Album[]) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  likedSongIds: [],
  albums: [],
  isLoading: true,

  toggleLike: (songId) =>
    set((state) => {
      const isLiked = state.likedSongIds.includes(songId);
      return {
        likedSongIds: isLiked
          ? state.likedSongIds.filter((id) => id !== songId)
          : [...state.likedSongIds, songId],
      };
    }),

  isLiked: (songId) => get().likedSongIds.includes(songId),

  addAlbum: (name) =>
    set((state) => ({
      albums: [
        ...state.albums,
        {
          id: `album-${Date.now()}`,
          name,
          songIds: [],
          createdAt: new Date().toISOString(),
        },
      ],
    })),

  deleteAlbum: (albumId) =>
    set((state) => ({
      albums: state.albums.filter((album) => album.id !== albumId),
    })),

  renameAlbum: (albumId, name) =>
    set((state) => ({
      albums: state.albums.map((album) =>
        album.id === albumId ? { ...album, name } : album
      ),
    })),

  addSongToAlbum: (albumId, songId) =>
    set((state) => ({
      albums: state.albums.map((album) =>
        album.id === albumId && !album.songIds.includes(songId)
          ? { ...album, songIds: [...album.songIds, songId] }
          : album
      ),
    })),

  removeSongFromAlbum: (albumId, songId) =>
    set((state) => ({
      albums: state.albums.map((album) =>
        album.id === albumId
          ? { ...album, songIds: album.songIds.filter((id) => id !== songId) }
          : album
      ),
    })),

  setLikedSongIds: (ids) => set({ likedSongIds: ids }),
  setAlbums: (albums) => set({ albums }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));
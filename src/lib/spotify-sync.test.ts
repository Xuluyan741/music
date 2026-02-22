import { describe, it, expect } from "vitest";
import {
  mapTopArtistsToRows,
  mapTopTracksToRows,
  type SpotifyTopArtistItem,
  type SpotifyTopTrackItem,
} from "./spotify-sync";

describe("mapTopArtistsToRows", () => {
  it("maps API response to DB rows with rank and image", () => {
    const items: SpotifyTopArtistItem[] = [
      { id: "a1", name: "Artist One", images: [{ url: "https://x.com/1.jpg" }] },
      { id: "a2", name: "Artist Two" },
    ];
    const rows = mapTopArtistsToRows("user-1", "2025-02-22", "medium_term", items);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({
      userId: "user-1",
      snapshotDate: "2025-02-22",
      timeRange: "medium_term",
      rank: 1,
      spotifyId: "a1",
      name: "Artist One",
      imageUrl: "https://x.com/1.jpg",
    });
    expect(rows[1].imageUrl).toBeNull();
    expect(rows[1].rank).toBe(2);
  });

  it("caps at 20 items", () => {
    const items = Array.from({ length: 30 }, (_, i) => ({
      id: `id-${i}`,
      name: `Name ${i}`,
    })) as SpotifyTopArtistItem[];
    const rows = mapTopArtistsToRows("u", "2025-01-01", "short_term", items);
    expect(rows).toHaveLength(20);
  });
});

describe("mapTopTracksToRows", () => {
  it("maps API response and joins artist names", () => {
    const items: SpotifyTopTrackItem[] = [
      {
        id: "t1",
        name: "Track One",
        artists: [{ name: "A" }, { name: "B" }],
        album: { images: [{ url: "https://x.com/t.jpg" }] },
      },
    ];
    const rows = mapTopTracksToRows("user-1", "2025-02-22", "long_term", items);
    expect(rows).toHaveLength(1);
    expect(rows[0].artistNames).toBe("A, B");
    expect(rows[0].imageUrl).toBe("https://x.com/t.jpg");
  });

  it("caps at 20 items and handles empty artists", () => {
    const items = Array.from({ length: 25 }, (_, i) => ({
      id: `t-${i}`,
      name: `Track ${i}`,
      artists: [] as Array<{ name: string }>,
    })) as SpotifyTopTrackItem[];
    const rows = mapTopTracksToRows("u", "2025-01-01", "short_term", items);
    expect(rows).toHaveLength(20);
    expect(rows[0].artistNames).toBe("");
  });
});

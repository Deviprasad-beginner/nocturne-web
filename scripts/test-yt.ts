
import ytSearch from 'yt-search';

async function test() {
    console.log("Searching...");
    const r = await ytSearch("lofi hip hop live radio");

    console.log("Result keys:", Object.keys(r));

    if ((r as any).live) {
        console.log("Found 'live' property with", (r as any).live.length, "items");
        console.log("First live item:", JSON.stringify((r as any).live[0], null, 2));
    } else {
        console.log("No 'live' property found on result object.");
    }

    // Also check if any video has specific text like 'watching' which indicates live
    const liveInVideos = r.videos.filter(v =>
        v.title.toLowerCase().includes("live") ||
        v.description.toLowerCase().includes("live")
    );
    console.log("Videos with 'live' text:", liveInVideos.length);
    if (liveInVideos.length > 0) {
        console.log("First live-text video:", JSON.stringify(liveInVideos[0], null, 2));
    }
}

test();

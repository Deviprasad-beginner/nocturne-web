
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const soundcloud = require("soundcloud-scraper");
const client = new soundcloud.Client();

async function testSoundCloud() {
    try {
        console.log("Searching for 'lofi hip hop' on SoundCloud...");
        const result = await client.search("lofi hip hop", "track");

        if (result.length > 0) {
            console.log(`✅ Found ${result.length} tracks!`);
            console.log("First track full object:", JSON.stringify(result[0], null, 2));
        } else {
            console.log("❌ No tracks found.");
        }
    } catch (e) {
        console.error("❌ Error searching SoundCloud:", e);
    }
}

testSoundCloud();

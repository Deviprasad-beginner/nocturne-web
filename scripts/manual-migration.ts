import "dotenv/config";
import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function runManualMigration() {
    try {
        console.log("Adding missing columns manually...");

        // Add detected_emotion
        await db.execute(sql`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='diaries' AND column_name='detected_emotion') THEN 
                    ALTER TABLE diaries ADD COLUMN detected_emotion varchar(50); 
                END IF; 
            END $$;
        `);
        console.log("Appended detected_emotion");

        // Add sentiment_score
        await db.execute(sql`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='diaries' AND column_name='sentiment_score') THEN 
                    ALTER TABLE diaries ADD COLUMN sentiment_score integer; 
                END IF; 
            END $$;
        `);
        console.log("Appended sentiment_score");

        // Add reflection_depth
        await db.execute(sql`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='diaries' AND column_name='reflection_depth') THEN 
                    ALTER TABLE diaries ADD COLUMN reflection_depth integer; 
                END IF; 
            END $$;
        `);
        console.log("Appended reflection_depth");

        console.log("Manual migration completed.");
    } catch (error) {
        console.error("Error running manual migration:", error);
    }
    process.exit(0);
}

runManualMigration();

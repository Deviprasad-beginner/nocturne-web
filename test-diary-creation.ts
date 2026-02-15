
import "dotenv/config";
import { storage } from "./server/storage";
import { insertDiarySchema } from "@shared/schema";

async function testDiaryCreation() {
    try {
        console.log("🚀 Starting Diary Creation Test...");

        // 1. Setup a test user
        const testEmail = `test_${Date.now()}@example.com`;
        const testUser = await storage.createUser({
            username: `testuser_${Date.now()}`,
            email: testEmail,
            displayName: "Test User",
            password: "password123",
            googleId: `google_${Date.now()}`
        });
        console.log(`✅ Created test user: ID ${testUser.id}`);

        // 2. Refresh user to ensure default values
        const user = await storage.getUser(testUser.id);
        if (!user) throw new Error("User not found after creation");
        console.log("Initial User State:", {
            currentStreak: user.currentStreak,
            lastEntryDate: user.lastEntryDate
        });

        // 3. Create Diary Entry
        console.log("📝 Attempting to create diary entry...");
        const diaryData = {
            content: "This is a test entry to verify the creation flow.",
            mood: "testing",
            isPublic: false,
            authorId: user.id
        };

        // Validate with schema first (mimic frontend/controller validation)
        const validation = insertDiarySchema.safeParse(diaryData);
        if (!validation.success) {
            console.error("❌ Validation Failed:", validation.error);
            process.exit(1);
        }

        const diary = await storage.createDiary(diaryData);
        console.log(`✅ Diary created successfully: ID ${diary.id}`);

        // 4. Verify Streak Update
        const updatedUser = await storage.getUser(user.id);
        console.log("Updated User State:", {
            currentStreak: updatedUser?.currentStreak,
            lastEntryDate: updatedUser?.lastEntryDate
        });

        if (updatedUser?.currentStreak !== 1) {
            console.error("❌ Streak did not increment correctly!");
            process.exit(1);
        }

        console.log("✅ Streak logic verified.");
        process.exit(0);

    } catch (error) {
        console.error("❌ Test Failed:", error);
        process.exit(1);
    }
}

testDiaryCreation();

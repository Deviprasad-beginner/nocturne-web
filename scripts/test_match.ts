import "dotenv/config";

async function testMatch() {
  console.log("Entering User 1 (mood: lonely)...");
  const res1 = await fetch("http://localhost:5000/api/resonance/queue", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mood: "lonely" }),
  });
  const data1 = await res1.json();
  console.log("User 1 queue:", data1);

  console.log("\nEntering User 2 (mood: grateful) - complementary match!...");
  const res2 = await fetch("http://localhost:5000/api/resonance/queue", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mood: "grateful" }),
  });
  const data2 = await res2.json();
  console.log("User 2 match result:", data2);
}

testMatch()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

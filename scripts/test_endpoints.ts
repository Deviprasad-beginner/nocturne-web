import "dotenv/config";

async function test() {
  console.log("1. Testing normal public whisper:");
  const res1 = await fetch("http://localhost:5000/api/whispers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: "The city feels completely silent tonight. Just me and the distant streetlights.",
      mood: "lonely",
      visibility: "public",
    }),
  });
  const data1 = await res1.json();
  console.log("Status:", res1.status, JSON.stringify(data1, null, 2));

  console.log("\n2. Testing self-harm filter rejection:");
  const res2 = await fetch("http://localhost:5000/api/whispers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: "I want to kill myself tonight.",
      mood: "anxious",
      visibility: "public",
    }),
  });
  const data2 = await res2.json();
  console.log("Status:", res2.status, JSON.stringify(data2, null, 2));

  console.log("\n3. Testing GET feed after whisper created:");
  const res3 = await fetch("http://localhost:5000/api/whispers/feed");
  const data3 = await res3.json();
  console.log("Feed count:", data3.count, "Items:", JSON.stringify(data3.items, null, 2));

  console.log("\n4. Testing POST resonance queue:");
  const res4 = await fetch("http://localhost:5000/api/resonance/queue", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mood: "lonely" }),
  });
  const data4 = await res4.json();
  console.log("Resonance queue response:", JSON.stringify(data4, null, 2));
}

test()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

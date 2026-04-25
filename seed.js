/**
 * Seed Script for Nocturne Application
 * Populates the database with sample data for testing
 */

const API_BASE = 'http://localhost:5000/api/v1';

// Sample data for each feature
const sampleWhispers = [
    "Sometimes I wonder if anyone else feels lost at 3 AM, scrolling through their thoughts like old photographs.",
    "The hardest part about being an adult is pretending you have it all figured out when you're just winging it every day.",
    "I miss the version of myself that believed everything would work out. Now I just hope it does.",
    "Why do we spend so much time worrying about what others think when they're too busy worrying about themselves?",
    "Late night thoughts: What if our dreams are glimpses into parallel universes where we made different choices?",
    "The silence of night is the loudest conversation I have with myself.",
    "I wish I could tell my younger self that it's okay to not be perfect. Would have saved a lot of sleepless nights.",
    "Sometimes the bravest thing you can do is admit you're not okay."
];

const sampleMindMaze = [
    {
        type: "philosophy",
        content: "If you could know the exact date of your death, would you want to know?",
        options: ["Yes, I'd plan better", "No, it would paralyze me", "Maybe, depends on the date"]
    },
    {
        type: "puzzle",
        content: "You're in a room with 3 light switches. Each switch controls a different light bulb in another room. You can only enter the other room once. How do you figure out which switch controls which bulb?",
        options: ["Turn on 1st switch, wait, turn off. Turn on 2nd, go in", "Turn all on, then off one by one", "Random guess"]
    },
    {
        type: "philosophy",
        content: "Is it better to be loved or respected?",
        options: ["Loved - emotions matter most", "Respected - builds lasting impact", "Both are equally important"]
    },
    {
        type: "philosophy",
        content: "If you could erase one memory, would you? Which one and why?",
        options: null
    }
];

const sampleNightCircles = [
    {
        name: "Late Night Coders",
        description: "For developers burning the midnight oil, debugging life and code.",
        maxMembers: 8
    },
    {
        name: "Insomnia Support",
        description: "Can't sleep? Neither can we. Let's talk about it.",
        maxMembers: 12
    },
    {
        name: "Creative Minds",
        description: "Artists, writers, and dreamers share their 3 AM inspiration.",
        maxMembers: 10
    },
    {
        name: "Philosophy After Dark",
        description: "Deep questions for deeper nights. No topic too existential.",
        maxMembers: 6
    }
];

const sampleCafePosts = [
    {
        topic: "What's your biggest regret?",
        content: "I regret not pursuing my passion earlier. Spent 5 years in a job I hated because it was 'safe'. Now I'm starting over at 30.",
        category: "Life"
    },
    {
        topic: "Best productivity hack for night owls?",
        content: "I've tried every technique. Pomodoro, time blocking, you name it. What actually works for people who think clearest at midnight?",
        category: "Productivity"
    },
    {
        topic: "Favorite late-night snack?",
        content: "Judge me all you want, but cereal at 2 AM hits different. What's your go-to?",
        category: "Random"
    },
    {
        topic: "How do you deal with loneliness?",
        content: "Living alone in a new city. The days are fine but nights are tough. How do you cope?",
        category: "Mental Health"
    },
    {
        topic: "Book recommendations for insomniacs?",
        content: "Need something engaging but not too stimulating. What helps you through sleepless nights?",
        category: "Books"
    }
];

const sampleFounderPosts = [
    {
        content: "3 AM realization: I've been building what I think people want instead of solving a problem I actually understand. Back to the drawing board.",
        category: "Startup"
    },
    {
        content: "Rejected by 47 investors. Each 'no' stings less but validation would be nice. How do you stay motivated?",
        category: "Fundraising"
    },
    {
        content: "Just shipped a feature that took 3 months. 2 users noticed. This is harder than I thought.",
        category: "Product"
    },
    {
        content: "My co-founder quit today. We were supposed to change the world together. Now I'm alone with a half-built dream.",
        category: "Team"
    },
    {
        content: "Profitable for the first time. $327 in revenue. It's not much but it's honest work and it's MINE.",
        category: "Milestone"
    }
];

const sampleSpeakerRooms = [
    {
        roomName: "Midnight Tech Talk",
        description: "Discussing latest in AI, crypto, and web3",
        topic: "Technology",
        maxParticipants: 10
    },
    {
        roomName: "Creative Storytelling",
        description: "Share your stories, poems, or random thoughts",
        topic: "Arts",
        maxParticipants: 8
    },
    {
        roomName: "Language Exchange",
        description: "Practice speaking different languages with night owls worldwide",
        topic: "Languages",
        maxParticipants: 6
    }
];

async function seedDatabase() {
    console.log('🌙 Starting Nocturne database seeding...\n');

    try {
        // Seed Whispers
        console.log('📝 Seeding Whispers...');
        for (const content of sampleWhispers) {
            const response = await fetch(`${API_BASE}/whispers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });
            if (response.ok) {
                console.log(`  ✓ Created whisper: "${content.substring(0, 50)}..."`);
            }
        }

        // Seed Mind Maze
        console.log('\n🧩 Seeding Mind Maze questions...');
        for (const question of sampleMindMaze) {
            const response = await fetch(`${API_BASE}/mind-maze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(question)
            });
            if (response.ok) {
                console.log(`  ✓ Created question: "${question.content.substring(0, 50)}..."`);
            }
        }

        // Seed Night Circles
        console.log('\n⭕ Seeding Night Circles...');
        for (const circle of sampleNightCircles) {
            const response = await fetch(`${API_BASE}/circles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(circle)
            });
            if (response.ok) {
                console.log(`  ✓ Created circle: "${circle.name}"`);
            }
        }

        // Seed Midnight Cafe
        console.log('\n☕ Seeding Midnight Cafe posts...');
        for (const post of sampleCafePosts) {
            const response = await fetch(`${API_BASE}/cafe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(post)
            });
            if (response.ok) {
                console.log(`  ✓ Created post: "${post.topic}"`);
            }
        }

        // Seed 3AM Founder
        console.log('\n💡 Seeding 3AM Founder posts...');
        for (const post of sampleFounderPosts) {
            const response = await fetch(`${API_BASE}/founder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(post)
            });
            if (response.ok) {
                console.log(`  ✓ Created founder post: "${post.content.substring(0, 50)}..."`);
            }
        }

        // Seed Starlit Speaker
        console.log('\n🎤 Seeding Starlit Speaker rooms...');
        for (const room of sampleSpeakerRooms) {
            const response = await fetch(`${API_BASE}/speaker`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(room)
            });
            if (response.ok) {
                console.log(`  ✓ Created room: "${room.roomName}"`);
            }
        }

        console.log('\n✅ Database seeding completed successfully!');
        console.log('\n🚀 Your Nocturne app is now populated with test data.');
        console.log('👉 Visit http://localhost:5000 to see your app in action!\n');

    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        process.exit(1);
    }
}

// Run the seed function
seedDatabase();

/* =========================================================
   NOCTURNE — FRONT-END DEMO APPLICATION

   This is intentionally backend-free.

   Simulated services:
   1. Whisper
   2. Whisper Privacy
   3. Resonance Engine
   4. AI Whisper Analysis
   5. People Resonance
   6. Automatic Room Creation
   7. Resonance Rooms
   8. Matchmaking
   9. Resonance Map
   10. Topic Discovery
   11. Room Chat
   12. Room Presence
   13. People in Room
   14. Profiles
   15. Vibe Tags
   16. Recent Whispers
   17. Room Creation
   18. Vibe Selection
   19. Voice Chat
   20. Notifications
   21. Room Recommendations
   22. Night Tools
   23. Room Discovery
   24. Anonymous Social Layer
========================================================= */


/* =========================================================
   STATE
========================================================= */

const API_BASE = "http://localhost:5000/api/v1";
const TEST_AUTHOR_ID = 1;

const state = {
    currentView: "home",
    whisperMode: "private",
    currentRoom: null,
    voiceEnabled: false,
    selectedVibe: "Deep",
    whisper: "",
    rooms: [],
    people: [],
    recentWhispers: [],
    trendingTopics: []
};

async function fetchInitialData() {
    render(); // force initial render so the UI isn't blank
    try {
        const [roomsRes, thoughtsRes, trendingRes] = await Promise.all([
            fetch(`${API_BASE}/circles`),
            fetch(`${API_BASE}/thoughts`),
            fetch(`${API_BASE}/thoughts/trending`)
        ]);
        
        if (roomsRes.ok) {
            const result = await roomsRes.json();
            const data = result.data || result; // handle both array and {data: []}
            let roomData = Array.isArray(data) ? data : [];
            if (roomData.length === 0) {
                roomData = [
                    { id: 1, name: "The Quiet Room", currentMembers: 12, category: "Chill" },
                    { id: 2, name: "Midnight Confessions", currentMembers: 45, category: "Deep" }
                ];
            }
            state.rooms = roomData.map(r => ({
                id: r.id,
                name: r.name,
                description: r.description || "A quiet space.",
                people: r.currentMembers || 1,
                vibe: r.category || "Chill",
                icon: "☾"
            }));
        }
        
        if (thoughtsRes.ok) {
            const data = await thoughtsRes.json();
            let thoughtsData = Array.isArray(data) ? data : [];
            if (thoughtsData.length === 0) {
                thoughtsData = [
                    { id: 1, content: "I feel like I'm falling behind in life.", mood: "Anxious" },
                    { id: 2, content: "Is anyone else awake right now just overthinking?", mood: "Reflective" }
                ];
            }
            state.recentWhispers = thoughtsData.map(t => ({
                id: t.id,
                text: t.content,
                vibe: t.mood || "Neutral"
            }));
        }
        
        if (trendingRes.ok) {
            state.trendingTopics = await trendingRes.json();
        }
        
        render();
    } catch (e) {
        console.error("Failed to fetch initial data:", e);
    }
}


/* =========================================================
   DOM
========================================================= */

const viewContainer =
    document.getElementById("viewContainer");

const notificationPanel =
    document.getElementById("notificationPanel");

const whisperModes =
    ["private", "community", "resonance"];


/* =========================================================
   VIEW ROUTER
========================================================= */

function navigate(view) {

    state.currentView = view;

    render();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   RENDER
========================================================= */

function render() {

    updateNavigation();

    switch (state.currentView) {

        case "home":
            renderHome();
            break;

        case "whispers":
            renderWhispers();
            break;

        case "resonance":
            renderResonance();
            break;

        case "match":
            renderMatchmaking();
            break;

        case "map":
            renderResonanceMap();
            break;

        case "rooms":
            renderRooms();
            break;

        case "room":
            renderRoom();
            break;

        case "topics":
            renderTopics();
            break;

        case "profile":
            renderProfile();
            break;

        case "night-tools":
            renderNightTools();
            break;

        case "create-room":
            renderCreateRoom();
            break;

        default:
            renderHome();

    }

}


/* =========================================================
   NAVIGATION STATE
========================================================= */

function updateNavigation() {

    document
        .querySelectorAll("[data-view]")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.view === state.currentView
            );

        });

}


/* =========================================================
   HOME
========================================================= */

function renderHome() {

    viewContainer.innerHTML = `

    <section class="home-hero">

      <div class="home-copy">

        <span class="time-label">
          01:48 AM · NIGHT MODE
        </span>

        <h1>
          What's on your
          <span>mind tonight?</span>
        </h1>

        <p>
          Some of the best conversations happen
          after midnight. Say something you would
          not normally say during the day.
        </p>

      </div>


      ${whisperComposer()}

    </section>


    <section class="quick-grid">

      <button
        class="quick-service"
        data-service="rooms"
      >
        <span class="service-icon">◌</span>
        <strong>Join a Room</strong>
        <small>Find people who are awake</small>
      </button>


      <button
        class="quick-service"
        data-service="resonance"
      >
        <span class="service-icon">◎</span>
        <strong>Find Resonance</strong>
        <small>Discover similar minds</small>
      </button>


      <button
        class="quick-service"
        data-service="topics"
      >
        <span class="service-icon">✦</span>
        <strong>Explore Topics</strong>
        <small>See what's alive tonight</small>
      </button>


      <button
        class="quick-service"
        data-service="night-tools"
      >
        <span class="service-icon">✧</span>
        <strong>Night Tools</strong>
        <small>Utilities for late hours</small>
      </button>

    </section>


    <section>

      <div class="section-title">

        <div>
          <span class="section-label">LIVE NOW</span>
          <h2>Rooms alive tonight</h2>
        </div>

        <button
          class="text-button"
          data-service="rooms"
        >
          See all →
        </button>

      </div>


      <div class="room-grid">

        ${state.rooms
            .slice(0, 3)
            .map((room, index) => roomCard(room, index))
            .join("")}

      </div>

    </section>


    <section class="glass" style="
      margin-top:70px;
      padding:35px;
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:30px;
      align-items:center;
    ">

      <div>

        <span class="section-label">
          THE NOCTURNE LOOP
        </span>

        <h2 style="
          font-size:32px;
          line-height:1.05;
          margin:10px 0;
        ">
          Whisper.
          <em style="
            color:var(--purple-light);
            font-family:'Cormorant Garamond';
          ">
            Resonance.
          </em>
          Connection.
        </h2>

        <p class="muted">
          Your thoughts create the social graph.
          No endless swiping required.
        </p>

      </div>


      <div style="
        text-align:center;
        color:var(--purple-light);
        font-size:13px;
        line-height:3;
      ">

        <div>WHISPER</div>
        <div>↓</div>
        <div>RESONANCE</div>
        <div>↓</div>
        <div>ROOM</div>
        <div>↓</div>
        <div>CONNECTION</div>

      </div>

    </section>

  `;

    bindHomeEvents();

}


/* =========================================================
   WHISPER COMPOSER
========================================================= */

function whisperComposer() {

    return `

    <div class="whisper-composer">

      <div class="composer-top">

        <span>☾ NIGHT WHISPER</span>

        <span>
          <span id="charCount">0</span>/300
        </span>

      </div>


      <textarea
        id="homeWhisper"
        maxlength="300"
        placeholder="Write something you wouldn't say during the day..."
      ></textarea>


      <div class="privacy-list">

        ${privacyChoice(
        "private",
        "◉",
        "Only me",
        "Keep it completely private"
    )}

        ${privacyChoice(
        "community",
        "◌",
        "Night community",
        "Share anonymously with everyone"
    )}

        ${privacyChoice(
        "resonance",
        "✦",
        "Find my resonance",
        "Let Nocturne find similar minds"
    )}

      </div>


      <button
        class="primary-button"
        id="submitWhisper"
      >
        Whisper →
      </button>


      <div class="anonymous-note">
        ◌ Your real identity is never required to participate.
      </div>

    </div>

  `;

}


function privacyChoice(
    mode,
    icon,
    title,
    description
) {

    return `

    <button
      class="privacy-choice ${state.whisperMode === mode ? "active" : ""
        }"
      data-mode="${mode}"
    >

      <span class="choice-icon">
        ${icon}
      </span>

      <div>

        <strong>${title}</strong>

        <small>${description}</small>

      </div>

    </button>

  `;

}


/* =========================================================
   HOME EVENTS
========================================================= */

function bindHomeEvents() {

    const textarea =
        document.getElementById("homeWhisper");


    if (textarea) {

        textarea.addEventListener(
            "input",
            () => {

                state.whisper =
                    textarea.value;

                document.getElementById(
                    "charCount"
                ).textContent =
                    textarea.value.length;

            }
        );

    }


    document
        .querySelectorAll(".privacy-choice")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    state.whisperMode =
                        button.dataset.mode;

                    renderHome();

                }
            );

        });


    const submit =
        document.getElementById(
            "submitWhisper"
        );


    if (submit) {

        submit.addEventListener(
            "click",
            submitWhisper
        );

    }


    document
        .querySelectorAll("[data-service]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const service =
                        button.dataset.service;

                    if (service === "rooms") {
                        navigate("rooms");
                    }

                    if (service === "resonance") {
                        navigate("resonance");
                    }

                    if (service === "topics") {
                        navigate("topics");
                    }

                    if (service === "night-tools") {
                        navigate("night-tools");
                    }

                }
            );

        });


    document
        .querySelectorAll(".join-room")
        .forEach(button => button.addEventListener("click", () => joinRoomById(Number(button.dataset.room))));

}


/* =========================================================
   JOIN ROOM (shared handler — wired to backend API)
========================================================= */

async function joinRoomById(roomId) {
    state.currentRoom = roomId;

    try {
        const res = await fetch(`${API_BASE}/circles/${roomId}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode: 'listener' })
        });
        if (res.status === 409) {
            showToast("This room is full.");
            return;
        }
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            console.warn("Join circle failed:", err);
            // Don't block navigation
        }
    } catch (e) {
        console.warn("join-room network error:", e);
        // Don't block navigation — let user see room view anyway
    }

    navigate("room");
}


/* =========================================================
   WHISPER SUBMISSION
========================================================= */

async function submitWhisper() {
    const input = document.getElementById("homeWhisper");
    const submitBtn = document.getElementById("submitWhisper");
    const text = input ? input.value.trim() : "";

    if (!text) {
        showToast("Write something first.");
        return;
    }

    state.whisper = text;
    const isPrivate = state.whisperMode === "private";

    // Show loading state
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Listening to the void...";
    }

    try {
        const res = await fetch(`${API_BASE}/thoughts`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: text,
                thoughtType: 'whisper',
                isPrivate: isPrivate,
                mood: state.selectedVibe || null,
            })
        });

        const result = await res.json();

        if (!res.ok) {
            const errMsg = result?.error || result?.message || "Error saving whisper.";
            showToast(errMsg);
            return;
        }
        
        if (state.whisperMode === "private") {
            showToast("Whisper saved privately.");
        } else if (state.whisperMode === "community") {
            showToast("Your anonymous Whisper is now live.");
        }

        if (result.serendipityMatch) {
            state.lastMatch = result.serendipityMatch;
            state.lastAnalysis = result.aiAnalysis;
            navigate("match");
        } else if (state.whisperMode === "resonance") {
             showToast("Looking for resonance... none yet.");
        }

        fetchInitialData();
        if (input) input.value = "";
    } catch (e) {
        console.error("submitWhisper error:", e);
        showToast("Network error — could not save whisper.");
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Whisper →";
        }
    }
}


/* =========================================================
   WHISPERS VIEW
========================================================= */

function renderWhispers() {

    viewContainer.innerHTML = `

    <div class="page-header">

      <span class="section-label">
        NIGHT COMMUNITY
      </span>

      <h1>
        The things people
        <em>don't say aloud.</em>
      </h1>

      <p>
        Anonymous thoughts from people awake right now.
        Some are public. Some are looking for resonance.
      </p>

    </div>


    <div class="glass" style="
      padding:22px;
      margin-bottom:20px;
    ">

      ${whisperComposer()}

    </div>


    <div class="section-title">

      <h2>Recent Whispers</h2>

      <span class="muted">
        2,841 active tonight
      </span>

    </div>


    <div class="whisper-history">

      ${recentWhispers()}

    </div>

  `;


    const textarea =
        document.getElementById("homeWhisper");


    textarea.addEventListener(
        "input",
        () => {

            state.whisper =
                textarea.value;

            document.getElementById(
                "charCount"
            ).textContent =
                textarea.value.length;

        }
    );


    document
        .querySelectorAll(".privacy-choice")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    state.whisperMode =
                        button.dataset.mode;

                    renderWhispers();

                }
            );

        });


    document
        .getElementById("submitWhisper")
        .addEventListener(
            "click",
            submitWhisper
        );

}


function recentWhispers() {
    if (!state.recentWhispers || state.recentWhispers.length === 0) {
        return `<div class="muted" style="text-align: center; padding: 20px;">No active whispers right now.</div>`;
    }

    return state.recentWhispers.map(w => `
    <div class="glass history-item" style="display:flex; justify-content:space-between; align-items:center;">
      <div>
        <p>"${w.text}"</p>
        <small>Just now</small>
      </div>
      <span class="tag">${w.vibe || "Neutral"}</span>
    </div>
    `).join("");
}


/* =========================================================
   RESONANCE / AI WHISPER ANALYSIS
========================================================= */

function renderResonance() {

    const text =
        state.whisper ||
        "I keep wondering whether I'm wasting my twenties...";


    viewContainer.innerHTML = `

    <div class="page-header">

      <span class="section-label">
        RESONANCE ENGINE
      </span>

      <h1>
        Finding your
        <em>resonance.</em>
      </h1>

      <p>
        Nocturne interprets your Whisper and looks
        for people, rooms and topics with similar
        meaning and vibe.
      </p>

    </div>


    <div class="resonance-layout">


      <!-- AI ANALYSIS -->

      <div class="glass resonance-panel">

        <div class="analysis-title">

          <span class="section-label">
            AI WHISPER ANALYSIS
          </span>

          <h2>
            Understanding your thought
          </h2>

          <p>
            This is a simulated analysis.
            A production version could use embeddings,
            topic classification and semantic similarity.
          </p>

        </div>


        <div class="analysis-orb">

          <div class="orbit one"></div>
          <div class="orbit two"></div>

          <div class="analysis-node a">
            Uncertainty
          </div>

          <div class="analysis-node b">
            Identity
          </div>

          <div class="analysis-node c">
            Growth
          </div>

          <div class="analysis-node d">
            Comparison
          </div>

          <div class="analysis-node e">
            Life direction
          </div>

          <div class="core">
            YOU
          </div>

        </div>


        <div class="analysis-rows">

          ${analysisRow(
        "Topic",
        "Life direction"
    )}

          ${analysisRow(
        "Emotion",
        "Uncertainty"
    )}

          ${analysisRow(
        "Intent",
        "Conversation"
    )}

          ${analysisRow(
        "Vibe",
        "Reflective · Late night"
    )}

          ${analysisRow(
        "Semantic signal",
        "Existential / personal growth"
    )}

        </div>

      </div>


      <!-- RESONANCE RESULT -->

      <div class="glass resonance-panel">

        <div class="analysis-title">

          <span class="section-label">
            RESONANCE DETECTED
          </span>

          <h2>
            You're not alone in this thought.
          </h2>

          <p>
            Similar thoughts are active across
            Nocturne right now.
          </p>

        </div>


        <div class="resonance-result">

          <strong>
            ✦ 12 people resonate with this Whisper
          </strong>

          <p>
            7 are currently online and 3 are already
            talking in related rooms.
          </p>

        </div>


        <div style="
          display:flex;
          gap:8px;
          margin:18px 0;
        ">

          <span class="tag">Life direction</span>
          <span class="tag">Uncertainty</span>
          <span class="tag">Growth</span>

        </div>


        <div class="glass" style="
          padding:17px;
          margin-bottom:10px;
        ">

          <div style="
            display:flex;
            gap:8px;
            align-items:center;
            margin-bottom:10px;
          ">

            <div class="match-avatars">

              <span> L </span>
              <span> A </span>
              <span> M </span>
              <span> K </span>

            </div>

          </div>

          <strong style="
            font-size:11px;
          ">
            People thinking along a similar wavelength
          </strong>

          <p class="muted" style="
            margin-top:5px;
          ">
            You can connect anonymously first.
          </p>

        </div>


        <button
          class="primary-button"
          id="findMatches"
          style="width:100%;margin-top:8px;"
        >
          Find My Matches →
        </button>


        <button
          class="secondary-button"
          id="openMap"
          style="width:100%;margin-top:8px;"
        >
          Open Resonance Map
        </button>

      </div>

    </div>

  `;


    document
        .getElementById("findMatches")
        .addEventListener(
            "click",
            () => navigate("match")
        );


    document
        .getElementById("openMap")
        .addEventListener(
            "click",
            () => navigate("map")
        );

}


function analysisRow(label, value) {

    return `

    <div class="analysis-row">

      <label>${label}</label>

      <strong>${value}</strong>

    </div>

  `;

}


/* =========================================================
   MATCHMAKING
========================================================= */

function renderMatchmaking() {

    const match = state.lastMatch;
    const analysis = state.lastAnalysis;

    if (!match) {
        navigate("home");
        return;
    }

    const isRoomCreated = match.type === 'create';
    const title = isRoomCreated ? "Night Circle formed." : "You're not alone in this thought.";
    const desc = isRoomCreated ? "Enough people resonated that a space was created for you." : "Similar thoughts are active across Nocturne right now.";
    const statText = isRoomCreated 
        ? `✦ A room was created with ${match.matchedUsersCount} others.` 
        : `✦ ${match.matchedCount} people resonate with this Whisper`;
    
    const tags = analysis && analysis.themes ? analysis.themes.slice(0, 3) : ["Reflective"];

    viewContainer.innerHTML = `

    <div class="page-header" style="text-align:center;">
      <div class="resonance-animation">
        <div class="pulse-ring"></div>
        <div class="pulse-ring" style="animation-delay: 1s;"></div>
        <div class="pulse-ring" style="animation-delay: 2s;"></div>
      </div>
    </div>

    <div style="max-width:400px; margin: 0 auto;">
      <div class="glass resonance-panel">
        <div class="analysis-title">
          <span class="section-label">RESONANCE DETECTED</span>
          <h2>${title}</h2>
          <p>${desc}</p>
        </div>

        <div class="resonance-result">
          <strong>${statText}</strong>
          <p>${match.message || ''}</p>
        </div>

        <div style="display:flex; gap:8px; margin:18px 0;">
          ${tags.map(t => `<span class="tag">${t}</span>`).join("")}
        </div>

        <div class="glass" style="padding:17px; margin-bottom:10px;">
          <strong style="font-size:11px;">People thinking along a similar wavelength</strong>
          <p class="muted" style="margin-top:5px;">You can connect anonymously first.</p>
        </div>

        ${isRoomCreated ? `
        <button class="primary-button" id="joinCreatedRoom" data-room="${match.circleId}" style="width:100%;margin-top:8px;">
          Enter Night Circle →
        </button>
        ` : `
        <button class="primary-button" id="returnHomeBtn" style="width:100%;margin-top:8px;">
          Return to Feed
        </button>
        `}
      </div>
    </div>
  `;

    const joinBtn = document.getElementById("joinCreatedRoom");
    if (joinBtn) {
        joinBtn.addEventListener("click", () => {
            state.currentRoom = Number(joinBtn.dataset.room);
            navigate("room");
        });
    }

    const homeBtn = document.getElementById("returnHomeBtn");
    if (homeBtn) {
        homeBtn.addEventListener("click", () => {
            navigate("home");
        });
    }
}


function matchSignal(label, value) {

    return `

    <div style="margin-bottom:14px;">

      <div style="
        display:flex;
        justify-content:space-between;
        margin-bottom:5px;
      ">

        <span class="muted">${label}</span>

        <strong style="
          font-size:9px;
          color:var(--purple-light);
        ">
          ${value}
        </strong>

      </div>

      <div style="
        height:4px;
        background:#181722;
        border-radius:20px;
        overflow:hidden;
      ">

        <div style="
          width:${value};
          height:100%;
          background:linear-gradient(90deg,#7152ee,#b17aff);
        "></div>

      </div>

    </div>

  `;

}


function personCard(person) {

    return `

    <div class="room-list-item">

      <div class="person-avatar">
        ${person.letter}
      </div>

      <div class="room-list-content">

        <h3>${person.name}</h3>

        <p>${person.status}</p>

      </div>

      <span class="tag">
        ${person.vibe}
      </span>

      <button
        class="follow"
        data-follow="${person.name}"
      >
        Resonates
      </button>

    </div>

  `;

}


/* =========================================================
   RESONANCE MAP
========================================================= */

function renderResonanceMap() {

    viewContainer.innerHTML = `

    <div class="page-header">

      <span class="section-label">
        RESONANCE MAP
      </span>

      <h1>
        Your thought has
        <em>many directions.</em>
      </h1>

      <p>
        A visual representation of the topics,
        moods and communities connected to your Whisper.
      </p>

    </div>


    <div class="glass map-card">

      <div class="map">

        <div class="map-ring r2"></div>
        <div class="map-ring r1"></div>


        <div class="map-you">
          YOU
        </div>


        ${mapNode(
        "n1",
        "Overthinking",
        "1.2K"
    )}

        ${mapNode(
        "n2",
        "Career",
        "766"
    )}

        ${mapNode(
        "n3",
        "Identity",
        "980"
    )}

        ${mapNode(
        "n4",
        "Loneliness",
        "1.1K"
    )}

        ${mapNode(
        "n5",
        "Life purpose",
        "912"
    )}

      </div>


      <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        border-top:1px solid rgba(255,255,255,.05);
        padding-top:17px;
      ">

        <div>

          <strong style="font-size:11px;">
            7 active rooms
          </strong>

          <p class="muted">
            connected to this resonance
          </p>

        </div>


        <button
          class="primary-button"
          id="mapRooms"
        >
          Explore Rooms →
        </button>

      </div>

    </div>

  `;


    document
        .getElementById("mapRooms")
        .addEventListener(
            "click",
            () => navigate("rooms")
        );

}


function mapNode(
    className,
    title,
    count
) {

    return `

    <div class="map-node ${className}">

      <strong>${title}</strong>

      <small>
        ${count} whispers
      </small>

    </div>

  `;

}


/* =========================================================
   ROOMS / DISCOVERY
========================================================= */

function renderRooms() {

    viewContainer.innerHTML = `

    <div class="page-header">

      <span class="section-label">
        ROOM DISCOVERY
      </span>

      <h1>
        Find somewhere to
        <em>belong tonight.</em>
      </h1>

      <p>
        Browse rooms created from shared thoughts,
        vibes and resonances—or create your own.
      </p>

    </div>


    <div style="
      display:flex;
      gap:8px;
      margin-bottom:25px;
      flex-wrap:wrap;
    ">

      <button class="secondary-button room-filter active">
        All
      </button>

      <button class="secondary-button room-filter">
        Deep
      </button>

      <button class="secondary-button room-filter">
        Music
      </button>

      <button class="secondary-button room-filter">
        Support
      </button>

      <button class="secondary-button room-filter">
        Creative
      </button>

      <button
        class="primary-button"
        id="createRoomButton"
        style="margin-left:auto;"
      >
        + Create Room
      </button>

    </div>


    <div class="room-list">

      ${state.rooms.map(room => `

        <div class="room-list-item">

          <div class="room-icon">
            ${room.icon}
          </div>

          <div class="room-list-content">

            <h3>
              ${room.name}
            </h3>

            <p>
              ${room.description}
            </p>

          </div>

          <span class="tag">
            ${room.vibe}
          </span>

          <div class="room-list-meta">

            <span class="online">
              ● ${room.people} online
            </span>

            <button
              class="join-room"
              data-room="${room.id}"
            >
              Enter →
            </button>

          </div>

        </div>

      `).join("")}

    </div>


    <section class="glass" style="
      margin-top:35px;
      padding:20px;
    ">

      <span class="section-label">
        RECOMMENDED FOR YOU
      </span>

      <h3 style="
        font-size:14px;
        margin:7px 0 5px;
      ">
        Based on your current resonance
      </h3>

      <p class="muted">
        Quarter-Life Room · Overthinkers Anonymous ·
        Creative Insomniacs
      </p>

    </section>

  `;


    document
        .getElementById("createRoomButton")
        .addEventListener(
            "click",
            () => navigate("create-room")
        );


    document
        .querySelectorAll(".join-room")
        .forEach(button => button.addEventListener("click", () => joinRoomById(Number(button.dataset.room))));

}


/* =========================================================
   ROOM CHAT
========================================================= */

function renderRoom() {

    const room =
        state.rooms.find(
            r => r.id === state.currentRoom
        ) || state.rooms[3];


    state.currentRoom = room.id;


    viewContainer.innerHTML = `

    <div class="page-header">

      <button
        class="text-button"
        id="backRooms"
        style="margin-bottom:13px;"
      >
        ← Back to rooms
      </button>

      <span class="section-label">
        RESONANCE ROOM
      </span>

      <h1>
        ${room.name}
      </h1>

      <p>
        ${room.description}
      </p>

    </div>


    <div class="chat-layout">


      <!-- CHAT -->

      <div class="glass chat-panel">

        <div class="chat-header">

          <div class="chat-room-title">

            <h2>
              ${room.name}
            </h2>

            <p>
              ● ${room.people} people online
            </p>

          </div>


          <div class="chat-header-actions">

            <button
              class="small-action"
              id="voiceButton"
            >
              ♫ Voice
            </button>

            <button
              class="small-action"
              id="leaveRoom"
            >
              Leave
            </button>

          </div>

        </div>


        <div class="chat-messages" id="chatMessages">

          ${chatMessage(
        "L",
        "Luna",
        "I feel behind everyone. Sometimes it feels like I'm existing, not actually living.",
        "1:59 AM"
    )}

          ${chatMessage(
        "A",
        "Arjun",
        "Same. Social media makes it worse. Everyone looks like they figured it out.",
        "2:00 AM"
    )}

          ${chatMessage(
        "M",
        "Mira",
        "Maybe we're just on different timelines. Progress isn't linear.",
        "2:01 AM"
    )}

          ${chatMessage(
        "D",
        "You",
        "Maybe that is exactly what I needed to hear tonight.",
        "2:02 AM",
        true
    )}

        </div>


        <div class="chat-input">

          <input
            id="chatMessage"
            placeholder="Say something..."
          />

          <button id="sendChat">
            ↑
          </button>

        </div>

      </div>


      <!-- PEOPLE IN ROOM -->

      <div class="glass people-panel">

        <h3>
          People in room (${state.people.length + 1})
        </h3>

        ${state.people
            .map(person => `

            <div class="person">

              <div class="person-avatar">
                ${person.letter}
              </div>

              <div class="person-info">

                <strong>${person.name}</strong>

                <small>
                  ${person.status}
                </small>

              </div>

              <button
                class="follow"
                data-follow="${person.name}"
              >
                Follow
              </button>

            </div>

          `)
            .join("")}


        <div class="person">

          <div class="person-avatar">
            D
          </div>

          <div class="person-info">

            <strong>You</strong>

            <small>
              anonymous · host
            </small>

          </div>

          <span class="tag">
            HOST
          </span>

        </div>

      </div>

    </div>

  `;


    document
        .getElementById("backRooms")
        .addEventListener(
            "click",
            () => navigate("rooms")
        );


    document
        .getElementById("leaveRoom")
        .addEventListener(
            "click",
            () => {

                showToast(
                    "You left the room."
                );

                navigate("rooms");

            }
        );


    document
        .getElementById("voiceButton")
        .addEventListener(
            "click",
            toggleVoice
        );


    document
        .getElementById("sendChat")
        .addEventListener(
            "click",
            sendChat
        );


    document
        .getElementById("chatMessage")
        .addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {

                    sendChat();

                }

            }
        );


    bindFollowButtons();

}


function chatMessage(
    letter,
    name,
    text,
    time,
    mine = false
) {

    return `

    <div class="chat-message ${mine ? "mine" : ""
        }">

      <div class="chat-avatar">
        ${letter}
      </div>

      <div>

        <small>
          ${name} · ${time}
        </small>

        <p>
          ${escapeHTML(text)}
        </p>

      </div>

    </div>

  `;

}


function sendChat() {

    const input =
        document.getElementById(
            "chatMessage"
        );


    const text =
        input.value.trim();


    if (!text) return;


    const messages =
        document.getElementById(
            "chatMessages"
        );


    messages.insertAdjacentHTML(
        "beforeend",
        chatMessage(
            "D",
            "You",
            text,
            "just now",
            true
        )
    );


    input.value = "";

    messages.scrollTop =
        messages.scrollHeight;

}


function toggleVoice() {

    state.voiceEnabled =
        !state.voiceEnabled;


    const button =
        document.getElementById(
            "voiceButton"
        );


    if (state.voiceEnabled) {

        button.textContent =
            "♫ Voice ON";

        button.style.color =
            "var(--green)";

        showToast(
            "Voice chat enabled — demo mode."
        );

    }

    else {

        button.textContent =
            "♫ Voice";

        button.style.color =
            "";

        showToast(
            "Voice chat disabled."
        );

    }

}


/* =========================================================
   TOPIC DISCOVERY
========================================================= */

function renderTopics() {
    
    // Map backend trending topics if available
    let topics = [];
    if (state.trendingTopics && state.trendingTopics.length > 0) {
        topics = state.trendingTopics.map(t => ["✦", t.topic, t.count.toString()]);
    } else {
        topics = [
            ["☾", "Overthinking", "1.2K"],
            ["♫", "Music", "842"],
            ["♡", "Loneliness", "1.1K"],
            ["✦", "Life Purpose", "912"],
            ["○", "Relationships", "980"],
            ["◌", "Career", "766"],
            ["◎", "Mental Health", "1.3K"],
            ["✧", "Creativity", "689"],
            ["⌁", "Technology", "534"],
            ["♧", "Friendship", "721"],
            ["◈", "Dreams", "445"],
            ["☽", "Late Night Life", "1.7K"]
        ];
    }


    viewContainer.innerHTML = `

    <div class="page-header">

      <span class="section-label">
        TOPIC DISCOVERY
      </span>

      <h1>
        What's alive
        <em>tonight?</em>
      </h1>

      <p>
        Explore the subjects people are whispering about
        across the Nocturne community.
      </p>

    </div>


    <div class="topic-grid">

      ${topics.map(topic => `

        <div
          class="topic-card"
          data-topic="${topic[1]}"
        >

          <span class="topic-icon">
            ${topic[0]}
          </span>

          <h3>
            ${topic[1]}
          </h3>

          <p>
            people are talking about this tonight
          </p>

          <span class="topic-count">
            ${topic[2]} whispers
          </span>

        </div>

      `).join("")}

    </div>

  `;


    document
        .querySelectorAll(".topic-card")
        .forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    showToast(
                        `${card.dataset.topic} resonance selected.`
                    );

                    navigate("rooms");

                }
            );

        });

}


/* =========================================================
   PROFILE
========================================================= */

function renderProfile() {

    viewContainer.innerHTML = `

    <div class="page-header">

      <span class="section-label">
        MY SPACE
      </span>

      <h1>
        A profile made of
        <em>thoughts.</em>
      </h1>

    </div>


    <div class="profile-layout">


      <div class="glass profile-card">

        <div class="profile-avatar-large">
          D
        </div>

        <h2>
          Dev ☾
        </h2>

        <div class="handle">
          @dev.nocturne
        </div>


        <p class="profile-bio">
          Usually awake late, building things
          and overthinking a little too much.
        </p>


        <div class="tag-list"
          style="justify-content:center;"
        >

          <span class="tag">Night walks</span>
          <span class="tag">Tech</span>
          <span class="tag">Music</span>
          <span class="tag">Existential thoughts</span>
          <span class="tag">+ Add</span>

        </div>


        <div class="profile-stats">

          <div class="profile-stat">
            <strong>23</strong>
            <small>Whispers</small>
          </div>

          <div class="profile-stat">
            <strong>12</strong>
            <small>Rooms</small>
          </div>

          <div class="profile-stat">
            <strong>148</strong>
            <small>Resonances</small>
          </div>

        </div>

      </div>


      <div class="profile-content">


        <div class="glass profile-section">

          <h3>
            Vibe Tags
          </h3>

          <div class="tag-list">

            <span class="tag">Music</span>
            <span class="tag">Technology</span>
            <span class="tag">Night walks</span>
            <span class="tag">Deep conversations</span>
            <span class="tag">Creative</span>
            <span class="tag">Overthinking</span>
            <span class="tag">+ Add vibe</span>

          </div>

        </div>


        <div class="glass profile-section">

          <div class="section-title">

            <h3>
              Recent Whispers
            </h3>

            <button
              class="text-button"
              data-view="whispers"
            >
              See all
            </button>

          </div>


          <div class="whisper-history">

            <div class="history-item">

              <p>
                "Some nights I just want to disappear
                from the noise."
              </p>

              <small>
                2 days ago · 14 resonances
              </small>

            </div>


            <div class="history-item">

              <p>
                "Building something nobody understands yet."
              </p>

              <small>
                5 days ago · 9 resonances
              </small>

            </div>


            <div class="history-item">

              <p>
                "Maybe everyone is secretly figuring
                things out as they go."
              </p>

              <small>
                8 days ago · 21 resonances
              </small>

            </div>

          </div>

        </div>

      </div>

    </div>

  `;


    document
        .querySelectorAll("[data-view]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => navigate(button.dataset.view)
            );

        });

}


/* =========================================================
   NIGHT TOOLS
========================================================= */

function renderNightTools() {

    viewContainer.innerHTML = `

    <div class="page-header">

      <span class="section-label">
        NIGHT TOOLS
      </span>

      <h1>
        Things for the
        <em>late hours.</em>
      </h1>

      <p>
        A quiet toolbox for the hours when most
        of the world is asleep.
      </p>

    </div>


    <div class="tools-grid">


      ${toolCard(
        "☾",
        "Night Journal",
        "A private space to unload whatever is on your mind.",
        "Open Journal"
    )}


      ${toolCard(
        "♫",
        "Midnight Radio",
        "Ambient music and listening rooms for people awake right now.",
        "Listen"
    )}


      ${toolCard(
        "✧",
        "Focus Mode",
        "A distraction-free environment for late-night work.",
        "Start Focus"
    )}


      ${toolCard(
        "◎",
        "Thought Randomizer",
        "Get a strange question to think about or discuss.",
        "Give me one"
    )}


      ${toolCard(
        "◌",
        "Sleep Sounds",
        "Ambient soundscapes for slowing down the night.",
        "Play Sounds"
    )}


      ${toolCard(
        "♧",
        "Night Circle",
        "Drop into a spontaneous social space with other night owls.",
        "Enter Circle"
    )}

    </div>

  `;


    document
        .querySelectorAll(".tool-card button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    showToast(
                        `${button.dataset.tool} — demo service activated.`
                    );

                }
            );

        });

}


function toolCard(
    icon,
    title,
    description,
    action
) {

    return `

    <div class="tool-card">

      <div class="tool-icon">
        ${icon}
      </div>

      <h3>
        ${title}
      </h3>

      <p>
        ${description}
      </p>

      <button
        class="secondary-button"
        data-tool="${title}"
        style="margin-top:16px;"
      >
        ${action} →
      </button>

    </div>

  `;

}


/* =========================================================
   CREATE ROOM
========================================================= */

function renderCreateRoom() {

    viewContainer.innerHTML = `

    <div class="page-header">

      <span class="section-label">
        ROOM CREATION
      </span>

      <h1>
        Create a space for
        <em>your thought.</em>
      </h1>

      <p>
        Start a room manually around a thought,
        topic or vibe. People with similar Whispers
        can discover it.
      </p>

    </div>


    <div class="glass create-layout">


      <div class="form-group">

        <label>
          ROOM NAME
        </label>

        <input
          id="roomName"
          placeholder="e.g. Late Night Thinkers"
        />

      </div>


      <div class="form-group">

        <label>
          WHAT IS THIS ROOM ABOUT?
        </label>

        <textarea
          id="roomDescription"
          placeholder="A place for people who..."
        ></textarea>

      </div>


      <div class="form-group">

        <label>
          CHOOSE A VIBE
        </label>

        <div class="vibe-selection">

          ${[
            "Chill",
            "Deep",
            "Fun",
            "Support",
            "Music",
            "Study",
            "Creative",
            "Life"
        ]
            .map(vibe => `

              <button
                class="vibe-choice ${state.selectedVibe === vibe
                    ? "selected"
                    : ""
                }"
                data-vibe="${vibe}"
              >
                ${vibe}
              </button>

            `)
            .join("")}

        </div>

      </div>


      <div class="voice-setting">

        <div>

          <strong>
            Allow voice chat
          </strong>

          <small>
            Members can optionally join voice.
          </small>

        </div>

        <button
          class="toggle"
          id="voiceToggle"
        >

          <span></span>

        </button>

      </div>


      <div style="
        padding:13px;
        border-radius:11px;
        background:rgba(121,89,255,.05);
        border:1px solid rgba(121,89,255,.12);
        margin-bottom:18px;
      ">

        <span class="section-label">
          DISCOVERY
        </span>

        <p class="muted" style="
          margin-top:6px;
          line-height:1.6;
        ">
          People with similar Whispers and vibes
          will be able to discover this room.
        </p>

      </div>


      <button
        class="primary-button"
        id="createRoomSubmit"
        style="width:100%;"
      >
        Create Room →
      </button>

    </div>

  `;


    document
        .querySelectorAll(".vibe-choice")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    state.selectedVibe =
                        button.dataset.vibe;

                    document
                        .querySelectorAll(".vibe-choice")
                        .forEach(b =>
                            b.classList.remove("selected")
                        );

                    button.classList.add("selected");

                }
            );

        });


    document
        .getElementById("voiceToggle")
        .addEventListener(
            "click",
            event => {

                event.currentTarget
                    .classList.toggle("on");

            }
        );


    document
        .getElementById("createRoomSubmit")
        .addEventListener(
            "click",
            createRoom
        );

}


async function createRoom() {
    const name = document.getElementById("roomName").value.trim();
    const description = document.getElementById("roomDescription").value.trim();

    if (!name) {
        showToast("Give your room a name.");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/circles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                description: description || "A new Nocturne room created tonight.",
                topic: state.selectedVibe,
                category: state.selectedVibe,
                roomType: 'vibe',
                maxMembers: 10,
            })
        });

        const payload = await res.json();

        if (!res.ok) {
            const errMsg = payload?.error || payload?.message || "Failed to create room";
            showToast(errMsg);
            return;
        }

        // API returns { success: true, data: circle }
        const newRoomData = payload.data || payload;
        state.currentRoom = newRoomData.id;

        showToast("Room created. People with similar resonance can now discover it.");
        
        await fetchInitialData();
        setTimeout(() => navigate("room"), 700);

    } catch (e) {
        console.error("createRoom error:", e);
        showToast("Network error — could not create room.");
    }
}


/* =========================================================
   FOLLOW / PEOPLE RESONANCE
========================================================= */

function bindFollowButtons() {

    document
        .querySelectorAll("[data-follow]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const name =
                        button.dataset.follow;

                    button.textContent =
                        "Following";

                    showToast(
                        `You are now following ${name}.`
                    );

                }
            );

        });

}


/* =========================================================
   GLOBAL CLICK HANDLER
========================================================= */

document.addEventListener(
    "click",
    event => {

        const viewButton =
            event.target.closest(
                "[data-view]"
            );


        if (
            viewButton &&
            !viewButton.closest(
                "#viewContainer"
            )
        ) {

            navigate(
                viewButton.dataset.view
            );

        }

    }
);


/* =========================================================
   MOBILE CREATE
========================================================= */

document
    .getElementById("mobileCreate")
    .addEventListener(
        "click",
        () => navigate("whispers")
    );


/* =========================================================
   NOTIFICATIONS
========================================================= */

function openNotifications() {

    notificationPanel
        .classList.add("show");

}


function closeNotifications() {

    notificationPanel
        .classList.remove("show");

}


document
    .getElementById("notificationsButton")
    .addEventListener(
        "click",
        openNotifications
    );


document
    .getElementById("topNotification")
    .addEventListener(
        "click",
        openNotifications
    );


document
    .getElementById("closeNotifications")
    .addEventListener(
        "click",
        closeNotifications
    );


document.addEventListener(
    "click",
    event => {

        if (
            notificationPanel.classList.contains("show") &&
            !notificationPanel.contains(event.target) &&
            !event.target.closest("#topNotification") &&
            !event.target.closest("#notificationsButton")
        ) {

            closeNotifications();

        }

    }
);


/* =========================================================
   CLOCK
========================================================= */

function updateClock() {

    const now =
        new Date();

    let hours =
        now.getHours();

    const minutes =
        String(now.getMinutes())
            .padStart(2, "0");

    const ampm =
        hours >= 12 ? "PM" : "AM";

    hours =
        hours % 12 || 12;

    document.getElementById(
        "currentTime"
    ).textContent =
        `${String(hours).padStart(2, "0")}:${minutes}`;

    const am =
        document
            .querySelector(".time small");

    if (am) {

        am.textContent =
            ampm;

    }

}


updateClock();

setInterval(
    updateClock,
    30000
);


/* =========================================================
   TOAST
========================================================= */

let toastTimer;


function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* =========================================================
   SECURITY HELPER
========================================================= */

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        text;

    return div.innerHTML;

}

function roomCard(room, index) {
  const arts = ["", "two", "three"];
  const artClass = arts[index % 3];

  return `
    <div class="room-card">
      <div class="room-art ${artClass}">
        <span class="room-live">LIVE</span>
      </div>
      <div class="room-card-body">
        <h3>${escapeHTML(room.name)}</h3>
        <p>${escapeHTML(room.description)}</p>
        <div class="room-card-bottom">
          <span class="room-members">${room.people} members</span>
          <button class="join-room" data-room="${room.id}">Join</button>
        </div>
      </div>
    </div>
  `;
}


/* =========================================================
   INITIALIZE
========================================================= */

fetchInitialData();
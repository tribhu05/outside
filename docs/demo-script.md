# Outside — 2-Minute Demo Script for Judges

This walkthrough guides judges or evaluators through demonstrating **Outside** in under 3 minutes.

---

## Prerequisites
- Clone the repository.
- Run `npm install && npm run dev` (starts on `http://localhost:5173`).
- *(Optional)* Start Ollama in a separate terminal: `ollama run gemma2:2b`. If Ollama is not running, Outside will seamlessly demonstrate its instant deterministic heuristic engine without errors.

---

## Step 1: Arrival & Philosophy (0:00 - 0:30)
1. Open `http://localhost:5173`.
2. Point out the calm, earthy design:
   - Notice the tagline: *“Turn free time into time outside.”*
   - Notice the AI badge: indicates whether Google Gemma or the local heuristic engine is active.
   - Click the AI badge to show the **AI Engine & Privacy** modal. Point out that zero data leaves the machine and explain the separation between AI intent understanding and deterministic scheduling.

---

## Step 2: Natural-Language Input (0:30 - 1:00)
1. In the central input box, enter or click the example:
   > **“I have 90 minutes free this evening. I don't want to spend money and I want something relaxing.”**
   *(Or try: “I have one hour, I'm stressed, I don't want to spend money.”)*
2. *(Optional)* Select a preferred space from the dropdown (e.g., “Local Park”).
3. Press **Enter** or click **“Plan Outside Time”**.

---

## Step 3: Realistic Outdoor Plan (1:00 - 1:40)
1. Show the generated plan:
   - **Title & Tagline**: *“Gentle Outside Reset: Mindful Decompression Walk”*
   - **Intent Pills**: Shows extracted duration (90 min), energy level (low), budget (free), and social setting (solo).
   - **Clock-Based Timeline**: Dynamic schedule calculated from the current real-world clock time (e.g. *6:00 PM Leave home*, *6:05 PM Outbound walk*, *6:35 PM Mindful stroll*, *7:00 PM Sensory observation pause*, *7:15 PM Walk back*).
   - **“Challenge Me”**: Sensory micro-challenge (e.g., *5-Senses Grounding* or *Canopy Gaze*). Click **“Shuffle”** to showcase alternative challenges.
   - **Preparation Checklist**: Reminders to silence phone notifications and hydrate.

---

## Step 4: Screen Exit Mode (1:40 - 2:15)
1. Click the primary button: **“Start Outside Time 🌿”**.
2. Notice the instant transformation:
   - The UI strips away all web distractions, cards, and complex menus.
   - Shows only the **Active Phase Title**, **Remaining Time Countdown**, and **One Simple Action Instruction**.
   - Plays a calming Web Audio singing bowl bell.
   - Highlights the core message:
     > **“Put your phone away when you're ready. The real world doesn't live on this screen.”**
3. Click **Next** or adjust the phase if demonstrating the multi-stage progression.

---

## Step 5: Reflection & Outdoor Log (2:15 - 2:45)
1. Click **“I'm Back / Done Outside”**.
2. Shows the **“Welcome back 🌿”** completion modal:
   - Shows total minutes outside away from screens.
   - Asks: *“How do you feel now?”* Select **😊 Better** or **😌 Relaxing**.
   - Check off the outdoor challenge.
   - Add a brief note: *“Felt the evening breeze, heard autumn leaves rustling.”*
   - Click **“Save to Log”**.

---

## Step 6: Local History & Privacy (2:45 - 3:00)
1. Click the **History** icon in the header.
2. Show the **Outside Log**:
   - Total minutes spent outside.
   - Number of outings.
   - Mood reset rate (e.g., 100% felt better or relaxed).
   - Chronological session entry with before vs. after mood delta.
   - One-click **Export JSON** option.
3. Conclude: Outside used open-weight AI to understand the user's situation, but its ultimate achievement was getting the user off the screen and into the real world.

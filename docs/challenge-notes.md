# DEV Hacktoberfest 2026 Week 1 Challenge Notes: “Touch Grass”

## Overview

- **Project Name**: Outside
- **Tagline**: Turn free time into time outside.
- **Challenge Track**: DEV Hacktoberfest 2026 — Week 1: “Touch Grass”
- **Core Thesis**: *AI understands you. The app gets you outside.*

---

## 1. Fulfillment of the "Touch Grass" Challenge Theme

The fundamental irony of modern digital wellness apps is that they require endless screen engagement—reading articles, checking feeds, or engaging in multi-turn chatbot conversations. 

**Outside directly solves this contradiction:**
- **Anti-Screen Design**: The application's success condition is explicitly that the user *closes the browser* or puts their phone in their pocket.
- **Screen Exit Mode**: The core interaction culminates in a dedicated minimal mode that instructs the user: *“Put your phone away when you're ready. The real world doesn't live on this screen.”*
- **Sensory Reconnection**: Rather than passive screen time, Outside includes physical micro-challenges (5-senses grounding, identifying tree leaf shapes, acoustic horizon listening) that require physical sensory interaction with the natural environment.

---

## 2. Open-Weight AI Architecture (Google Gemma)

Outside champions open-weight, local-first artificial intelligence:

1. **Why Open-Weight AI Matters Here**:
   - Outdoor time is inherently personal and private. Users frequently share vulnerable personal context—feeling burnt out, overwhelmed, broke, or lonely. Sending this private context to centralized proprietary cloud APIs violates user trust.
   - Using **Google Gemma 2** locally via Ollama or LM Studio ensures complete data privacy: zero tokens or telemetry leave the user's computer.

2. **The Role of Gemma vs. Deterministic Planner**:
   - **Gemma's Responsibility**: Natural language comprehension. Gemma translates unstructured human speech into clean, typed intent (`durationMinutes`, `energyLevel`, `mood`, `budget`, `activityPreference`, `socialPreference`).
   - **Deterministic Engine's Responsibility**: Safe, grounded planning. Gemma does **not** hallucinate arbitrary schedules. A deterministic, tested algorithm creates the clock-based timeline, safety guidelines, and milestone offsets.

3. **Honest AI Fallback**:
   - When a local Gemma model is unavailable, Outside never fakes AI responses.
   - It gracefully falls back to an offline deterministic heuristic parser, displaying an honest badge (`Local Engine`).

---

## 3. Product Quality & Human-Centric Design

- **Restrained Aesthetics**: No neon gradients, no floating card gimmicks, and no chatbot avatars. The interface uses natural forest greens, warm stones, and serif typography designed to evoke calm.
- **Zero Account Friction**: No passwords, OAuth, or sign-up walls. Everything works instantaneously out of the box.
- **Local-Only Storage**: Session history and mood reflection metrics remain exclusively inside the browser's `localStorage`.

---

## 4. Verification & Testing

The project includes an automated test suite across all critical business logic:
- Natural language duration parsing (minutes, hours, fractions, number words)
- Budget detection (`free`, `$0`, `cheap`)
- Energy and mood classification
- Intent boundary validation and clamping
- Deterministic activity matching and clock timeline generation
- Automatic AI provider fallback behavior

Run tests:
```bash
npm test
```
Result: **5 test files passed, 32 unit tests passed.**

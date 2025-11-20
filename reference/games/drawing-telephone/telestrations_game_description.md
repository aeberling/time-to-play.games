# Telestrations — Full Game Description (Developer-Ready)

Telestrations is a simultaneous, round-based party game that blends drawing and guessing. Each player maintains a personal “sketchbook” that alternates between prompts, drawings, and guesses as it rotates among players. The goal is not to win but to enjoy the unpredictable transformations as ideas morph through the table.

## 1. Core Game Elements

### Players
- Ideal: 4–8 players, though digital versions can scale higher.
- Each player has:
  - A unique player ID and name.
  - A “sketchbook” (a list of pages representing each turn).

### Sketchbook
For each player:
- A sequence of pages that alternate between:
  1. Word/Phrase Entry (Prompt page)
  2. Drawing Page
  3. Guess Page
- The sketchbook is passed sequentially to other players after each turn.

### Deck of Prompts
- Each prompt is a word or phrase.
- Online version may include:
  - Random prompts
  - Difficulty levels
  - Custom prompts

### Round Structure
- One “round” means one full rotation of sketchbooks until each returns to its original owner.

### Timer
- Standard: ~60 seconds for drawing, ~30 for guessing.

## 2. Game Flow Overview
Each round consists of:
1. Prompt Assignment
2. Turn 1: Players write their starting prompt
3. Turn 2: Drawing based on the received prompt
4. Turn 3: Guessing the meaning of a received drawing
5. Continue alternating (draw → guess)
6. Final Reveal Phase

## 3. Step-by-Step Round Logic (Online Implementation Format)

### STEP 1 — Start of Round
Sketchbook initialization:
```
page[1]: {type: "prompt", author: player_i, text: prompt_word}
```

### STEP 2 — Turn 1 (Drawing Phase)
Each player receives another player’s prompt page and must draw it.
```
page[2]: {type: "drawing", artist: player_B, image_data: ...}
```

### STEP 3 — Turn 2 (Guessing Phase)
Each player receives a drawing and must guess what it is.
```
page[3]: {type: "guess", guesser: player_C, text: "..."}
```

### STEP 4 — Continuing Turns
Pages alternate:
- Odd: text (prompt/guess)
- Even: drawing
Until each sketchbook has contributions from all players.

### STEP 5 — Final Reveal (“Gallery” Phase)
- Pages shown in sequence
- Options for manual or auto-play reveal
- Reactions allowed

## 4. End of Round / Scoring (Optional)
Options:
- Favorite drawing / favorite guess
- Match final guess to original prompt
- Or no scoring (classic mode)

## 5. Digital Implementation Structure

### State Objects
```
Player { id, name, status }
Sketchbook { owner_id, pages[] }
Page {
  type: "prompt" | "drawing" | "guess"
  author_id
  text?
  image?
}
```

### State Transitions
1. Prompt assigned
2. Pass sketchbooks
3. Drawing
4. Pass
5. Guessing
6. Repeat until complete
7. Reveal

## 6. Optional Online Features
- Lobby with chat
- Adjustable timers
- Custom prompt lists
- Accessibility options

## 7. Example Turn Sequence (6 Players)

| Turn | Receives | Task | Result |
|------|----------|------|--------|
| 1 | Prompt | Draw | Drawing |
| 2 | Drawing | Guess | Guess |
| 3 | Guess | Draw | Drawing |
| 4 | Drawing | Guess | Guess |
| 5 | Guess | Draw | Drawing |
| 6 | Drawing | Guess | Guess |

## 8. Developer Checklist
### Front-End
- Drawing canvas
- Timers
- Passing logic
- Gallery viewer
- Lobby UI

### Back-End
- Game session manager
- Turn order logic
- Sketchbook storage
- Realtime sync


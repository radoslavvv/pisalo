# TypeRacer-Style Typing Game - Project Plan

## Project Overview

A modern web-based typing game inspired by TypeRacer, featuring multiple game modes, user authentication, leaderboards, and real-time multiplayer functionality.

## Technology Stack

### Frontend

-   **Framework**: React
-   **Key Libraries** (Recommended):
    -   React Router for navigation
    -   Zustand for state management
    -   Axios for API calls
    -   Socket.io-client for WebSocket connections
    -   TailwindCSS or Material-UI for styling
    -   Chart.js or Recharts for statistics visualization

### Backend

-   **Framework**: .NET (ASP.NET Core Web API)
-   **Real-time Communication**: SignalR for WebSocket multiplayer
-   **Authentication**: OAuth (Google, GitHub, etc.)
-   **ORM**: Entity Framework Core

### Database

-   **Database**: PostgreSQL
-   **Hosting**: Docker containers

### Deployment

-   Docker containers for platform-agnostic deployment
-   Docker Compose for orchestrating frontend, backend, and database

---

## Core Features & Functionality

### 1. Home/Welcome Screen

**Description**: Landing page where users select their game mode

**Components**:

-   Game mode selector (cards/buttons for each mode)
-   Login/Register button (top right)
-   Leaderboard link
-   Multiplayer room creation button
-   Quick start option for guest users

**User Flow**:

```
User lands on home → Selects game mode → Redirected to game screen
```

---

### 2. Game Modes

#### 2.1 Timed Mode

-   **Options**: 15s, 30s, 60s
-   **Mechanics**:
    -   Display words/sentences continuously
    -   Stop accepting input when timer expires
    -   Calculate WPM (Words Per Minute) and accuracy
    -   Track errors made during typing

#### 2.2 Word Count Mode

-   **Options**: 25, 50, 100 words
-   **Mechanics**:
    -   Display fixed number of words
    -   No time limit
    -   Track time taken to complete
    -   Calculate WPM and accuracy

#### 2.3 Zen Mode

-   **Mechanics**:
    -   Infinite typing with no statistics
    -   Relaxed mode for practice
    -   No errors tracked, no timer
    -   Simple word flow

#### 2.4 Instant Death Mode

-   **Mechanics**:
    -   Game ends immediately on first error
    -   Track how many words typed correctly before failure
    -   High-pressure mode for accuracy focus
    -   Leaderboard based on words typed before first error

#### 2.5 Multiplayer Mode

-   **Mechanics**:
    -   Create room with shareable link
    -   No registration required to join
    -   Real-time progress tracking for all players
    -   WebSocket (SignalR) for live updates
    -   Same word set for all players in a room
    -   Winner determined by first to finish or best WPM

---

### 3. Game Interface

**Components**:

#### Word Display Area

-   Show current word to type (highlighted)
-   Show upcoming words (grayed out)
-   Show completed words (green for correct, red for errors)
-   Smooth scrolling as user progresses

#### Input Field

-   Large, focused text input
-   Real-time character-by-character validation
-   Visual feedback (correct = green, error = red)
-   Cursor position indicator

#### Visual Keyboard

-   On-screen keyboard below input area
-   Highlight next key to press
-   Show current finger position (optional)
-   Visual feedback for correct/incorrect keystrokes

#### Statistics Display (During Game)

-   Current WPM
-   Accuracy percentage
-   Timer (for timed modes) or word count progress
-   Error count

---

### 4. Post-Game Statistics

**Displayed Metrics**:

-   Final WPM (Words Per Minute)
-   Raw WPM (without accuracy adjustment)
-   Accuracy percentage
-   Total time taken
-   Total words typed
-   Error count
-   Character accuracy breakdown
-   WPM over time graph
-   Comparison to personal best
-   Comparison to global average

**Actions Available**:

-   Retry same mode
-   Try different mode
-   Save results (requires login)
-   Share results (social media integration)

---

### 5. User Authentication & Accounts

**Authentication Method**: OAuth 2.0

-   Google Sign-In
-   GitHub Sign-In
-   (Optional) Discord/Microsoft

**User Features**:

-   Save game statistics history
-   Track personal bests per mode
-   View progress over time
-   Custom profile settings (username, avatar)
-   Private profile option

**Guest Users**:

-   Can play all single-player modes
-   Can join multiplayer rooms
-   Cannot save statistics
-   Cannot appear on leaderboards
-   Persistent prompt to create account after games

---

### 6. Leaderboards

**Leaderboard Types**:

#### Daily Leaderboard

-   Top 100 players for current day
-   Resets at midnight UTC
-   Separate tabs for each game mode

#### Weekly Leaderboard

-   Top 100 players for current week
-   Resets every Monday
-   Separate tabs for each game mode

#### Monthly Leaderboard

-   Top 100 players for current month
-   Resets on 1st of each month
-   Separate tabs for each game mode

**Display Information**:

-   Rank
-   Username
-   WPM
-   Accuracy
-   Date achieved
-   Game mode

**Features**:

-   Filter by game mode
-   View personal rank
-   Click username to view profile
-   Pagination for lower ranks

---

### 7. Multiplayer Functionality

**Room Creation**:

-   User creates room (no login required)
-   Generate unique shareable link
-   Set room options:
    -   Game mode (timed or word count)
    -   Number of players (2-10)
    -   Public or private
    -   Start countdown timer

**Room Lobby**:

-   Show connected players
-   Room creator is moderator
-   Chat functionality (optional)
-   Ready-up system
-   Moderator starts game when ready

**Live Gameplay**:

-   Real-time progress bars for all players
-   Live WPM updates
-   Player positions/rankings
-   Same word set for all players
-   Synchronized start countdown

**Post-Game**:

-   Results screen with all player statistics
-   Winner announcement
-   Option to rematch
-   Share room link for new players

**Technical Implementation**:

-   SignalR for WebSocket connections
-   Room state management on server
-   Handle disconnections gracefully
-   Reconnection logic for dropped connections

## Key Technical Decisions

### Word Generation

-   **Approach**: Predefined word lists stored in database
-   **Implementation**:
    -   Seed database with common English words (top 1000-5000)
    -   Categorize by difficulty
    -   Shuffle and serve random subsets per game
    -   Consider future expansion with multiple languages

### Real-time Multiplayer

-   **Technology**: SignalR (WebSocket with fallback)
-   **State Management**: Server-side room state
-   **Sync Strategy**: Broadcast player progress every 500ms
-   **Disconnection Handling**: 30-second grace period before removing player

### Leaderboard Updates

-   **Strategy**: Scheduled background job
-   **Frequency**: Update every 5 minutes
-   **Optimization**: Use database indexing and caching (Redis optional)

# Breeding Game Discord Bot

## Overview
A Discord bot for a breeding/pregnancy game. Male members can attempt to impregnate female members with a chance-based system. Pregnancy lasts 7 days, after which the female member gives birth and receives a baby counted in their profile.

## Technology Stack
- **Platform**: Node.js
- **Framework**: discord.js v14
- **Database**: quick.db (SQLite-based)
- **Environment**: dotenv for configuration

## Features & Commands

### `/setgender [gender]`
Set your gender (male or female). Required before participating in the game.

### `/impregnate @user`
**Male members only.** Attempt to impregnate a female member. The target receives accept/reject buttons:
- If accepted, rolls a random number 1-100
- If roll is greater than 50, pregnancy occurs
- Pregnancy lasts 7 days

### `/checkbirth`
**Female members only.** Check pregnancy status:
- Shows days remaining if pregnant
- Triggers birth after 7 days, adding a baby to the count
- Displays the father of the baby

### `/profile [@user]`
View your profile or another user's profile showing:
- Gender
- Total babies
- Current pregnancy status (for females)
- Recent babies with birth dates and fathers

## Game Mechanics
1. Users must set their gender first using `/setgender`
2. Male members can use `/impregnate @female_member`
3. Female member receives accept/reject buttons
4. If accepted, random roll 1-100 determines success (>50 = pregnant)
5. Pregnancy lasts exactly 7 days (604800000ms)
6. Female uses `/checkbirth` to see status and trigger birth when ready
7. Each birth increments baby count and records father

## Setup Requirements
1. Discord Bot Token (stored as secret: `TOKEN`)
2. Bot must have the following intents enabled in Discord Developer Portal:
   - Guilds
   - Guild Messages
   - Message Content

## Database Structure
- Uses quick.db for persistent storage
- Data stored in `json.sqlite` file
- Profile structure:
  ```
  {
    gender: 'male' | 'female' | null,
    activePregnancy: {
      fatherId: string,
      startTimestamp: number,
      dueTimestamp: number,
      conceptionRoll: number
    } | null,
    babies: Array<{
      birthTimestamp: number,
      fatherId: string
    }>,
    totalBabies: number
  }
  ```

## Project Structure
- `index.js` - Main bot application
- `package.json` - Dependencies and scripts
- `.env` - Environment variables (TOKEN)
- `.env.example` - Example environment file

## Recent Changes
- 2025-11-21: Imported from GitHub, configured for Replit environment
- 2025-11-21: Completely redesigned from seed/garden game to breeding/pregnancy game
- 2025-11-21: Implemented persistent database with quick.db
- 2025-11-21: Added gender system, pregnancy mechanics, baby tracking, and profile system
- 2025-11-21: Fixed deprecation warning by updating to clientReady event

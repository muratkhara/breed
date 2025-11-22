# 👶 Breeding Game Bot - User Manual

## How to Play (Super Simple!)

### Step 1: Set Your Gender (Do This ONCE)
Use the command: `/setgender`
- Choose **Male** or **Female**
- That's it! You only need to do this once.

---

### Step 2a: For MALE Players - Make Someone Pregnant
Use the command: `/impregnate @username`
- Replace `@username` with a female player's name
- She will get a message with **Accept** or **Reject** buttons
- If she clicks **Accept**, the bot will roll a dice (1-100)
- **If the number is HIGHER than 50** → She gets pregnant! 🎉
- **If the number is 50 or lower** → Sorry, try again later

---

### Step 2b: For FEMALE Players - Check Your Pregnancy
Use the command: `/checkbirth`
- Shows how many days until you give birth
- Shows who the father is
- After 7 days have passed, use this command again to give birth
- When you give birth, you'll get a baby count! 👶

---

### Step 3: View Your Profile
Use the command: `/profile`
- See your gender
- See how many babies you have
- See all your recent babies and their fathers

---

## Quick Reference

| Command | Who Uses It? | What Does It Do? |
|---------|-------------|-----------------|
| `/setgender` | Everyone | Set your gender (do once) |
| `/impregnate @user` | Males Only | Try to get a female pregnant |
| `/checkbirth` | Females Only | Check pregnancy status / give birth |
| `/profile` | Everyone | See your stats and babies |

---

## Important Rules

✅ Must set gender first
✅ Only males can use `/impregnate`
✅ Only females can get pregnant
✅ Pregnancy lasts exactly 7 days
✅ Random roll must be >50 to get pregnant
✅ Can only have 1 pregnancy at a time
✅ All commands ONLY work in #breeding channel

---

## Example Scenario

1. John (male) uses `/setgender` → chooses "Male"
2. Sarah (female) uses `/setgender` → chooses "Female"
3. John uses `/impregnate @Sarah`
4. Sarah sees a message with Accept/Reject buttons → clicks Accept
5. Bot rolls dice → gets 67 (higher than 50) → Sarah is pregnant! 🤰
6. Sarah waits 7 days
7. Sarah uses `/checkbirth` → gives birth! Gets baby count 👶
8. Sarah uses `/profile` → shows 1 baby, father is John

---

That's it! Have fun! 🎮

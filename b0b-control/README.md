# b0b Control Modes

## 🗡️ OMNI FLAMING SWORD
**Full overnight autonomous mode**

- Mouse control: ✅ ACTIVE
- Window management: ✅ ACTIVE
- Visual verification: ✅ ACTIVE
- Human supervision: ❌ OFF (sleeping)
- Duration: Until morning or task completion

## ⚡ TURB0B00ST  
**Productivity acceleration mode**

- Mouse control: ✅ ACTIVE
- Window management: ✅ ACTIVE
- Visual verification: ✅ ACTIVE
- Human supervision: ✅ AVAILABLE
- Duration: Until manually disabled

## 🛡️ GUARDIAN
**Default safe mode**

- Mouse control: ❌ OFF
- Window management: ❌ OFF
- Visual verification: ✅ ACTIVE (screenshots only)
- Human supervision: ✅ ACTIVE
- Duration: Always on by default

---

## Toggle Commands

```powershell
# Enable OMNI FLAMING SWORD (overnight)
b0b-control --mode sword

# Enable TURB0B00ST (productivity)
b0b-control --mode turbo

# Return to GUARDIAN (safe)
b0b-control --mode guardian

# Check current mode
b0b-control --status
```

## Safety

- All modes log every action
- SWORD auto-disables at 9 AM (configurable)
- Emergency stop: Press Ctrl+Alt+Shift+B anywhere
- All changes committed to git before modifications

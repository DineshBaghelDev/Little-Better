# Sprout mascot asset refresh

- Generated a new Sprout sprite sheet from the product design reference and normalized it into six 512px frames.
- Replaced the drawn React Native mascot with the sprite sheet renderer so existing mascot placements use the higher quality art.
- Rebuilt app icon, adaptive icon assets, favicon, and splash icon from the same Sprout frame for consistency.
- Added `expo-splash-screen` config per Expo v57 docs because splash plugin config is now the recommended path.
- Added small Sprout placements to Progress, Money, Calendar, and Quick Add where the app already had mascot-friendly header or empty-state space.

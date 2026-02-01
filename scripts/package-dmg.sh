#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Parse args
SKIP_BUILD=false
for arg in "$@"; do
  case "$arg" in
    --skip-build) SKIP_BUILD=true ;;
    *) echo "Unknown option: $arg"; exit 1 ;;
  esac
done

# Read version from package.json
VERSION=$(node -p "require('$PROJECT_DIR/package.json').version")
DMG_NAME="Tab-Hoarder-v${VERSION}.dmg"
STAGE_DIR="$PROJECT_DIR/.dmg-stage"

echo "==> Packaging Tab Hoarder v${VERSION}"

# Build
if [ "$SKIP_BUILD" = false ]; then
  echo "==> Installing dependencies and building..."
  cd "$PROJECT_DIR"
  npm ci
  npm run build
else
  echo "==> Skipping build (--skip-build)"
fi

# Verify dist exists
if [ ! -d "$PROJECT_DIR/dist" ]; then
  echo "Error: dist/ directory not found. Run npm run build first."
  exit 1
fi

# Clean previous staging
rm -rf "$STAGE_DIR"
mkdir -p "$STAGE_DIR/Tab Hoarder/extension"

# Copy built extension
cp -R "$PROJECT_DIR/dist/." "$STAGE_DIR/Tab Hoarder/extension/"

# Generate INSTALL.txt
cat > "$STAGE_DIR/Tab Hoarder/INSTALL.txt" <<'EOF'
Tab Hoarder — Installation Guide
=================================

1. Open Google Chrome (or Brave)
2. Go to chrome://extensions
   - Or double-click "Open Extensions.command" in this folder
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Select the "extension" folder from this Tab Hoarder folder
6. Done! Open a new tab to see Tab Hoarder

Tips:
- Pin the Tab Hoarder icon in your toolbar for quick saving (Alt+S)
- Your data is stored locally — no account needed
- Daily backups are saved automatically to your Downloads folder
EOF

# Generate Open Extensions.command
cat > "$STAGE_DIR/Tab Hoarder/Open Extensions.command" <<'EOF'
#!/usr/bin/env bash
open "chrome://extensions"
EOF
chmod +x "$STAGE_DIR/Tab Hoarder/Open Extensions.command"

# Remove old DMG if present
rm -f "$PROJECT_DIR/$DMG_NAME"

# Create DMG
echo "==> Creating $DMG_NAME..."
hdiutil create \
  -volname "Tab Hoarder" \
  -srcfolder "$STAGE_DIR" \
  -ov \
  -format UDZO \
  "$PROJECT_DIR/$DMG_NAME"

# Cleanup staging
rm -rf "$STAGE_DIR"

echo "==> Done: $PROJECT_DIR/$DMG_NAME"

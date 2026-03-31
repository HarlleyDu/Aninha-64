#!/data/data/com.termux/files/usr/bin/bash
set -e

CHANGELOG="${1:-Atualização}"
FORCAR_FLAG=""
if [[ "$2" == "--forcar" ]]; then FORCAR_FLAG="--forcar"; fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_JS="$SCRIPT_DIR/App.js"

VERSAO=$(grep -o '"alpha [0-9]*\.[0-9]*\.[0-9]*"' "$APP_JS" | head -1 | tr -d '"alpha ')
if [[ -z "$VERSAO" ]]; then
  VERSAO=$(grep 'VERSAO_ATUAL' "$APP_JS" | grep -o '[0-9]*\.[0-9]*\.[0-9]*' | head -1)
fi
if [[ -z "$VERSAO" ]]; then
  read -p "Versão (ex: 0.0.22): " VERSAO
fi

echo "🔨 Build alpha $VERSAO"

node --check "$APP_JS"

cd "$SCRIPT_DIR"
git add -A
git commit -m "build: alpha $VERSAO — $CHANGELOG" 2>/dev/null || true
git push origin HEAD:master

BUILD_LOG=$(mktemp)

EAS_SKIP_AUTO_FINGERPRINT=1 eas build \
  --platform android \
  --profile preview \
  --non-interactive \
  2>&1 | tee "$BUILD_LOG"

APK_URL=$(grep -oP 'https://expo\.dev/artifacts/eas/[^\s"]+\.apk' "$BUILD_LOG" | tail -1)

rm -f "$BUILD_LOG"

if [[ -z "$APK_URL" ]]; then
  read -p "Cole URL do APK: " APK_URL
fi

"$SCRIPT_DIR/update_app.sh" "$VERSAO" "$APK_URL" "$CHANGELOG" $FORCAR_FLAG

echo "✅ Finalizado alpha $VERSAO"

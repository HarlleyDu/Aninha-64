#!/data/data/com.termux/files/usr/bin/bash
set -e

VERSAO="$1"
APK_URL="$2"
CHANGELOG="$3"
FORCAR=false
if [[ "$4" == "--forcar" ]]; then FORCAR=true; fi

FIREBASE_DB_URL="https://aninha-64-default-rtdb.firebaseio.com"

JSON="{\"versao\":\"alpha $VERSAO\",\"apkUrl\":\"$APK_URL\",\"changelog\":\"$CHANGELOG\",\"forcarAtualizar\":$FORCAR}"

ENDPOINT="${FIREBASE_DB_URL}/config.json"

curl -s -X PUT \
  -H "Content-Type: application/json" \
  -d "$JSON" \
  "$ENDPOINT"

echo "$JSON" > versao.json

git add versao.json
git commit -m "release: alpha $VERSAO — $CHANGELOG" 2>/dev/null || true
git push origin HEAD:master 2>/dev/null || true

echo "🚀 OTA ativado alpha $VERSAO"

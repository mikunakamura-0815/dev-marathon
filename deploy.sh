#!/usr/bin/env bash
# 使用方法: deploy_test.sh <ユーザー名>
set -e

# 1) 引数チェック
USER_NAME="$1"
if [ -z "$USER_NAME" ]; then
  echo "エラー: ユーザー名がありません"
  echo "使用方法: $0 <ユーザー名>"
  exit 1
fi

# 2) パス定義
APP_DIR="/app/${USER_NAME}"
WEB_DIR="/usr/share/nginx/html/${USER_NAME}"
CYPRESS_DIR="/ci"

echo "[INFO] USER=${USER_NAME}"
echo "[INFO] APP_DIR=${APP_DIR}"
echo "[INFO] WEB_DIR=${WEB_DIR}"

# 3) 最新化
cd "${APP_DIR}"
git pull

# 4) Web配備
mkdir -p "${WEB_DIR}"
rm -rf "${WEB_DIR:?}/"*
cp -ipr ./src/web/* "${WEB_DIR}/"

# 5) config.js を用意（prod_config.js があれば優先して使う）
if [ -f "${WEB_DIR}/prod_config.js" ]; then
  mv -f "${WEB_DIR}/prod_config.js" "${WEB_DIR}/config.js" || true
  echo "[INFO] prod_config.js を config.js に差し替えました"
else
  echo "[INFO] prod_config.js が無いので config.js を自動生成します"
  cat > "${WEB_DIR}/config.js" <<EOF
const config = { apiUrl: "/api_${USER_NAME}" };
export default config;
EOF
fi


# 6) （任意）Cypress を回すなら
# cd "${CYPRESS_DIR}"
# npx cypress run --browser chrome --spec "cypress/e2e/${USER_NAME}.*"

echo "[INFO] デプロイ完了"


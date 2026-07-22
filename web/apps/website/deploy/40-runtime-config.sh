#!/bin/sh
set -eu

config_file="/usr/share/nginx/html/config.js"

cat > "$config_file" <<EOF
window.__RUNTIME_CONFIG__ = {
  API_BASE_URL: "${API_BASE_URL:-}"
};
EOF

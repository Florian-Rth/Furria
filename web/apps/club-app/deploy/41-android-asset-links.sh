#!/bin/sh
set -eu

well_known_dir="/usr/share/nginx/html/.well-known"
asset_links_file="$well_known_dir/assetlinks.json"
package_name="${ANDROID_PACKAGE_NAME:-de.furria.club}"
fingerprints="$(printf '%s' "${ANDROID_CERT_FINGERPRINTS:-}" | tr -d ' \t\r\n')"

fail() {
  echo "41-android-asset-links: $1" >&2
  exit 1
}

rm -f "$asset_links_file"

if [ -z "$fingerprints" ]; then
  echo "41-android-asset-links: ANDROID_CERT_FINGERPRINTS is empty, serving no assetlinks.json"
  exit 0
fi

printf '%s' "$package_name" | grep -Eqx '[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z][A-Za-z0-9_]*)+' \
  || fail "ANDROID_PACKAGE_NAME '$package_name' is not an Android package name"

fingerprint_list=""
for fingerprint in $(printf '%s' "$fingerprints" | tr ',' ' '); do
  printf '%s' "$fingerprint" | grep -Eqx '([0-9A-F]{2}:){31}[0-9A-F]{2}' \
    || fail "ANDROID_CERT_FINGERPRINTS entry '$fingerprint' is no SHA-256 fingerprint (32 upper-case hex pairs joined by ':')"
  fingerprint_list="${fingerprint_list:+$fingerprint_list, }\"$fingerprint\""
done

[ -n "$fingerprint_list" ] || fail "ANDROID_CERT_FINGERPRINTS '$ANDROID_CERT_FINGERPRINTS' holds no fingerprint"

statement() {
  cat <<EOF
  {
    "relation": ["$1"],
    "target": {
      "namespace": "android_app",
      "package_name": "$package_name",
      "sha256_cert_fingerprints": [$fingerprint_list]
    }
  }$2
EOF
}

mkdir -p "$well_known_dir"
{
  echo "["
  statement "delegate_permission/common.handle_all_urls" ","
  statement "delegate_permission/common.get_login_creds" ""
  echo "]"
} > "$asset_links_file"

echo "41-android-asset-links: wrote $asset_links_file for $package_name"

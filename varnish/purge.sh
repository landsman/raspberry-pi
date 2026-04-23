#!/bin/sh
set -e

# Usage: VARNISH_HOST=http://... VARNISH_PURGE_TOKEN=... sh purge.sh <<EOF
# /exact-path
# /wildcard/*
# EOF

while read -r path; do
  [ -z "$path" ] && continue

  case "$path" in
    *\*)
      # Wildcard path — convert to regex and use BAN
      pattern=$(echo "$path" | sed 's/\*/.*/')
      echo "Banning: $pattern"
      curl --fail --silent --show-error \
        -X BAN \
        -H "X-Purge-Token: ${VARNISH_PURGE_TOKEN}" \
        -H "X-Ban-Pattern: ${pattern}" \
        "${VARNISH_HOST}/"
      ;;
    *)
      # Exact path — use PURGE
      echo "Purging: ${VARNISH_HOST}${path}"
      curl --fail --silent --show-error \
        -X PURGE \
        -H "X-Purge-Token: ${VARNISH_PURGE_TOKEN}" \
        "${VARNISH_HOST}${path}"
      ;;
  esac

  echo " done"
done

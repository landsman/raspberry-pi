#!/bin/sh
set -e

# Parse comma-separated VARNISH_PURGE_IPS into individual VCL ACL entries.
# Works with a single IP or a list, and supports both IPv4 and IPv6.
VARNISH_PURGE_IPS_ACL=$(echo "$VARNISH_PURGE_IPS" | tr ',' '\n' | while read -r ip; do
  ip=$(echo "$ip" | tr -d ' ')
  [ -z "$ip" ] && continue
  printf '    "%s";\n' "$ip"
done)
export VARNISH_PURGE_IPS_ACL

# SC2016: shellcheck warns that expressions in single quotes won't expand — that's intentional here.
# envsubst expects the variable list as literal strings (e.g. '${FOO}'), not their expanded values.
# Single quotes prevent the shell from expanding them before passing to envsubst.
# shellcheck disable=SC2016
envsubst '${VARNISH_PURGE_IPS_ACL} ${VARNISH_PURGE_TOKEN}' \
  < /etc/varnish/default.vcl \
  > /tmp/default.vcl

exec varnishd -F \
  -a :80 \
  -T localhost:6082 \
  -f /tmp/default.vcl \
  -s "malloc,${VARNISH_SIZE:-256m}"

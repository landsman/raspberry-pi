#!/bin/sh
set -e

BACKUP_DIR="/backup"
KEEP_DAYS=14

DATE=$(date +%Y%m%d_%H%M%S)
FILE="$BACKUP_DIR/database-backup-$DATE.sql.gz"

echo "[$(date)] Starting backup..."
pg_dumpall -U postgres | gzip > "$FILE"
echo "[$(date)] Backup saved: $FILE"

find "$BACKUP_DIR" -name "database-backup-*.sql.gz" -mtime +$KEEP_DAYS -delete
echo "[$(date)] Old backups pruned (kept last $KEEP_DAYS days)"

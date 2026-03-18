SERVICE = postgres17
PG_USER = postgres
BACKUP_DIR = /home/containers/backup/database

.PHONY: up down logs backup restore psql

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

psql:
	docker compose exec $(SERVICE) psql -U $(PG_USER)

backup:
	docker compose exec $(SERVICE) sh -c \
		"pg_dumpall -U $(PG_USER) | gzip > /tmp/backup.sql.gz && cat /tmp/backup.sql.gz" \
		> $(BACKUP_DIR)/database-backup-$(shell date +%Y%m%d_%H%M%S).sql.gz
	find $(BACKUP_DIR) -name "database-backup-*.sql.gz" -mtime +14 -delete

restore:
	@test -n "$(FILE)" || (echo "Usage: make restore FILE=database-backup-YYYYMMDD_HHMMSS.sql.gz" && exit 1)
	gunzip -c $(BACKUP_DIR)/$(FILE) | docker compose exec -T $(SERVICE) psql -U $(PG_USER)

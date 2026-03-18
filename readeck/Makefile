# todo: rename volume
VOLUME := readeck_readeck-data
BACKUP_DIR := /home/containers/backup/readeck

.PHONY: up down logs backup restore

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

backup:
	docker run --rm \
		-v $(VOLUME):/data:ro \
		-v $(BACKUP_DIR):/backup \
		-v $(PWD)/backup.sh:/backup.sh:ro \
		alpine sh /backup.sh

restore:
	@test -n "$(FILE)" || (echo "Usage: make restore FILE=readeck-backup-YYYYMMDD_HHMMSS.tar.gz" && exit 1)
	@docker volume inspect $(VOLUME) > /dev/null 2>&1 || (echo "Error: volume $(VOLUME) does not exist. Run 'make up' first." && exit 1)
	docker run --rm \
		-v $(VOLUME):/data \
		-v $(BACKUP_DIR):/backup \
		alpine tar xzf /backup/$(FILE) -C /data
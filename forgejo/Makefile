.PHONY: up down logs backup restore

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

backup:
	docker run --rm \
		-v forgejo-data:/data:ro \
		-v /home/pi5/backup/forgejo:/backup \
		-v $(PWD)/backup.sh:/backup.sh:ro \
		alpine sh /backup.sh

restore:
	@test -n "$(FILE)" || (echo "Usage: make restore FILE=forgejo-backup-YYYYMMDD_HHMMSS.tar.gz" && exit 1)
	docker run --rm \
		-v forgejo-data:/data \
		-v /home/pi5/backup/forgejo:/backup \
		alpine tar xzf /backup/$(FILE) -C /data

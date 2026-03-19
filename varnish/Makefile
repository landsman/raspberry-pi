.PHONY: up down logs reload stat top varnishlog purge-log purge-all

up:
	docker compose up -d

down:
	docker compose down

logs: ## follow docker compose logs
	docker compose logs -f

reload: ## restart varnish to apply VCL or nginx config changes
	docker compose restart varnish

stat: ## live counters: hits, misses, RAM usage, cached objects
	docker exec varnish varnishstat

top: ## top URLs by request rate
	docker exec varnish varnishtop

varnishlog: ## raw request log
	docker exec varnish varnishlog

purge-log: ## show only PURGE and BAN requests
	docker exec varnish varnishlog -q "ReqMethod eq PURGE or ReqMethod eq BAN"

purge-all: ## invalidate the entire cache
	docker exec varnish varnishadm ban req.url "~" ".*"

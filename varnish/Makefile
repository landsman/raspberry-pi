.PHONY: up down logs reload stat top varnishlog purge-log purge-all vcl-validate

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

vcl-validate: ## validate VCL syntax using the varnish docker image
	VARNISH_PURGE_IPS_ACL='"10.0.0.1";' \
	VARNISH_PURGE_TOKEN=dummy \
	VARNISH_PURGE_TOKEN_CMS=dummy \
	VARNISH_DEBUG=true \
	envsubst < default.vcl | \
	docker run --rm -i \
		--add-host nginx:127.0.0.1 \
		varnish:7 \
		bash -c 'cat > /tmp/default.vcl && varnishd -C -f /tmp/default.vcl'

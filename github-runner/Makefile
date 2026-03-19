.PHONY: help build up down restart logs

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}'

build: ## Build the runner image
	docker compose --profile nodejs build

up: ## Start the runner
	docker compose up -d

down: ## Stop and remove the runner
	docker compose down --remove-orphans

restart: ## Rebuild and restart the runner
	docker compose down --remove-orphans
	docker compose up -d --build

logs: ## Follow runner logs
	docker compose logs -f

IMAGE                   := ip-service
REGISTRY_IMAGE          ?= ghcr.io/landsman/homelab-ip-service
TAG                     ?= latest
PLATFORM                := linux/arm64
GIT_SHA                 ?= $(shell git rev-parse --short HEAD)

.PHONY: help dev install qa build ci-release run stop logs

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

install: ## Install deps
	bun install --frozen-lockfile

dev: ## Start Bun server locally
	bun run src/server.ts

qa: ## Run TypeScript type checker
	bun x tsc --noEmit

build: ## Build Docker image for current platform
	docker build -t $(IMAGE):$(TAG) .

ci-release: ## Build linux/arm64 image and push to registry
	docker buildx build \
		--platform $(PLATFORM) \
		--tag $(REGISTRY_IMAGE):$(TAG) \
		--tag $(REGISTRY_IMAGE):$(GIT_SHA) \
		--push \
		.

run: ## Run the container locally
	docker run -d --name $(IMAGE) -p 3000:3000 $(IMAGE):$(TAG)

stop: ## Stop the container
	docker stop $(IMAGE) || true
	docker rm $(IMAGE) || true

logs: ## Follow logs
	docker logs -f $(IMAGE)

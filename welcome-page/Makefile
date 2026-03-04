IMAGE          := homelab-status
TAG            := latest
PORT           := 8080
PLATFORM       := linux/arm64
GIT_SHA        ?= $(shell git rev-parse --short HEAD)
REGISTRY_IMAGE ?= $(IMAGE)

.PHONY: help dev install build preview lint format qa docker-build docker-build-local docker-release docker-run docker-stop clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

install: ## Install deps
	npm ci

dev: ## Start local dev server (hot reload)
	npm run dev

build: ## Build static assets into dist/
	npm run build

lint: ## Run ESLint (includes filename-case check)
	npm run lint

format: ## Format all files with Prettier
	npm run format:fix
	npm run lint:fix

qa: ## Check requirement format
	npx tsc -b --noEmit
	npm run format
	npm run lint

preview: build ## Build then preview the production build locally
	npm run preview -- --port 4173

docker-build: ## Build Docker image for Raspberry Pi (linux/arm64)
	docker build --platform $(PLATFORM) -f docker/Dockerfile -t $(IMAGE):$(TAG) .

docker-build-local: ## Build Docker image for current platform (local testing)
	docker build -f docker/Dockerfile -t $(IMAGE):$(TAG) .

docker-release: ## Build linux/arm64 image and push to registry (set REGISTRY_IMAGE and GIT_SHA)
	docker buildx build \
		--platform $(PLATFORM) \
		--file docker/Dockerfile \
		--tag $(REGISTRY_IMAGE):$(TAG) \
		--tag $(REGISTRY_IMAGE):$(GIT_SHA) \
		--push \
		.

docker-run: ## Run the container locally on PORT (default: 8080)
	docker run --rm -p $(PORT):80 --name $(IMAGE) $(IMAGE):$(TAG)

docker-stop: ## Stop the running container
	docker stop $(IMAGE) 2>/dev/null || true

clean: ## Remove dist/ and node_modules/
	rm -rf dist node_modules

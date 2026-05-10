# KnowDrive Unified Development Stack

.PHONY: dev up down logs clean status

# Start everything: Backend, Collabora, and Frontend
dev: up
	@echo "🚀 Starting Frontend..."
	npm run dev

# Initial setup for new machines
setup:
	@echo "🛠️  Setting up local environment..."
	@if [ ! -f .env.local ]; then cp .env.local.example .env.local && echo "✅ Created .env.local. Please update it with your API keys."; else echo "ℹ️ .env.local already exists."; fi
	npm install
	@echo "✅ Setup complete. Run 'make dev' to start."

# Start background services (Docker)
up:
	@echo "🐳 Starting Docker Services (Backend + Collabora)..."
	docker compose up -d --build
	@echo "✅ Services are running in the background."

# Stop background services
down:
	@echo "🛑 Stopping Docker Services..."
	docker compose down

# View logs for background services
logs:
	docker compose logs -f

# Check status of services
status:
	docker compose ps

# Deep clean (removes volumes)
clean:
	docker compose down -v
	@echo "🗑️  Volumes cleared."

.PHONY: up down logs migrate dev web

# --- Infrastructure ---

up:
	docker compose up --build -d
	@echo "Waiting for backend..."
	@sleep 2
	@$(MAKE) migrate

down:
	docker compose down

logs:
	docker compose logs -f backend

migrate:
	DATABASE_URL=postgresql://libra:libra@localhost:5432/libra_legal ./backend/scripts/migrate.sh

# --- Frontend ---

web:
	cd clients/web && npm install && npm run dev

# --- Full dev environment ---

dev:
	@bash scripts/dev.sh

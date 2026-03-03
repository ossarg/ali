.PHONY: up down build logs migrate fmt tidy

up:
	docker compose up --build -d

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f server

migrate:
	DATABASE_URL=postgresql://libra:libra@localhost:5432/libra_legal ./scripts/migrate.sh

fmt:
	go fmt ./...

tidy:
	go mod tidy

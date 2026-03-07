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

swagger:
	$(shell go env GOPATH)/bin/swag init -g cmd/server/main.go -o docs

fmt:
	go fmt ./...

tidy:
	go mod tidy

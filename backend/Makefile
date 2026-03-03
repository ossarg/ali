.PHONY: run run-detached stop build test test-coverage lint fmt tidy swagger

run:
	docker compose up --build

run-detached:
	docker compose up --build -d

stop:
	docker compose down

build:
	go build -o bin/libra-legal ./cmd/server/main.go

test:
	go test -v ./pkg/...

test-coverage:
	go test ./pkg/... -coverprofile=coverage.out
	go tool cover -func=coverage.out
	go tool cover -html=coverage.out -o coverage.html

lint:
	@if command -v golangci-lint &> /dev/null; then \
		golangci-lint run ./...; \
	else \
		echo "golangci-lint not installed. Skipping lint."; \
	fi

fmt:
	go fmt ./...

tidy:
	go mod tidy
	go mod verify

swagger:
	@go install github.com/swaggo/swag/cmd/swag@latest
	@swag init -g cmd/server/main.go -o docs
	@echo "✅ Swagger docs generados"

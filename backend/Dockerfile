# syntax=docker/dockerfile:1.4

FROM golang:1.24-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git

RUN go install github.com/swaggo/swag/cmd/swag@v1.16.6

COPY go.mod go.sum ./
RUN go mod download

COPY . ./

RUN swag init -g cmd/server/main.go -o docs

RUN CGO_ENABLED=0 GOOS=linux go build -o libra-legal ./cmd/server/main.go

FROM alpine:3.19

WORKDIR /app

RUN apk add --no-cache tzdata ca-certificates

COPY --from=builder /app/libra-legal /app/libra-legal

RUN chmod +x /app/libra-legal

EXPOSE 8080

CMD ["/app/libra-legal"]

# syntax=docker/dockerfile:1.4

FROM golang:1.25-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git

COPY go.mod go.sum ./
RUN go mod download

COPY . ./

RUN CGO_ENABLED=0 GOOS=linux go build -o libra-legal ./cmd/server/main.go

#---------------------------------------------------------#
FROM alpine:3.19

WORKDIR /app

RUN apk add --no-cache tzdata ca-certificates

COPY --from=builder /app/libra-legal /app/libra-legal
COPY --from=builder /app/migrations /app/migrations

RUN chmod +x /app/libra-legal

EXPOSE 8080

CMD ["/app/libra-legal"]

FROM golang:1.24-alpine AS builder
WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o /out/server ./cmd/server && \
    CGO_ENABLED=0 GOOS=linux go build -o /out/dbsetup ./cmd/dbsetup

FROM alpine:3.21
WORKDIR /app

RUN apk add --no-cache ca-certificates && \
    adduser -D -u 10001 appuser

COPY --from=builder /out/server /app/server
COPY --from=builder /out/dbsetup /app/dbsetup

USER appuser
EXPOSE 5000

CMD ["/bin/sh", "-c", "./dbsetup && ./server"]

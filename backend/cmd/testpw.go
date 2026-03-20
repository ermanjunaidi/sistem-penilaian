package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	ctx := context.Background()
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://app:app@localhost:5432/sistem_penilaian?sslmode=disable"
	}

	pool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()

	var email, passwordHash string
	err = pool.QueryRow(ctx, "SELECT email, password FROM users WHERE email = $1", "superadmin@school.id").Scan(&email, &passwordHash)
	if err != nil {
		log.Fatal("User not found:", err)
	}

	fmt.Printf("Email: %s\n", email)
	fmt.Printf("Hash: %s\n", passwordHash)

	// Test password
	testPass := "admin123"
	err = bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(testPass))
	if err != nil {
		fmt.Printf("Password mismatch! Error: %v\n", err)
	} else {
		fmt.Println("Password MATCH!")
	}
}

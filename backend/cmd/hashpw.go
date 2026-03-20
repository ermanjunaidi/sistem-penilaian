package main

import (
	"fmt"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	hash, err := bcrypt.GenerateFromPassword([]byte("guru123"), 10)
	if err != nil {
		panic(err)
	}
	fmt.Println(string(hash))
}

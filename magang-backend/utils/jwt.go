package utils

import (
	"errors"
	"time"

	"github.com/dgrijalva/jwt-go"
)

var jwtKey = []byte("kominfo")

// GenerateToken membuat JWT token untuk user
func GenerateToken(userID uint) (string, error) {
	tokenExpiration := time.Now().Add(24 * time.Hour)
	
	claims := jwt.MapClaims{
		"user_id": userID,
		"exp":     tokenExpiration.Unix(),
	}
	
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtKey)
	
	if err != nil {
		return "", err
	}
	
	return tokenString, nil
}

// ValidateToken memeriksa apakah token valid
func ValidateToken(tokenString string) (uint, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return jwtKey, nil
	})
	
	if err != nil {
		return 0, err
	}
	
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		userID := uint(claims["user_id"].(float64))
		return userID, nil
	}
	
	return 0, errors.New("invalid token")
}
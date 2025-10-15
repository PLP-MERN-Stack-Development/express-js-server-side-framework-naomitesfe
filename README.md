# Express.js Products API

A RESTful API built with Express.js to manage products, including full CRUD operations, authentication, logging, validation, and Swagger documentation.

---

## **Table of Contents**

- [Requirements](#requirements)  
- [Installation](#installation)  
- [Environment Variables](#environment-variables)  
- [Running the Server](#running-the-server)  
- [API Endpoints](#api-endpoints)  
- [Swagger UI](#swagger-ui)  
- [Examples](#examples)  

---

## **Requirements**

- Node.js v18 or higher  
- npm (Node Package Manager)

---

## **Installation**

1. Clone the repository:

```bash
git clone https://github.com/PLP-MERN-Stack-Development/express-js-server-side-framework-naomitesfe.git
cd express-js-server-side-framework-naomitesfe
```
# Install dependencies:

```bash
npm install
```
- Create a .env file (see Environment Variables).

# Environment Variables
- Create a .env file in the root of your project:

- .env

```bash
PORT=3000
API_KEY=your_api_key_here
NODE_ENV=development

``` 
- PORT: Port where the server runs (default 3000)
- API_KEY: API key required for authentication
- NODE_ENV: Set to development for detailed error messages

# Running the Server
``` bash
node server.js
```
Server should be running at:
```bash
http://localhost:3000
Swagger UI: http://localhost:3000/api-docs
```
# API Endpoints
# Products
- Method	Endpoint	Description	Auth Required
- GET	/api/products	List all products	Yes
- GET	/api/products/:id	Get a single product by ID	Yes
- POST	/api/products	Create a new product	Yes
- PUT	/api/products/:id	Update an existing product	Yes
- DELETE	/api/products/:id	Delete a product	Yes

# Authentication:
All routes require a header: x-api-key: <API_KEY>

# Examples

# GET all products
powershell
```bash
Invoke-RestMethod -Uri "http://localhost:3000/api/products" `
  -Headers @{ "x-api-key" = "supersecretkey123" } `
  -Method GET
  ```
- Response:

json
```bash
{
  "total": 4,
  "page": 1,
  "limit": 10,
  "products": [
    {
      "id": "1",
      "name": "Tablet X Pro",
      "description": "Updated tablet",
      "price": 549.99,
      "category": "electronics",
      "inStock": false
    },
    ...
  ]
}
```
# POST create product
powershell
```bash
Invoke-RestMethod -Uri "http://localhost:3000/api/products" `
  -Headers @{ "x-api-key" = "supersecretkey123"; "Content-Type" = "application/json" } `
  -Method POST `
  -Body ('{
      "name":"Tablet X",
      "description":"High-end tablet",
      "price":499.99,
      "category":"electronics",
      "inStock":true
  }')
  ```
- Response:

json
```bash
{
  "id": "5",
  "name": "Tablet X",
  "description": "High-end tablet",
  "price": 499.99,
  "category": "electronics",
  "inStock": true
}
```
# PUT update product
powershell
```bash
Invoke-RestMethod -Uri "http://localhost:3000/api/products/1" `
  -Headers @{ "x-api-key" = "supersecretkey123"; "Content-Type" = "application/json" } `
  -Method PUT `
  -Body ('{
      "name":"Tablet X Pro",
      "description":"Updated tablet",
      "price":549.99,
      "category":"electronics",
      "inStock":false
  }')
  ```
# DELETE product
powershell
```bash
Invoke-RestMethod -Uri "http://localhost:3000/api/products/1" `
  -Headers @{ "x-api-key" = "supersecretkey123" } `
  -Method DELETE
  ```
# Swagger UI
All endpoints are documented with Swagger at:

``` bash
http://localhost:3000/api-docs
You can try each endpoint interactively.
```

# Notes
- Products are stored in-memory; restarting the server resets the data.
- Make sure to use the correct API key in the x-api-key header.

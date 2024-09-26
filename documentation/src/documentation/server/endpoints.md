# Endpoints

## Signup

Registers a new user.

### Endpoint

```http
POST /signup
```

### Request Body

```json
{
  "user": String,
  "pass": String
}
```

### Responses

- `201 User Created` on success
- `400 <Error Msg>` if the request is invalid

## Login

Checks login details against the database and returns a JWT token for further requests if the details are correct. The JWT token is valid for 1 hour.

### Endpoint

```http
POST /login
```

### Request Body

```json
{
  "user": String,
  "pass": String
}
```

### Responses

- `200 <token>` on success
- `401 Incorrect user details` if the user details are incorrect
- `400 <Error Msg>` if the request is invalid

## Store Shape

Stores a shape for an authenticated user.

### Endpoint

```http
POST /storeshape
```

### Request Headers

- `Authorization` : `Bearer <token>`

### Request Body

```json
{
  "name": String,
  "points" : List<Points>
}
```

### Responses

- `201 Shape Stored` on success
- `400 <Error Msg>` if the request is invalid

## Get All Shapes

Retrieves all shapes for an authenticated user.

### Endpoint

```http
GET /shapes
```

### Request Headers

- `Authorization` : `Bearer <token>`

### Responses

- `200 OK` Returns an array of shapes
- `400 <Error Msg>` if the request is invalid

## Get Shape

Retrieves a single shape for an authenticated user using the shape's name.

### Endpoint

```http
GET /shape:<name>
```

### Request Headers

- `Authorization` : `Bearer <token>`

### Responses

- `200 OK` Return the shape
- `400 <Error Msg>` if the request is invalid

### Endpoint

```http
GET /updateshape:<name>
```

### Request Headers

- `Authorization` : `Bearer <token>`

### Request Body

```json
{
  "name": String,
  "points" : List<Points>
}
```
### Responses

- `200 OK` Shape successfully updated
- `400 <Error Msg>` if the request is invalid

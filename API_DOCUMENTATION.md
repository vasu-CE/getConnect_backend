# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All protected routes require a valid JWT token in cookies.

## Response Format
All API responses follow this format:
```json
{
  "success": true/false,
  "message": "Response message",
  "data": {} // or other fields as needed
}
```

## Error Responses
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

## Routes

### Authentication (`/api/auth`)

#### POST `/api/auth/signup`
Create a new user account.
- **Body**: `{ "userName", "email", "password", "otp" }`
- **Response**: `201` - User created successfully

#### POST `/api/auth/sendotp`
Send OTP to email for verification.
- **Body**: `{ "email" }`
- **Response**: `201` - OTP sent successfully

#### POST `/api/auth/login`
User login.
- **Body**: `{ "email", "password" }`
- **Response**: `200` - Login successful

#### POST `/api/auth/logout`
User logout.
- **Response**: `200` - Logout successful

#### GET `/api/auth/is-following/:id`
Check if current user is following another user.
- **Response**: `200` - `{ "isFollowing": true/false, "success": true }`

#### GET `/api/auth/connection`
Get current user's connections.
- **Response**: `200` - `{ "follower": [...], "success": true }`

#### POST `/api/auth/connection/:id`
Follow/unfollow a user.
- **Response**: `200` - `{ "success": true, "message": "...", "following": true/false }`

### Users (`/api/users`)

#### POST `/api/users/edit`
Edit user profile.
- **Body**: `{ "userName", "experience", "gender", "bio", "interests", "deleteInterest" }`
- **Files**: `profilePic`, `resume`
- **Response**: `200` - Profile updated successfully

#### POST `/api/users/register`
Complete user profile registration.
- **Body**: `{ "userName", "bio", "experience", "interest", "gender" }`
- **Files**: `profilePic`, `resume`
- **Response**: `200` - Profile created successfully

#### GET `/api/users/:id/profile`
Get user profile and posts.
- **Response**: `200` - `{ "author": {}, "posts": [...] }`

#### GET `/api/users/suggested`
Get suggested users to follow.
- **Response**: `200` - `{ "users": [...] }`

#### GET `/api/users/connections`
Get user's connections.
- **Response**: `200` - `{ "users": [...], "author": {} }`

#### GET `/api/users/interests`
Get user's interests.
- **Response**: `200` - `{ "oldInterest": [...], "newInterest": [...] }`

#### GET `/api/users/resume/:id`
Download user's resume (PDF stream).

### Posts (`/api/posts`)

#### GET `/api/posts`
Get all posts with pagination.
- **Query**: `?page=1&limit=5`
- **Response**: `200` - `{ "posts": [...], "hasMore": true/false }`

#### POST `/api/posts`
Create a new post.
- **Body**: `{ "caption" }`
- **Files**: `image`
- **Response**: `201` - Post created successfully

#### GET `/api/posts/my-posts`
Get current user's posts.
- **Response**: `200` - `{ "posts": [...] }`

#### POST `/api/posts/:postId/like`
Like/unlike a post.
- **Response**: `200` - `{ "isLiked": true/false, "likesCount": 5 }`

#### POST `/api/posts/:postId/comment`
Add comment to a post.
- **Body**: `{ "text" }`
- **Response**: `201` - Comment added successfully

#### DELETE `/api/posts/:postId`
Delete a post.
- **Response**: `200` - Post deleted successfully

#### GET `/api/posts/:postId`
Get a specific post.
- **Response**: `200` - `{ "post": {} }`

### Projects (`/api/projects`)

#### POST `/api/projects/create`
Create a new project.
- **Body**: `{ "name" }`
- **Response**: `201` - Project created successfully

#### GET `/api/projects/all`
Get all projects.
- **Response**: `200` - `{ "projects": [...] }`

#### GET `/api/projects/:projectId`
Get project by ID.
- **Response**: `200` - `{ "project": {} }`

#### PUT `/api/projects/add-user`
Add users to project.
- **Body**: `{ "projectId", "users": [...] }`
- **Response**: `200` - Users added successfully

#### PUT `/api/projects/update-file-tree`
Update project file tree.
- **Body**: `{ "projectId", "fileTree": {} }`
- **Response**: `200` - File tree updated successfully

#### DELETE `/api/projects/:projectId`
Delete a project.
- **Response**: `200` - Project deleted successfully

### AI (`/api/ai`)

#### GET `/api/ai/get-result`
Get AI-generated result.
- **Response**: `200` - AI result

### Messages (`/api/messages`)

#### POST `/api/messages/send/:id`
Send a message to a user.
- **Body**: `{ "textMessage" }`
- **Response**: `201` - Message sent successfully

#### GET `/api/messages/conversation/:id`
Get conversation messages.
- **Query**: `?page=1&limit=20`
- **Response**: `200` - `{ "messages": [...], "hasMore": true/false }`

#### GET `/api/messages/conversations`
Get all user conversations.
- **Response**: `200` - `{ "conversations": [...] }`

### Search (`/api/search`)

#### GET `/api/search/users`
Search users.
- **Query**: `?q=searchterm`
- **Response**: `200` - `{ "users": [...] }`

#### GET `/api/search/posts`
Search posts.
- **Query**: `?q=searchterm&page=1&limit=10`
- **Response**: `200` - `{ "posts": [...], "hasMore": true/false, "total": 50 }`

#### GET `/api/search/by-interests`
Search users by interests.
- **Query**: `?interests=tech,programming`
- **Response**: `200` - `{ "users": [...] }`

### Quiz (`/api/quiz`)

#### GET `/api/quiz`
Generate quiz based on user interests.
- **Query**: `?interests=tech,programming`
- **Response**: `200` - `{ "quiz": [...] }`

#### POST `/api/quiz/submit-score`
Submit quiz score.
- **Body**: `{ "score": 85 }`
- **Response**: `200` - Score submitted successfully

#### GET `/api/quiz/stats`
Get user's quiz statistics.
- **Response**: `200` - `{ "maxScore": 85, "interests": [...] }`

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## File Uploads

Supported file types:
- **Images**: JPG, PNG, GIF
- **Documents**: PDF

File size limits are configured in multer middleware.

## Pagination

Most list endpoints support pagination:
- `page`: Page number (default: 1)
- `limit`: Items per page (default varies by endpoint)

## Error Handling

All errors are caught and formatted consistently:
- Validation errors return `400`
- Authentication errors return `401`
- Authorization errors return `403`
- Not found errors return `404`
- Server errors return `500`

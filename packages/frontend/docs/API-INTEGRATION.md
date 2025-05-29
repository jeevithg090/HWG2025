# Frontend-Backend Integration Guide

This guide provides information about how the frontend connects with various backend services in the HWG2025 application.

## API Client Structure

The frontend uses a centralized API client located in `lib/api-client.ts` that handles all communication with backend services. The client is structured into separate modules for each service:

- `userApi`: Handles authentication and user-related operations
- `eventApi`: Manages event-related operations
- `freelanceApi`: Handles freelancing features (projects, proposals, etc.)

## Backend Services

The application connects to multiple backend services:

1. **User Service**: Handles authentication, registration, and user profiles
   - Default URL: `http://localhost:4002`

2. **Event Service**: Manages events, registrations, etc.
   - Default URL: `http://localhost:4002`

3. **Freelance Service**: Manages gigs (projects), proposals, and reviews
   - Default URL: `http://localhost:4001`

## Authentication Flow

Authentication is managed through JWT tokens which are:
- Obtained during login via the User Service
- Stored in localStorage using the `auth-utils.ts` utilities
- Attached to API requests using the `getAuthHeaders()` function

### Key Auth Utilities

- `getAuthToken()`: Retrieves the token from localStorage
- `setAuthToken()`: Saves the token to localStorage
- `removeAuthToken()`: Removes the token from localStorage
- `isAuthenticated()`: Checks if a token exists
- `getAuthHeaders()`: Creates headers with Authorization token
- `handleUnauthorizedResponse()`: Handles 401 unauthorized responses

## Data Flow Examples

### User Login Flow:

1. User enters credentials
2. Frontend calls `userApi.login(credentials)`
3. Backend validates credentials and returns token
4. Token is stored using `setAuthToken()`
5. User data is stored using `setUserInStorage()`
6. User is redirected to dashboard

### Freelancer Project List Flow:

1. User navigates to freelancing page
2. Page calls `fetchProjects()` from dashboard helpers
3. Helper retrieves token using `getAuthToken()` 
4. API call is made to Freelance Service with token
5. Projects are displayed to user

### Project Creation Flow:

1. Client submits new project form
2. Form handler calls `freelanceApi.createProject(projectData, token)`
3. Token is attached to request headers
4. Project is created in the Freelance Service
5. User is redirected to project management page

## Error Handling

The application centralizes error handling using:
- `handleApiError()` in auth-utils.ts
- Toast notifications for user feedback
- Automatic handling of authentication errors

## Testing Connections

You can test the API connections using the `test-api-connection.js` utility. Run it with Node.js:

```bash
node lib/test-api-connection.js
```

## Common Issues

1. **401 Unauthorized**: 
   - Check if token is expired or invalid
   - Ensure localStorage has a valid token
   - Verify the token is being sent in request headers

2. **CORS Errors**:
   - Ensure backend services have proper CORS configuration
   - Check that frontend is using correct backend URLs

3. **Network Errors**:
   - Verify all services are running
   - Check Docker containers or process status
   - Verify network connectivity between services

## Environment Variables

The API client uses environment variables to determine service URLs:

- `NEXT_PUBLIC_API_BASE_URL`: Base API URL
- `NEXT_PUBLIC_USER_SERVICE_URL`: User service URL
- `NEXT_PUBLIC_EVENT_SERVICE_URL`: Event service URL
- `NEXT_PUBLIC_FREELANCE_SERVICE_URL`: Freelance service URL

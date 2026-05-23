# Jira Clone - Backend

## Setup Instructions

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Edit `.env` file:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/jiraclone
JWT_SECRET=your_super_secret_key_here
```

> For MongoDB Atlas, replace MONGO_URI with your Atlas connection string.

### 3. Run the server
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/projects | Get all projects |
| POST | /api/projects | Create project |
| GET | /api/projects/:id | Get project by ID |
| DELETE | /api/projects/:id | Delete project |

### Issues
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/issues | Create issue |
| GET | /api/issues/project/:projectId | Get issues by project |
| PUT | /api/issues/:id | Update issue |
| DELETE | /api/issues/:id | Delete issue |

### Sprints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/sprints | Create sprint |
| GET | /api/sprints/project/:projectId | Get sprints by project |
| PUT | /api/sprints/:id | Update sprint |
# Jira-clone-

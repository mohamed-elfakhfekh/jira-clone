# Jira Clone

A full-featured project management application inspired by Jira, built with modern JavaScript stack.

## Features

- 🔐 User Authentication & Authorization
- 📋 Project & Board Management
- 🎯 Task/Issue Tracking with Drag & Drop
- ⏱️ Time Tracking & Reporting
- 👥 Team Collaboration
- 📊 Dashboards & Analytics
- 🔄 Real-time Updates
- 📱 Responsive Design

## Tech Stack

### Frontend
- React (with Vite)
- Tailwind CSS for styling
- React Query for state management
- React Router for navigation
- React DnD for drag and drop
- React Hook Form for forms

### Backend
- Node.js with Express
- PostgreSQL with Prisma ORM
- JWT for authentication
- Express Validator for input validation

### DevOps
- Docker & Docker Compose
- ESLint & Prettier for code formatting

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js v18+ (for local development)

### Using Docker (Recommended)
1. Clone the repository:
\`\`\`bash
git clone https://github.com/mohamed-elfakhfekh/jira-clone.git
cd jira-clone
\`\`\`

2. Start the application:
\`\`\`bash
docker-compose up --build
\`\`\`

3. Access the application:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Database: localhost:5432

### Demo Account
\`\`\`
Email: demo@example.com
Password: demo123
\`\`\`

### Manual Setup

1. Frontend Setup:
\`\`\`bash
cd client
npm install
npm run dev
\`\`\`

2. Backend Setup:
\`\`\`bash
cd server
npm install
npm run dev
\`\`\`

3. Database Setup:
- Install PostgreSQL
- Create database 'jira_clone'
- Update .env file with your database credentials
- Run migrations: \`npm run prisma:migrate\`

## Project Structure
\`\`\`
.
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom hooks
│   │   └── services/     # API services
│   └── package.json
├── server/                # Backend application
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Express middleware
│   │   ├── routes/      # API routes
│   │   └── services/    # Business logic
│   ├── prisma/          # Database schema and migrations
│   └── package.json
├── docker-compose.yml    # Docker compose configuration
└── README.md            # Project documentation
\`\`\`

## Environment Variables

### Backend (.env)
\`\`\`
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@db:5432/jira_clone
JWT_SECRET=your-super-secret-key-change-in-production
\`\`\`

### Frontend (.env)
\`\`\`
VITE_API_URL=http://localhost:3000/api
\`\`\`

## API Documentation

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user

### Projects
- GET /api/projects - Get all projects
- POST /api/projects - Create new project
- GET /api/projects/:id - Get project by ID
- PATCH /api/projects/:id - Update project

### Boards
- GET /api/boards/project/:projectId - Get project board
- PATCH /api/boards/:id - Update board
- PATCH /api/boards/:boardId/columns/order - Update column order

### Tasks
- POST /api/tasks - Create new task
- PATCH /api/tasks/:id - Update task
- DELETE /api/tasks/:id - Delete task

### Time Entries
- GET /api/time-entries - Get user's time entries
- POST /api/time-entries - Create time entry
- PATCH /api/time-entries/:id - Update time entry
- DELETE /api/time-entries/:id - Delete time entry

## Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
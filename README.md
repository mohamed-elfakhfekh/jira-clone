# Yajoura - Project Management Tool

Yajoura is a modern, full-featured project management application built with React and Node.js. It provides teams with powerful tools for task management, collaboration, and project tracking.

## Features

- **Project Management**
  - Create and manage multiple projects
  - Customize project settings and access controls
  - Track project progress and milestones

- **Task Management**
  - Drag-and-drop Kanban board interface
  - Create, edit, and organize tasks
  - Set task priorities and deadlines
  - Assign tasks to team members
  - Real-time task updates

- **Time Tracking**
  - Log time spent on tasks
  - View time reports by project or user
  - Weekly timesheet view
  - Track project time budgets

- **Team Collaboration**
  - Add team members to projects
  - Real-time updates and notifications
  - Comment and discuss tasks
  - Share files and attachments

## Tech Stack

### Frontend
- React 18
- React Router for navigation
- React Query for state management
- Tailwind CSS for styling
- Headless UI for accessible components
- Axios for API communication

### Backend
- Node.js
- Express.js
- Prisma ORM
- PostgreSQL database
- JWT authentication
- RESTful API architecture

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/yajoura.git
cd yajoura
```

2. Install dependencies:
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

3. Set up environment variables:
```bash
# In server directory
cp .env.example .env
# Update .env with your database credentials and JWT secret

# In client directory
cp .env.example .env
# Update .env with your API URL
```

4. Set up the database:
```bash
cd server
npx prisma migrate dev
```

5. Start the development servers:
```bash
# Start backend server (from server directory)
npm run dev

# Start frontend server (from client directory)
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Development

### Project Structure
```
yajoura/
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API and other services
│   │   └── hooks/       # Custom React hooks
│   └── public/          # Static assets
└── server/              # Backend Node.js application
    ├── src/
    │   ├── controllers/ # Route controllers
    │   ├── middleware/  # Express middleware
    │   ├── services/    # Business logic
    │   └── routes/      # API routes
    └── prisma/          # Database schema and migrations
```

### API Documentation

The API documentation is available at `/api-docs` when running the server in development mode.

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@yajoura.com or open an issue in the GitHub repository.

## Acknowledgments

- Thanks to all contributors who have helped shape Yajoura
- Built with modern web technologies and best practices
- Inspired by popular project management tools while adding unique features# yajoura-solution

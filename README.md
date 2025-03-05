# Deepseek UI Designer

A modern web application that generates UI designs using AI, built with React, Express, and TypeScript. Transform your design ideas into reality with AI-powered UI generation.

## 🌟 Features

- AI-powered UI design generation using DeepSeek API
- Real-time code generation with streaming responses
- Modern React frontend with Tailwind CSS and Radix UI
- Type-safe backend with Express and TypeScript
- PostgreSQL database with Drizzle ORM
- Docker support for easy development and deployment

## 🚀 Quick Start

### Prerequisites

- Node.js 20 or higher
- Docker and Docker Compose (optional)
- PostgreSQL (if running without Docker)

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/nisila-perera/Deepseek-UI-Designer
cd deepseek-ui-designer
```

2. Create a `.env` file in the root directory:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/my-db
DEEPSEEK_API_KEY=your_api_key_here
```

### Running Locally

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

### Using Docker

1. Start the application with Docker Compose:
```bash
docker-compose up --build
```

The application will be available at `http://localhost:5000`

## 🛠️ Development

### Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── lib/
│   │   └── main.tsx
├── server/
│   ├── routes.ts
│   └── index.ts
├── shared/
│   └── schema.ts
└── docker-compose.yml
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type check with TypeScript
- `npm run db:push` - Push database schema changes

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Run tests and ensure code quality
5. Commit your changes: `git commit -m 'Add some feature'`
6. Push to the branch: `git push origin feature/your-feature-name`
7. Submit a pull request

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Update documentation as needed

## 📝 API Documentation

### Generate Design

```typescript
POST /api/design/generate
Content-Type: application/json

{
  "prompt": "string",
  "negativePrompt": "string",
  "styles": {
    "modern": boolean,
    // ... other style preferences
  }
}
```

Response: Server-Sent Events (SSE) stream with design generation progress.

## 🔧 Configuration

The application can be configured through environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `DEEPSEEK_API_KEY`: API key for DeepSeek AI
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)

## 🚀 Deployment

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm run start
```

### Docker Deployment

```bash
# Build production image
docker build -t ai-ui-designer .

# Run container
docker run -p 5000:5000 ai-ui-designer
```

## 📦 Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Radix UI
- **Backend**: Express, TypeScript
- **Database**: PostgreSQL, Drizzle ORM
- **AI**: DeepSeek API
- **DevOps**: Docker, Docker Compose

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Radix UI](https://www.radix-ui.com/) for accessible UI components
- [DeepSeek](https://deepseek.com/) for AI capabilities
- All contributors who help improve this project

---

Made with ❤️ by [Nisila Perera](https://github.com/nisila-perera)

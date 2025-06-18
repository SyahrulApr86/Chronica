# Chronica

A modern, elegant calendar application built with Next.js and NestJS that revolutionizes how you manage your time and schedule events.

## Features

### Core Functionality
- **Event Management**: Create, edit, and delete events with customizable colors and descriptions
- **Calendar Views**: Interactive monthly calendar with intuitive date selection
- **All-Day Events**: Support for both timed and all-day events
- **Real-time Statistics**: Monthly event count and total duration tracking
- **Event Indicators**: Visual dots on calendar dates showing event presence

### User Experience
- **Modern UI**: Glass morphism design with gradient backgrounds and smooth animations
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Authentication**: Secure user registration and login system
- **Real-time Updates**: Instant synchronization of events across sessions
- **Indonesian Localization**: Full support for Indonesian language and date formats

### Technical Features
- **RESTful API**: Clean API architecture with proper error handling
- **Database Integration**: PostgreSQL with Prisma ORM
- **JWT Authentication**: Secure token-based authentication
- **Type Safety**: Full TypeScript implementation
- **Modern Stack**: Latest versions of Next.js 15 and NestJS

## Technology Stack

### Frontend
- **Next.js 15.3.3**: React framework with App Router
- **TypeScript**: Type-safe JavaScript development
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Zustand**: Lightweight state management
- **date-fns**: Modern date utility library
- **Lucide React**: Beautiful icon library

### Backend
- **NestJS**: Progressive Node.js framework
- **TypeScript**: Type-safe server development
- **Prisma**: Next-generation ORM
- **PostgreSQL**: Reliable relational database
- **JWT**: JSON Web Token authentication
- **bcrypt**: Password hashing
- **class-validator**: Validation decorators

## Project Structure

```
Chronica/
├── chronica-frontend/          # Next.js frontend application
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   ├── components/        # React components
│   │   │   ├── ui/           # Reusable UI components
│   │   │   ├── AuthDialog.tsx
│   │   │   ├── Calendar.tsx
│   │   │   ├── EventDialog.tsx
│   │   │   └── EventList.tsx
│   │   ├── lib/              # Utility functions
│   │   └── store/            # State management
│   ├── public/               # Static assets
│   └── package.json
├── chronica-backend/           # NestJS backend application
│   ├── src/
│   │   ├── auth/             # Authentication module
│   │   ├── events/           # Events module
│   │   ├── prisma.service.ts # Database service
│   │   └── main.ts
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18.0 or higher
- npm or yarn package manager
- PostgreSQL database

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/Chronica.git
   cd Chronica
   ```

2. **Setup Backend**
   ```bash
   cd chronica-backend
   npm install
   ```

3. **Configure Environment Variables**
   Create `.env` file in `chronica-backend/`:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/chronica"
   JWT_SECRET="your-secret-key"
   ```

4. **Setup Database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start Backend Server**
   ```bash
   npm run start:dev
   ```

6. **Setup Frontend**
   ```bash
   cd ../chronica-frontend
   npm install
   ```

7. **Configure Frontend Environment**
   Create `.env.local` file in `chronica-frontend/`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

8. **Start Frontend Development Server**
   ```bash
   npm run dev
   ```

9. **Access Application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## API Documentation

### Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### Event Endpoints
- `GET /events` - Get user events (with date range query)
- `POST /events` - Create new event
- `PUT /events/:id` - Update event
- `DELETE /events/:id` - Delete event

### Request/Response Examples

**Create Event:**
```json
POST /events
{
  "title": "Team Meeting",
  "description": "Weekly team sync",
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T11:00:00Z",
  "color": "#3B82F6",
  "allDay": false
}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Team Meeting",
  "description": "Weekly team sync",
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T11:00:00Z",
  "color": "#3B82F6",
  "allDay": false,
  "userId": "user-uuid",
  "createdAt": "2024-01-15T09:00:00Z",
  "updatedAt": "2024-01-15T09:00:00Z"
}
```

## Database Schema

### Users Table
- `id`: UUID primary key
- `username`: Unique username
- `email`: User email address
- `password`: Hashed password
- `name`: Display name
- `createdAt`: Creation timestamp
- `updatedAt`: Update timestamp

### Events Table
- `id`: UUID primary key
- `title`: Event title
- `description`: Event description (optional)
- `startTime`: Event start time
- `endTime`: Event end time
- `color`: Event color (hex)
- `allDay`: Boolean for all-day events
- `userId`: Foreign key to users
- `createdAt`: Creation timestamp
- `updatedAt`: Update timestamp

## Development

### Available Scripts

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

**Backend:**
- `npm run start:dev` - Start development server
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm run test` - Run tests

### Code Style
- ESLint configuration for consistent code style
- TypeScript strict mode enabled
- Prettier for code formatting

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Railway/Heroku)
1. Create new application
2. Connect to GitHub repository
3. Set environment variables
4. Configure PostgreSQL database
5. Deploy

### Environment Variables for Production
**Frontend:**
- `NEXT_PUBLIC_API_URL`: Backend API URL

**Backend:**
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: JWT signing secret
- `PORT`: Server port (optional)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure responsive design compatibility

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:
1. Check existing [Issues](https://github.com/your-username/Chronica/issues)
2. Create a new issue with detailed description
3. Include steps to reproduce the problem

## Acknowledgments

- Built with modern web technologies
- Inspired by clean design principles
- Community-driven development approach 
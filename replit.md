# Nocturne - Night Owl Social Platform

## Overview

Nocturne is a social platform designed for night owls, insomniacs, and deep thinkers who are active during late-night hours. It provides a digital sanctuary for meaningful conversations, anonymous sharing, and authentic connections when the world sleeps.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with custom CSS variables for dark theme
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Supports both Replit Auth and Firebase Auth
- **Real-time Communication**: WebSocket implementation for live chat features
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple

### Key Components

#### Database Schema
The application uses PostgreSQL with the following main tables:
- **Users**: Supports both Firebase UID and Replit Auth IDs
- **Sessions**: For session management
- **Diaries**: Personal journal entries with privacy controls
- **Whispers**: Anonymous short messages
- **MindMaze**: Philosophical discussions and brain teasers
- **NightCircles**: Group conversation rooms
- **MidnightCafe**: Casual chat discussions
- **AmFounder**: 3AM entrepreneur insights
- **StarlitSpeaker**: Voice/speech sharing platform
- **MoonMessenger**: Private messaging system

#### Authentication System
- **Dual Support**: Both Replit Auth (primary) and Firebase Auth (deployment)
- **Session Storage**: PostgreSQL-backed sessions
- **User Management**: Unified user model supporting both auth providers

#### Real-time Features
- **WebSocket Manager**: Handles real-time chat, random pairing, and voice sessions
- **Room Management**: Support for both private and public chat rooms
- **Random Pairing**: Anonymous chat matching system

#### Privacy and Safety
- **Privacy Controls**: Granular privacy settings for content
- **Reporting System**: Built-in content moderation tools
- **Anonymous Options**: Support for anonymous posting

## Data Flow

1. **Authentication**: Users authenticate via Replit Auth or Firebase Auth
2. **Session Management**: Sessions stored in PostgreSQL with automatic cleanup
3. **Content Creation**: Users create content through React forms validated with Zod
4. **Real-time Updates**: WebSocket connections for live features
5. **Data Persistence**: All data stored in PostgreSQL via Drizzle ORM

## External Dependencies

### Database
- **Primary**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with automatic migrations
- **Connection**: @neondatabase/serverless for serverless PostgreSQL

### Authentication
- **Replit Auth**: OpenID Connect with passport integration
- **Firebase Auth**: Google Sign-In for deployment scenarios

### UI Framework
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library

### Real-time Communication
- **WebSocket**: Native WebSocket implementation
- **Media**: WebRTC for voice/video features (planned)

## Deployment Strategy

### Development Environment
- **Replit**: Primary development platform with hot reload
- **Local Development**: Vite dev server with Express backend
- **Database**: Neon PostgreSQL with connection pooling

### Production Deployment

#### Firebase Hosting (Preferred)
- **Static Assets**: Served via Firebase Hosting
- **API**: Firebase Functions for serverless backend
- **Configuration**: Separate Firebase config and build process
- **Environment**: Environment variables managed through Firebase

#### Alternative Deployment
- **Static Build**: Vite production build
- **Server**: Express server with static file serving
- **Database**: Production PostgreSQL instance

### Build Process
- **Development**: `npm run dev` - Hot reload with TypeScript
- **Production**: `npm run build` - Optimized build with code splitting
- **Database**: `npm run db:push` - Schema synchronization

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 02, 2025. Initial setup
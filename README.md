# 48ID-web Admin Portal

A modern, secure web-based administration interface for the 48ID identity provider system built with Next.js 16.

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript (strict mode enabled)
- **Package Manager**: pnpm
- **UI Framework**: TailwindCSS v4
- **Code Quality**: ESLint + Prettier
- **Development**: Hot reload, type checking, linting

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (configured as package manager)

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

### Development Scripts

```bash
# Development
pnpm dev                 # Start development server
pnpm build              # Build for production
pnpm start              # Start production server

# Code Quality
pnpm lint               # Run ESLint with auto-fix
pnpm lint:check         # Run ESLint without fixing
pnpm format             # Format code with Prettier
pnpm format:check       # Check code formatting
pnpm type-check         # Run TypeScript type checking
```

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
└── ...                 # Additional directories will be added
```

## Configuration

- **TypeScript**: Strict mode enabled with additional safety checks
- **ESLint**: Next.js recommended rules + Prettier integration
- **Prettier**: Consistent code formatting with Tailwind CSS class sorting
- **TailwindCSS**: v4 with PostCSS integration

## Requirements Fulfilled

- ✅ Next.js 16 with App Router
- ✅ TypeScript with strict mode enabled
- ✅ pnpm as package manager
- ✅ ESLint configuration for code quality
- ✅ Prettier configuration for code formatting
- ✅ TailwindCSS v4 integration
- ✅ All tools working together seamlessly

## Next Steps

This project is ready for Sprint 1 development tasks including:

- Authentication system implementation
- Admin dashboard development
- User management features
- CSV provisioning system
- Audit logging and API key management

---

_Part of the 48ID identity provider ecosystem_

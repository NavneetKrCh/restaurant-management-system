# Restaurant Management System - Local Setup Guide

This guide provides detailed instructions for setting up and running the Restaurant Management System locally using Visual Studio Code.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software
- **Node.js** (version 18.0 or higher)
  - Download from: https://nodejs.org/
  - Verify installation: `node --version`
- **npm** (comes with Node.js) or **yarn**
  - Verify npm: `npm --version`
- **Git** (for version control)
  - Download from: https://git-scm.com/
- **Visual Studio Code**
  - Download from: https://code.visualstudio.com/

### Recommended VS Code Extensions
Install these extensions for the best development experience:
- **ES7+ React/Redux/React-Native snippets** (dsznajder.es7-react-js-snippets)
- **Tailwind CSS IntelliSense** (bradlc.vscode-tailwindcss)
- **TypeScript Importer** (pmneo.tsimporter)
- **Auto Rename Tag** (formulahendry.auto-rename-tag)
- **Prettier - Code formatter** (esbenp.prettier-vscode)
- **ESLint** (dbaeumer.vscode-eslint)
- **GitLens** (eamodio.gitlens)

## Project Setup

### 1. Clone or Download the Project

If using Git:
\`\`\`bash
git clone <repository-url>
cd restaurant-management-system
\`\`\`

If downloading as ZIP:
1. Extract the ZIP file
2. Navigate to the extracted folder

### 2. Open in Visual Studio Code

\`\`\`bash
code .
\`\`\`

Or open VS Code and use `File > Open Folder` to select the project directory.

### 3. Install Dependencies

Open the integrated terminal in VS Code (`Terminal > New Terminal` or `Ctrl+``) and run:

\`\`\`bash
npm install
\`\`\`

This will install all required dependencies listed in `package.json`.

### 4. Environment Setup (Optional)

Create a `.env.local` file in the root directory for environment variables:

\`\`\`bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
\`\`\`

## Running the Application

### Development Mode

In the VS Code terminal, run:

\`\`\`bash
npm run dev
\`\`\`

This will:
- Start the Next.js development server
- Enable hot reloading
- Open the application at `http://localhost:3000`

### Production Build

To test the production build locally:

\`\`\`bash
npm run build
npm start
\`\`\`

## Project Structure

\`\`\`
restaurant-management-system/
├── app/                    # Next.js 14 App Router
│   ├── analytics/         # Analytics dashboard
│   ├── api/              # API routes
│   ├── inventory/        # Inventory management
│   ├── kitchen/          # Kitchen dashboard
│   ├── orders/           # Order processing
│   ├── predictions/      # AI predictions
│   ├── reports/          # Detailed reports
│   ├── settings/         # Application settings
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components
│   ├── header.tsx        # Header component
│   ├── navigation.tsx    # Navigation component
│   ├── sidebar.tsx       # Sidebar component
│   └── theme-provider.tsx # Theme provider
├── lib/                  # Utility libraries
│   ├── api.ts           # API functions
│   ├── pdf-export.ts    # PDF export utilities
│   ├── store.ts         # Zustand store
│   └── utils.ts         # General utilities
├── public/              # Static assets
├── .env.local          # Environment variables (create this)
├── next.config.js      # Next.js configuration
├── package.json        # Dependencies and scripts
├── tailwind.config.ts  # Tailwind CSS configuration
└── tsconfig.json       # TypeScript configuration
\`\`\`

## Key Dependencies

### Core Framework
- **Next.js 14**: React framework with App Router
- **React 18**: UI library
- **TypeScript**: Type safety

### UI Components
- **shadcn/ui**: Pre-built accessible components
- **Radix UI**: Primitive components
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### Charts and Visualization
- **Recharts**: Chart library for React
- **html2canvas**: HTML to canvas conversion
- **jsPDF**: PDF generation

### State Management
- **Zustand**: Lightweight state management

### Utilities
- **date-fns**: Date manipulation
- **clsx**: Conditional class names
- **class-variance-authority**: Component variants

## Development Workflow

### 1. VS Code Setup
1. Open the project in VS Code
2. Install recommended extensions when prompted
3. Configure VS Code settings (optional):
   \`\`\`json
   // .vscode/settings.json
   {
     "editor.formatOnSave": true,
     "editor.defaultFormatter": "esbenp.prettier-vscode",
     "typescript.preferences.importModuleSpecifier": "relative"
   }
   \`\`\`

### 2. Running the Development Server
\`\`\`bash
npm run dev
\`\`\`

### 3. Making Changes
- Edit files in the `app/`, `components/`, or `lib/` directories
- Changes will automatically reload in the browser
- TypeScript errors will appear in the VS Code Problems panel

### 4. Adding New Features
1. Create new components in `components/`
2. Add new pages in `app/`
3. Update the navigation in `components/navigation.tsx`
4. Add API routes in `app/api/`

## Features Overview

### Core Functionality
- **Dashboard**: Overview of key metrics and quick actions
- **Inventory Management**: Track ingredients and dishes
- **Order Processing**: Handle customer orders
- **Analytics**: 15-day sales analysis with charts
- **Predictions**: AI-powered demand forecasting
- **Kitchen Dashboard**: Real-time preparation tasks
- **Reports**: Comprehensive reporting with PDF export

### Technical Features
- **Dark/Light Mode**: Theme switching
- **Responsive Design**: Mobile-friendly interface
- **PDF Export**: Generate professional reports
- **Chart Interactions**: Hover tooltips and data visualization
- **Local Storage**: Data persistence
- **Type Safety**: Full TypeScript support

## Troubleshooting

### Common Issues

1. **Port 3000 already in use**
   \`\`\`bash
   # Kill the process using port 3000
   npx kill-port 3000
   # Or use a different port
   npm run dev -- -p 3001
   \`\`\`

2. **Module not found errors**
   \`\`\`bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   \`\`\`

3. **TypeScript errors**
   - Check the Problems panel in VS Code
   - Ensure all imports are correct
   - Restart the TypeScript server: `Ctrl+Shift+P` > "TypeScript: Restart TS Server"

4. **Charts not displaying**
   - Ensure all chart dependencies are installed
   - Check browser console for errors
   - Verify data format matches chart expectations

### Performance Tips
- Use the React Developer Tools browser extension
- Monitor bundle size with `npm run build`
- Optimize images and assets
- Use lazy loading for heavy components

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy automatically

### Other Platforms
- **Netlify**: Connect GitHub repository
- **Railway**: Deploy with Git integration
- **Self-hosted**: Use `npm run build` and serve the `out` directory

## Support

For issues and questions:
1. Check this setup guide
2. Review the troubleshooting section
3. Check the browser console for errors
4. Ensure all dependencies are properly installed

## Development Commands

\`\`\`bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Install new dependency
npm install <package-name>

# Install new dev dependency
npm install -D <package-name>
\`\`\`

## Next Steps

After setup:
1. Explore the application features
2. Review the code structure
3. Customize the theme and styling
4. Add your own data and business logic
5. Deploy to your preferred platform

The application is now ready for development and customization!

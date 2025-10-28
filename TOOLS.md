# Code Quality Tools Setup

This project uses several tools to ensure code quality and consistency:

## Formatting (Prettier)

We use Prettier to automatically format all code files to maintain consistency.

### Configuration

- [.prettierrc](file:///Users/enisgjini/Desktop/ar-js-prototype/.prettierrc): Contains formatting rules
- [.prettierignore](file:///Users/enisgjini/Desktop/ar-js-prototype/.prettierignore): Specifies files that should not be formatted

### Commands

- `pnpm run format`: Automatically format all files
- `pnpm run format:check`: Check if files are properly formatted

## Type Checking (TypeScript)

TypeScript provides static type checking to catch errors before runtime.

### Command

- `pnpm run type-check`: Run TypeScript compiler without emitting files

## Linting (ESLint)

ESLint is used to identify and fix potential issues in the code.

### Command

- `pnpm run lint`: Check for linting issues
- `pnpm run lint:fix`: Automatically fix linting issues where possible

## Build Process (Next.js)

Next.js handles the build process, including optimization and bundling.

### Command

- `pnpm run build`: Create an optimized production build

## Convenience Scripts

We've also set up some convenience scripts that combine multiple operations:

- `pnpm run check`: Run formatting check, linting, and type checking
- `pnpm run fix`: Automatically fix formatting and linting issues

## Usage

For development:

1. Run `pnpm run dev` to start the development server
2. Use `pnpm run check` before committing to ensure code quality
3. Use `pnpm run fix` to automatically fix common issues

For production:

1. Run `pnpm run build` to create an optimized build
2. Run `pnpm run start` to start the production server

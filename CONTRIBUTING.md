# Contributing to AR.js Cultural Experience

Thank you for your interest in contributing to the AR.js Cultural Experience project! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)
- [Style Guides](#style-guides)

## Code of Conduct

This project adheres to a Code of Conduct adapted from the [Contributor Covenant](https://www.contributor-covenant.org/). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/ar-js-prototype.git`
3. Create a branch for your feature or bugfix: `git checkout -b feature/your-feature-name`
4. Install dependencies: `pnpm install`
5. Copy Cesium assets: `pnpm run copy-cesium-assets`
6. Start the development server: `pnpm dev`

## Development Workflow

### Branch Naming Convention

- Features: `feature/feature-name`
- Bug fixes: `fix/bug-name`
- Documentation: `docs/doc-name`
- Refactoring: `refactor/refactor-name`

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification:

```
type(scope): description

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semi colons, etc)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Example:
```
feat(audio): add playback speed control

Add ability to adjust audio playback speed for better accessibility

Closes #123
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode in [tsconfig.json](tsconfig.json)
- Provide explicit types for function parameters and return values
- Use interfaces for object shapes
- Use types for unions and primitives

### React

- Use functional components with hooks
- Prefer custom hooks for reusable logic
- Use TypeScript interfaces for component props
- Follow the [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/) guidelines

### Styling

- Use Tailwind CSS for styling
- Follow the utility-first approach
- Use shadcn/ui components when possible
- Maintain consistent spacing and typography

### Internationalization

- Externalize all user-facing strings
- Use the `useT()` hook for translations
- Add new strings to both [en.json](locales/en.json) and [de.json](locales/de.json)
- Follow the existing translation key structure

## Pull Request Process

1. Ensure your code follows the coding standards
2. Run all quality checks: `pnpm run check`
3. Fix any issues identified by the checks
4. Write clear, descriptive commit messages
5. Push your branch to your fork
6. Create a pull request against the main branch
7. Link any related issues in the PR description
8. Request review from maintainers

### Pull Request Requirements

- All tests must pass
- Code must follow established patterns and conventions
- Documentation must be updated if applicable
- Changes must be reviewed by at least one maintainer
- PR must be up to date with the target branch

### PR Description Template

```markdown
## Description

Brief description of the changes.

## Related Issue

Fixes #issue-number

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?

Description of testing procedures.

## Checklist

- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

## Reporting Issues

### Before Submitting an Issue

1. Check if the issue already exists
2. Try reproducing the issue in the latest version
3. Ensure you're using supported browsers and devices

### Issue Templates

#### Bug Report

```markdown
## Description
Clear and concise description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
Description of what you expected to happen.

## Actual Behavior
Description of what actually happened.

## Screenshots
If applicable, add screenshots to help explain your problem.

## Environment
- OS: [e.g. iOS, Windows]
- Browser [e.g. chrome, safari]
- Version [e.g. 22]
- Device: [e.g. iPhone6, desktop]

## Additional Context
Add any other context about the problem here.
```

#### Feature Request

```markdown
## Problem Statement
Clear description of the problem this feature would solve.

## Proposed Solution
Description of what you want to happen.

## Alternatives Considered
Description of any alternative solutions or features you've considered.

## Additional Context
Add any other context or screenshots about the feature request here.
```

## Style Guides

### Git

- Write descriptive commit messages in present tense
- Keep commits focused on a single change
- Squash related commits before merging
- Rebase on main branch before submitting PR

### CSS/Tailwind

- Use Tailwind utility classes primarily
- Extract repetitive patterns into components
- Use consistent spacing (multiples of 4px)
- Follow the established color palette

### Directory Structure

```
components/
  ui/           # Reusable UI components
  feature/      # Feature-specific components
lib/            # Utility functions and hooks
locales/        # Translation files
public/         # Static assets
```

### File Naming

- Use kebab-case for file names
- Use PascalCase for React components
- Use descriptive names that reflect the component's purpose

### Comments

- Comment complex logic with explanations
- Use JSDoc for function documentation
- Keep comments up to date with code changes
- Remove outdated comments

## Getting Help

If you need help with your contribution:

1. Check the documentation in [README.md](README.md)
2. Look at existing code for examples
3. Join our community discussions
4. Contact the maintainers directly

Thank you for contributing to AR.js Cultural Experience!
# AR Cultural Experience Prototype

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/enisenisnisis-projects/v0-ar-js-prototype)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/Bfpqj2zfCAj)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Cesium](https://img.shields.io/badge/Cesium-1.134-green?style=flat&logo=cesium)](https://cesium.com/)

> An immersive cultural experience prototype that combines audio guides with augmented reality (AR) and geolocation services, demonstrating how modern web technologies can enhance cultural and historical site visits through interactive 3D content and multilingual support.

## ✨ Key Features

### 🔐 **Admin Panel** (NEW!)

- Complete authentication system (Email/Password + Google OAuth)
- Voice file management with upload, edit, and delete
- Supabase Storage integration for audio files
- Active/inactive voice toggle
- Audio preview and playback
- Public API endpoint for active voices
- Beautiful sidebar dashboard with statistics
- **[Setup Guide](START_HERE.md)** | **[Documentation](ADMIN_PANEL_OVERVIEW.md)**

### 🎧 **Audio Guide Experience**

- Immersive location-based audio narratives
- Cultural and historical information delivery
- Background audio playback across app sections
- Interactive play/pause/reset controls

### 📷 **Augmented Reality Visualization**

- 3D reconstructions of historical monuments
- GPS-based positioning of virtual objects
- Cesium-powered geospatial visualization
- Multiple model options (Air, Man, Balloon, Drone, Ground Vehicle, etc.)

### 🌍 **Geolocation Services**

- Real-time location tracking and display
- Geolocation testing and troubleshooting tools
- GPS coordinate integration with AR content

### 🌐 **Multilingual Support**

- 🇺🇸 **English** (Default)
- 🇩🇪 **German** (Deutsch)
- Real-time language switching without page reload
- Fully internationalized user interface

### 🎨 **Modern UI/UX**

- 🌙 Dark/Light theme switching with system preference detection
- 📱 Fully responsive design for all device sizes
- 🎯 Intuitive navigation between audio and AR views
- ⚡ Fast, performant web application

## 🎯 Live Demo

🌐 **[View Live Demo](https://vercel.com/enisenisnisis-projects/v0-ar-js-prototype)**

_Try the immersive AR experience directly in your browser! The demo includes sample audio guides and 3D visualizations positioned at real GPS coordinates in Düsseldorf, Germany._

### Screenshots

|                 Audio Guide View                 |            AR Visualization             |          Mobile Experience           |
| :----------------------------------------------: | :-------------------------------------: | :----------------------------------: |
|      ![Audio Guide](public/placeholder.jpg)      |   ![AR View](public/placeholder.jpg)    |  ![Mobile](public/placeholder.jpg)   |
| Cultural audio experience with immersive content | 3D models positioned at GPS coordinates | Responsive design across all devices |

## 🛠️ Technology Stack

### Core Framework

- **[Next.js 15](https://nextjs.org/)** - React framework with App Router and server components
- **[React 19](https://react.dev/)** - UI library with concurrent features
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type-safe JavaScript with advanced features

### 3D & AR Technologies

- **[Cesium 1.134](https://cesium.com/)** - Advanced geospatial visualization engine
- **[Babylon.js](https://www.babylonjs.com/)** - Powerful 3D engine for web experiences
- **[Resium](https://resium.reearth.io/)** - React components for Cesium

### UI & Styling

- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Shadcn/ui](https://ui.shadcn.com/)** - High-quality React component library
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible UI primitives
- **[Lucide React](https://lucide.dev/)** - Beautiful & consistent icon library

### Development Tools

- **[ESLint](https://eslint.org/)** - Code linting and formatting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Vercel](https://vercel.com/)** - Deployment and hosting platform
- **[v0.app](https://v0.app)** - AI-powered React development

### Additional Libraries

- **[Next Themes](https://github.com/pacocoursey/next-themes)** - Theme switching for Next.js
- **[React Hook Form](https://react-hook-form.com/)** - Performant forms with validation
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation
- **[@vercel/analytics](https://vercel.com/analytics)** - Web analytics

## 📁 Project Structure

```
ar-js-prototype/
├── 📁 app/                          # Next.js 15 App Router directory
│   ├── globals.css                  # Global styles and Tailwind imports
│   ├── layout.tsx                   # Root layout component
│   └── page.tsx                     # Main application page
├── 📁 components/                   # React components
│   ├── __tests__/                   # Component test files
│   ├── ui/                          # Shadcn/ui reusable components
│   │   ├── button.tsx              # Button component
│   │   ├── card.tsx                # Card component
│   │   └── ...                     # Other UI components
│   ├── audio-guide-view.tsx        # Audio guide interface
│   ├── cesium-ar-view.tsx          # AR visualization component
│   ├── navigation.tsx              # App navigation
│   └── theme-provider.tsx          # Theme context provider
├── 📁 lib/                          # Utility functions and configurations
│   ├── locale.tsx                  # Internationalization utilities
│   └── utils.ts                    # General utility functions
├── 📁 locales/                      # Translation files
│   ├── en.json                     # English translations
│   └── de.json                     # German translations
├── 📁 public/                       # Static assets
│   ├── cesium/                     # Cesium.js assets and widgets
│   │   ├── Assets/                 # Cesium terrain and imagery
│   │   ├── Cesium.js               # Main Cesium library
│   │   └── Widgets/                # Cesium UI widgets
│   ├── models/                     # 3D model files (.glb)
│   └── sample-audio.mp3            # Audio guide sample
├── 📁 scripts/                      # Build and utility scripts
│   ├── copy-cesium-assets.js       # Cesium asset copying script
│   └── test-geolocation.js         # Geolocation testing utilities
├── 📁 types/                        # TypeScript type definitions
│   └── three.d.ts                  # Three.js type definitions
└── 📄 Configuration Files
    ├── next.config.mjs             # Next.js configuration
    ├── tailwind.config.mjs         # Tailwind CSS configuration
    ├── tsconfig.json               # TypeScript configuration
    ├── components.json             # Shadcn/ui configuration
    └── package.json                # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/)
- **pnpm** (recommended) or npm - [Install pnpm](https://pnpm.io/installation)
- **Git** - [Download from git-scm.com](https://git-scm.com/)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ar-js-prototype
   ```

2. **Install dependencies**

   ```bash
   # Using pnpm (recommended)
   pnpm install

   # Or using npm
   npm install
   ```

3. **Copy Cesium assets for local development**
   ```bash
   pnpm run copy-cesium-assets
   ```

### Development

Start the development server:

```bash
# Using pnpm
pnpm dev

# Or using npm
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Build & Production

1. **Create a production build**

   ```bash
   pnpm build
   ```

2. **Start the production server**
   ```bash
   pnpm start
   ```

### Quality Assurance

Run all quality checks:

```bash
# Run all checks (formatting, linting, type-checking)
pnpm check

# Fix formatting and linting issues automatically
pnpm fix

# Run TypeScript type checking only
pnpm type-check

# Run ESLint only
pnpm lint

# Format code with Prettier
pnpm format
```

## 🌐 Internationalization (i18n)

The application features comprehensive multilingual support with a custom i18n implementation:

### Current Languages

- 🇺🇸 **English** (`en.json`) - Default language
- 🇩🇪 **German** (`de.json`) - Complete German translation

### Key Features

- **Real-time switching** - Change language without page reload
- **Persistent preferences** - Language choice is remembered across sessions
- **Complete coverage** - All UI text, audio controls, and AR instructions translated
- **Extensible architecture** - Easy to add new languages

### File Structure

```
locales/
├── en.json    # English translations
└── de.json    # German translations
```

### Adding New Languages

1. **Create translation file**

   ```bash
   cp locales/en.json locales/fr.json
   ```

2. **Update translations**
   Edit `locales/fr.json` with French translations following the existing JSON structure.

3. **Register language**
   Update `lib/locale.tsx` to include the new language in the `locales` object.

4. **Add language switcher option**
   Update the language selector in `app/page.tsx` to include the new language option.

## 🔧 Troubleshooting

### Common Issues

#### Cesium AR View Not Loading

**Symptoms:** Black screen or error in AR view
**Solutions:**

- Ensure Cesium assets are copied: `pnpm run copy-cesium-assets`
- Check browser console for Cesium Ion access token errors
- Verify camera and location permissions are granted
- Try refreshing the page

#### Audio Not Playing

**Symptoms:** Audio controls don't work
**Solutions:**

- Check browser audio permissions
- Ensure `sample-audio.mp3` exists in `public/` directory
- Verify audio format compatibility (MP3 with WAV fallback)

#### Geolocation Errors

**Symptoms:** Location services not working
**Solutions:**

- Grant location permissions when prompted
- Enable GPS/location services on device
- Check if running on HTTPS (required for geolocation)
- Try the location testing tool in the app

#### Build Errors

**Symptoms:** Compilation fails
**Solutions:**

- Run `pnpm install` to ensure all dependencies are installed
- Clear node_modules: `rm -rf node_modules && pnpm install`
- Check TypeScript errors: `pnpm type-check`
- Verify Node.js version (18+ required)

#### Performance Issues

**Symptoms:** Slow loading or lag
**Solutions:**

- Ensure stable internet connection for Cesium assets
- Close other browser tabs to free memory
- Try in a different browser (Chrome recommended for WebGL)
- Check GPU acceleration is enabled

### Browser Compatibility

| Browser       | Audio Guide | AR View | Geolocation |
| ------------- | ----------- | ------- | ----------- |
| Chrome 90+    | ✅          | ✅      | ✅          |
| Firefox 88+   | ✅          | ✅      | ✅          |
| Safari 14+    | ✅          | ⚠️      | ✅          |
| Edge 90+      | ✅          | ✅      | ✅          |
| Mobile Safari | ✅          | ⚠️      | ✅          |
| Chrome Mobile | ✅          | ✅      | ✅          |

_⚠️ Limited WebGL support on some mobile browsers_

### Development Tips

- Use browser developer tools to inspect Cesium console logs
- Test on multiple devices for responsive design
- Use the location testing page for debugging GPS issues
- Check network tab for asset loading issues

## 📱 Features in Detail

### 🎧 Audio Guide System

The audio guide provides an immersive cultural experience with:

- **Location-based narratives** - Contextual historical information
- **Persistent playback** - Audio continues across app sections
- **Interactive controls** - Play, pause, and reset functionality
- **Fallback support** - WAV format for MP3-incompatible browsers
- **Multilingual content** - Translated audio guides available

### 📷 Augmented Reality Experience

The AR view showcases advanced geospatial visualization:

- **3D Model Library** - Multiple historical reconstructions (Air, Man, Balloon, Drone, Ground Vehicle, etc.)
- **GPS Positioning** - Models placed at real-world coordinates (Düsseldorf, Germany: 51.2117778°N, 6.2186944°E)
- **Cesium Integration** - High-performance 3D globe rendering
- **Camera Integration** - Device camera access for AR experiences
- **Interactive Controls** - Model selection and camera manipulation

### 🌍 Geolocation Services

Robust location functionality includes:

- **Real-time tracking** - Live GPS coordinate display
- **Permission handling** - Graceful permission request flow
- **Error recovery** - Comprehensive troubleshooting guidance
- **Testing tools** - Dedicated location testing interface
- **HTTPS requirement** - Secure context for geolocation API

### 🎨 User Experience

Modern UX features include:

- **Theme switching** - Automatic dark/light mode with manual override
- **Responsive design** - Optimized for mobile, tablet, and desktop
- **Accessibility** - ARIA labels, keyboard navigation, screen reader support
- **Performance** - Optimized loading and rendering
- **Progressive enhancement** - Graceful degradation on older browsers

## 🔧 Configuration

### Environment Variables

The application runs without environment variables for basic functionality. However, you can configure:

| Variable              | Description                                 | Default        |
| --------------------- | ------------------------------------------- | -------------- |
| `CESIUM_ION_TOKEN`    | Cesium Ion access token for terrain/imagery | Built-in token |
| `NEXT_PUBLIC_APP_URL` | Application base URL                        | Auto-detected  |

### Cesium Configuration

Cesium is configured in `components/cesium-ar-view.tsx`:

- **Base URL**: `/cesium` (copied assets)
- **Ion Token**: Pre-configured for development
- **Default Location**: Düsseldorf, Germany
- **Terrain**: World terrain enabled
- **Imagery**: Bing Maps imagery

### Build Configuration

Key build settings in `next.config.mjs`:

- **Experimental features** - App Router enabled
- **Image optimization** - Next.js image optimization
- **Asset copying** - Cesium assets automatically copied

## 🚀 Deployment

### Vercel (Recommended)

The application is optimized for [Vercel](https://vercel.com/) deployment:

1. **Connect repository** to Vercel
2. **Configure build settings**:
   - Build Command: `pnpm run build`
   - Output Directory: `.next`
   - Node.js Version: `18.x`
3. **Environment variables** (optional):
   - `CESIUM_ION_TOKEN`: Your Cesium Ion token (optional)
4. **Deploy** - Vercel handles the rest automatically

### Other Platforms

For deployment to other platforms:

1. **Build the application**: `pnpm build`
2. **Ensure Cesium assets are copied**: Assets are automatically copied during build
3. **Serve static files**: The `.next` directory contains the built application
4. **HTTPS required**: Geolocation API requires secure context

## 🤝 Contributing

We welcome contributions! This project follows a structured development process:

### Development Workflow

1. **Fork the repository**
2. **Clone your fork**:

   ```bash
   git clone https://github.com/your-username/ar-js-prototype.git
   cd ar-js-prototype
   ```

3. **Create a feature branch**:

   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes** and ensure:
   - Code follows TypeScript best practices
   - All tests pass: `pnpm check`
   - Code is formatted: `pnpm format`
   - No linting errors: `pnpm lint`

5. **Commit your changes**:

   ```bash
   git commit -m "feat: add your feature description"
   ```

6. **Push and create PR**:
   ```bash
   git push origin feature/your-feature-name
   ```

### Contribution Guidelines

- **Code Style**: Follow the existing TypeScript/React patterns
- **Commits**: Use conventional commit format (`feat:`, `fix:`, `docs:`, etc.)
- **Testing**: Test on multiple browsers and devices
- **Documentation**: Update README for new features
- **Accessibility**: Ensure WCAG 2.1 AA compliance

### Adding New Features

- **3D Models**: Place new `.glb` files in `public/models/`
- **Languages**: Follow the i18n guide above
- **Components**: Use Shadcn/ui components when possible
- **AR Content**: Test GPS coordinates thoroughly

## 📊 Project Metrics

| Metric            | Status                 |
| ----------------- | ---------------------- |
| **TypeScript**    | Strict mode enabled ✅ |
| **ESLint**        | Configured ✅          |
| **Prettier**      | Code formatting ✅     |
| **Responsive**    | Mobile-first ✅        |
| **Accessibility** | WCAG 2.1 AA ✅         |
| **Performance**   | Optimized ✅           |

## 📞 Support & Community

### Getting Help

- **📖 Documentation**: Check this README and project docs
- **🐛 Bug Reports**: [Open an issue](https://github.com/your-org/ar-js-prototype/issues)
- **💡 Feature Requests**: [Start a discussion](https://github.com/your-org/ar-js-prototype/discussions)
- **💬 General Chat**: [GitHub Discussions](https://github.com/your-org/ar-js-prototype/discussions)

### Contact

- **Project Maintainers**: See [CONTRIBUTING.md](CONTRIBUTING.md)
- **Security Issues**: See [SECURITY.md](SECURITY.md) (if exists)

## 🙏 Acknowledgments

### Core Technologies

- **[Next.js](https://nextjs.org/)** - The React framework that powers this application
- **[Cesium](https://cesium.com/)** - Advanced geospatial visualization
- **[Babylon.js](https://www.babylonjs.com/)** - Powerful 3D rendering engine
- **[Shadcn/ui](https://ui.shadcn.com/)** - Beautiful, accessible component library

### Development Tools

- **[v0.app](https://v0.app)** - AI-powered React development and prototyping
- **[Vercel](https://vercel.com/)** - Fast, reliable deployment platform
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework

### Community & Inspiration

- Cultural heritage institutions providing 3D models
- Open source geospatial community
- WebXR and AR development pioneers

---

<div align="center">

**Built with ❤️ using modern web technologies**

[🌐 Live Demo](https://vercel.com/enisenisnisis-projects/v0-ar-js-prototype) • [📖 Documentation](https://github.com/your-org/ar-js-prototype) • [🐛 Report Bug](https://github.com/your-org/ar-js-prototype/issues) • [💡 Request Feature](https://github.com/your-org/ar-js-prototype/discussions)

</div>

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

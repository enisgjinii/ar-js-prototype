# AR.js Cultural Experience Prototype

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/enisenisnisis-projects/v0-ar-js-prototype)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/Bfpqj2zfCAj)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

An immersive cultural experience combining audio guides with augmented reality (AR) and geolocation services. This prototype demonstrates how modern web technologies can enhance cultural and historical site visits through interactive 3D content and multilingual support.

## 🌍 Multilingual Support

The application is fully internationalized with support for multiple languages:

- 🇺🇸 **English** (Default)
- 🇩🇪 **German** (Deutsch)

Language can be switched in real-time using the language selector in the top-right corner of the application.

## 🚀 Features

- **🎧 Audio Guide**: Immersive audio experience with historical information
- **📷 Augmented Reality**: 3D reconstructions placed at real-world GPS coordinates
- **📍 Location Services**: Geolocation testing and integration
- **🌙 Dark/Light Theme**: Automatic theme switching with manual override
- **📱 Responsive Design**: Mobile-first approach with adaptive UI
- **🌐 Multilingual**: Full support for English and German with easy switching

## 🛠️ Technologies

- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[Babylon.js](https://www.babylonjs.com/)** - 3D engine for AR experiences
- **[Cesium/Resium](https://resium.reearth.io/)** - Geospatial visualization
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[TypeScript](https://www.typescriptlang.org/)** - Typed JavaScript
- **[Shadcn/ui](https://ui.shadcn.com/)** - Reusable component library
- **[React Hook Form](https://react-hook-form.com/)** - Form validation
- **[Zod](https://zod.dev/)** - Schema validation

## 📁 Project Structure

```
.
├── app/                 # Next.js app directory
├── components/          # React components
│   ├── ui/              # Reusable UI components
│   └── *.tsx            # Feature components
├── lib/                 # Utility functions and hooks
├── locales/             # Translation files (en.json, de.json)
├── public/cesium/       # Cesium static assets
├── scripts/             # Build scripts
└── types/               # TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ar-js-prototype

# Install dependencies
pnpm install

# Copy Cesium assets for local development
pnpm run copy-cesium-assets
```

### Development

```bash
# Start the development server
pnpm dev

# Open http://localhost:3000 in your browser
```

### Build

```bash
# Create a production build
pnpm build

# Start the production server
pnpm start
```

## 🌐 Internationalization (i18n)

The application supports multiple languages through a custom i18n implementation:

- Translation files are located in the [locales/](./locales/) directory
- Language switching is handled by the [LocaleProvider](./lib/locale.tsx)
- The UI automatically updates when the language is changed
- New languages can be added by creating additional JSON files in the locales directory

### Adding New Languages

1. Create a new JSON file in the [locales/](./locales/) directory (e.g., `fr.json`)
2. Add the corresponding language data following the existing structure
3. Update the [LocaleProvider](./lib/locale.tsx) to include the new language
4. Update the language switcher in [app/page.tsx](./app/page.tsx) to include the new option

## 🧪 Quality Assurance

```bash
# Run all checks (formatting, linting, type-checking)
pnpm check

# Fix formatting and linting issues
pnpm fix

# Run TypeScript type checking
pnpm type-check
```

## 📱 Features in Detail

### Audio Guide
- Immersive cultural experience with location-based audio content
- Play/pause controls for audio playback
- Information about historical sites and cultural significance

### AR View
- 3D reconstructions of historical monuments
- GPS-based positioning of virtual objects
- Camera access for augmented reality experience

### Location Testing
- Geolocation functionality testing
- Troubleshooting tips for location services
- Real-time location display with coordinates

## 🔧 Environment Variables

The application does not require any environment variables for basic functionality.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, please open an issue in the repository or contact the maintainers.

## 🙏 Acknowledgments

- Built with [v0.app](https://v0.app) - AI-powered React development
- Deployed on [Vercel](https://vercel.com/)
- 3D rendering powered by [Babylon.js](https://www.babylonjs.com/)
- Geospatial visualization with [Cesium](https://cesium.com/)
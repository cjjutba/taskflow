# WeatherDash 🌤️

A modern, professional weather dashboard built with React, TypeScript, and Tailwind CSS. Features real-time weather data, 5-day forecasts, and a responsive design optimized for all devices.

![WeatherDash Pro](https://img.shields.io/badge/React-18.3.3-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.11-blue?logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-5.4.1-purple?logo=vite)

## ✨ Features

### Core Weather Features
- **Real-time Weather Data** - Current conditions with live updates
- **5-Day Forecast** - Extended weather outlook with hourly details
- **Location Search** - Search cities worldwide with autocomplete
- **Current Location** - Automatic geolocation detection
- **Weather Metrics** - Detailed measurements (humidity, pressure, wind, UV index)

### User Experience
- **Split-Screen Layout** - Modern design with current weather and detailed metrics
- **Dark/Light Mode** - Seamless theme switching with system preference detection
- **Temperature Units** - Toggle between Celsius and Fahrenheit
- **Recent Searches** - Quick access to previously searched locations
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices

### Technical Features
- **Progressive Web App (PWA)** - Installable with offline capabilities
- **Performance Optimized** - Lazy loading, caching, and memory management
- **Accessibility** - ARIA labels, keyboard navigation, screen reader support
- **Error Handling** - Comprehensive error boundaries and user feedback
- **Local Storage** - Persistent settings and search history

## 🚀 Live Demo

[View Live Demo](https://weather-dashboard-v1.vercel.app/)

## 🛠️ Tech Stack

### Frontend
- **React 18.3.3** - Modern React with hooks and concurrent features
- **TypeScript 5.5.3** - Type-safe development
- **Tailwind CSS 3.4.11** - Utility-first styling
- **shadcn/ui** - High-quality component library
- **CSS Animations** - Smooth transitions and micro-interactions

### Build Tools & Development
- **Vite 5.4.1** - Fast build tool and dev server
- **Vitest** - Unit testing framework
- **ESLint & Prettier** - Code linting and formatting
- **Husky** - Git hooks for code quality

### APIs & Services
- **OpenWeatherMap API** - Weather data provider
- **Geolocation API** - Browser location services

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/christianjeraldjutba/weather-dashboard-v1.git
   cd weather-dashboard-v1
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_OPENWEATHER_API_KEY=your_api_key_here
   VITE_APP_NAME=WeatherDash Pro
   VITE_APP_VERSION=1.0.0
   ```

4. **Get OpenWeatherMap API Key**
   - Visit [OpenWeatherMap](https://openweathermap.org/api)
   - Sign up for a free account
   - Generate an API key
   - Add it to your `.env` file

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── WeatherDashboard.tsx
│   ├── CurrentWeatherCard.tsx
│   ├── ForecastCard.tsx
│   └── ...
├── hooks/              # Custom React hooks
├── services/           # API services and data fetching
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── constants/          # App constants and configuration
└── assets/             # Static assets
```

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## 🚀 Build & Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check
```

## 📱 PWA Features

WeatherDash Pro is a Progressive Web App with:
- **Offline Support** - Cached weather data when offline
- **Install Prompt** - Add to home screen on mobile/desktop
- **Background Sync** - Updates when connection is restored
- **Push Notifications** - Weather alerts (optional)

## 🎨 Design System

### Color Palette
- **Primary**: Blue tones for weather elements
- **Secondary**: Slate/gray for text and backgrounds
- **Accent**: Indigo for interactive elements
- **Status**: Green (success), Red (error), Yellow (warning)

### Typography
- **Headings**: Inter font family
- **Body**: System font stack for optimal performance
- **Monospace**: For data display

## 🔧 Configuration

### Environment Variables
```env
VITE_OPENWEATHER_API_KEY=     # Required: OpenWeatherMap API key
VITE_APP_NAME=                # Optional: App name
VITE_APP_VERSION=             # Optional: App version
VITE_WEATHER_CACHE_DURATION=  # Optional: Cache duration (ms)
VITE_LOCATION_REQUEST_TIMEOUT= # Optional: Location timeout (ms)
```

### API Limits
- **Free Tier**: 1,000 calls/day, 60 calls/minute
- **Caching**: 10-minute cache to optimize API usage
- **Rate Limiting**: Built-in request throttling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenWeatherMap](https://openweathermap.org/) for weather data
- [shadcn/ui](https://ui.shadcn.com/) for component library
- [Lucide React](https://lucide.dev/) for icons
- [Tailwind CSS](https://tailwindcss.com/) for styling

## 📞 Contact

Christian Jerald Jutba - [cjjutbaofficial@gmail.com](mailto:cjjutbaofficial@gmail.com)

GitHub Profile: [https://github.com/christianjeraldjutba](https://github.com/christianjeraldjutba)

Project Link: [https://github.com/christianjeraldjutba/weather-dashboard-v1](https://github.com/christianjeraldjutba/weather-dashboard-v1)

---

⭐ Star this repository if you found it helpful!

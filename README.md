# NFL Field Puzzle - Next.js Edition

A challenging logic puzzle game converted to Next.js for better SEO and server-side rendering. Place exactly one football in each row, column, and color region without any footballs touching each other.

## 🚀 Features

- **Server-Side Rendering (SSR)** - Better SEO and faster initial page loads
- **TypeScript** - Type safety and better developer experience
- **Responsive Design** - Works on desktop and mobile devices
- **Daily Puzzles** - New puzzles loaded from Google Sheets
- **Archive System** - Play previous days' puzzles
- **Hint System** - Progressive hints to help when stuck
- **Win Animations** - Celebratory animations when completing puzzles
- **Share Results** - Share your completion stats
- **SEO Optimized** - Meta tags, Open Graph, and structured data

## 🛠️ Tech Stack

- **Next.js 14** - React framework with SSR
- **TypeScript** - Type safety
- **CSS Modules** - Scoped styling
- **React Hooks** - State management
- **Google Sheets API** - Puzzle data source

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nfl-field-puzzle-nextjs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Follow the prompts** to configure your deployment

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- **Netlify** - Use the Next.js build command
- **AWS Amplify** - Connect your repository
- **Railway** - Deploy directly from GitHub
- **Heroku** - Use the Next.js buildpack

## 🎮 How to Play

1. **Objective**: Place exactly one 🏈 (football) in each row, column, and color region
2. **Controls**:
   - **Single click**: Place an X (marks where footballs cannot go)
   - **Double click**: Place a 🏈 (football)
   - **Third click**: Clear the cell
3. **Rules**:
   - No two footballs can touch (including diagonally)
   - Each row must have exactly one football
   - Each column must have exactly one football
   - Each color region must have exactly one football

## 🏗️ Project Structure

```
├── components/          # React components
│   ├── GameBoard.tsx   # Main game board
│   ├── Cell.tsx        # Individual cell component
│   ├── Controls.tsx    # Game controls
│   ├── InfoBar.tsx     # Information display
│   ├── Instructions.tsx # Game instructions
│   ├── WinScreen.tsx   # Victory screen
│   └── ArchiveScreen.tsx # Puzzle archive
├── hooks/              # Custom React hooks
│   └── useGameLogic.ts # Game state management
├── pages/              # Next.js pages
│   ├── api/            # API routes
│   │   └── puzzle-data.ts
│   ├── _app.tsx        # App wrapper
│   ├── _document.tsx   # Document wrapper
│   └── index.tsx       # Main game page
├── styles/             # CSS modules
│   ├── globals.css     # Global styles
│   └── *.module.css    # Component styles
├── types/              # TypeScript types
│   └── game.ts         # Game-related types
└── public/             # Static assets
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file for environment-specific configuration:

```env
# Optional: Custom puzzle data URL
NEXT_PUBLIC_PUZZLE_DATA_URL=https://your-custom-sheets-url
```

### Puzzle Data Format

The game expects puzzle data in CSV format with the following columns:

- `date` - Puzzle date (YYYY-MM-DD)
- `grid_size` - Size of the game board (typically 8)
- `regions` - JSON array of region assignments
- `queens` - JSON array of solution coordinates
- `prefills` - JSON array of pre-filled cells

## 🎯 SEO Features

- **Meta Tags** - Comprehensive meta tag optimization
- **Open Graph** - Social media sharing optimization
- **Structured Data** - JSON-LD schema markup
- **Server-Side Rendering** - Content available to search engines
- **Performance Optimization** - Fast loading times

## 🚀 Performance Optimizations

- **Code Splitting** - Automatic code splitting by Next.js
- **Image Optimization** - Built-in Next.js image optimization
- **Caching** - API response caching
- **Bundle Analysis** - Use `npm run build` to analyze bundle size

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Code Quality

- **ESLint** - Code linting with Next.js configuration
- **TypeScript** - Type checking
- **Prettier** - Code formatting (recommended)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Original puzzle concept inspired by the classic Queens puzzle
- NFL theme for enhanced visual appeal
- Google Sheets integration for dynamic puzzle data

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Include steps to reproduce any bugs

---

**Enjoy playing the NFL Field Puzzle! 🏈**

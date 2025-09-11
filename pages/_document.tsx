import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="description" content="NFL Field Puzzle - A challenging logic puzzle game where you place exactly one football in each row, column, and color region. Play daily puzzles with hints and archive access." />
        <meta name="keywords" content="puzzle, game, nfl, football, logic, brain teaser, daily puzzle" />
        <meta name="author" content="NFL Field Puzzle" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://nfl-field-puzzle.vercel.app/" />
        <meta property="og:title" content="NFL Field Puzzle - Daily Logic Game" />
        <meta property="og:description" content="A challenging logic puzzle game where you place exactly one football in each row, column, and color region. Play daily puzzles with hints and archive access." />
        <meta property="og:image" content="https://nfl-field-puzzle.vercel.app/og-image.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://nfl-field-puzzle.vercel.app/" />
        <meta property="twitter:title" content="NFL Field Puzzle - Daily Logic Game" />
        <meta property="twitter:description" content="A challenging logic puzzle game where you place exactly one football in each row, column, and color region. Play daily puzzles with hints and archive access." />
        <meta property="twitter:image" content="https://nfl-field-puzzle.vercel.app/og-image.png" />

        {/* Font Awesome for social icons */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Game",
              "name": "NFL Field Puzzle",
              "description": "A challenging logic puzzle game where you place exactly one football in each row, column, and color region.",
              "genre": "Puzzle",
              "gamePlatform": "Web Browser",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Organization",
                "name": "NFL Field Puzzle"
              }
            })
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

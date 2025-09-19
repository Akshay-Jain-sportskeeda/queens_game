import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="description" content="Challenge yourself with the daily NFL Octobox from Pro Football Network. A fun logic game for football fans, featuring a grid-based puzzle. Find more NFL games and tools on our site." />
        <meta name="keywords" content="NFL Octobox, football puzzle, daily logic game, NFL games, football brain games, puzzle for football fans, sports puzzles" />
        <meta name="author" content="Pro Football Network" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://nfl-octobox.vercel.app/" />
        <meta property="og:title" content="NFL Octobox: Daily Logic Game | PFSN" />
        <meta property="og:description" content="Challenge yourself with the daily NFL Octobox from Pro Football Network. A fun logic game for football fans, featuring a grid-based puzzle. Find more NFL games and tools on our site." />
        <meta property="og:image" content="https://nfl-octobox.vercel.app/og-image.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://nfl-octobox.vercel.app/" />
        <meta property="twitter:title" content="NFL Octobox: Daily Logic Game | PFSN" />
        <meta property="twitter:description" content="Challenge yourself with the daily NFL Octobox from Pro Football Network. A fun logic game for football fans, featuring a grid-based puzzle. Find more NFL games and tools on our site." />
        <meta property="twitter:image" content="https://nfl-octobox.vercel.app/og-image.png" />

        {/* Font Awesome for social icons */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Game",
              "name": "NFL Octobox",
              "description": "Challenge yourself with the daily NFL Octobox from Pro Football Network. A fun logic game for football fans, featuring a grid-based puzzle.",
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
                "name": "Pro Football Network"
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

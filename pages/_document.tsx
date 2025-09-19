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
        <meta property="og:image" content="https://statico.profootballnetwork.com/wp-content/uploads/2025/09/19060049/NFL-OCTOBOX.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://nfl-octobox.vercel.app/" />
        <meta property="twitter:title" content="NFL Octobox: Daily Logic Game | PFSN" />
        <meta property="twitter:description" content="Challenge yourself with the daily NFL Octobox from Pro Football Network. A fun logic game for football fans, featuring a grid-based puzzle. Find more NFL games and tools on our site." />
        <meta property="twitter:image" content="https://statico.profootballnetwork.com/wp-content/uploads/2025/09/19060049/NFL-OCTOBOX.png" />

        {/* Font Awesome for social icons */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />

        {/* Google Analytics GA4 */}
        <script async defer src="https://www.googletagmanager.com/gtag/js?id=G-94BYBHMYCW"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-94BYBHMYCW');
            `
          }}
        />
        
        {/* Raptive (AdThrive) Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(w, d) {
                w.adthrive = w.adthrive || {};
                w.adthrive.cmd = w.adthrive.cmd || [];
                w.adthrive.plugin = 'adthrive-ads-manual';
                w.adthrive.host = 'ads.adthrive.com';
                var s = d.createElement('script');
                s.async = true;
                s.referrerpolicy = 'no-referrer-when-downgrade';
                s.src = 'https://' + w.adthrive.host + '/sites/5e163f2211916d4860b8f332/ads.min.js?referrer=' + w.encodeURIComponent(w.location.href) + '&cb=' + (Math.floor(Math.random() * 100) + 1);
                var n = d.getElementsByTagName('script')[0];
                n.parentNode.insertBefore(s, n);
              })(window, document);
            `
          }}
        />
        
        {/* Visibl Tracking Script */}
        <script async defer src="https://assets.govisibl.io/scripts/dist/v1/sk.min.js?s=1&t=6008c3a6-0ddf-47a3-9146-2c4a38a74751"></script>

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

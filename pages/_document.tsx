import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en-us">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="robots" content="INDEX, FOLLOW, MAX-IMAGE-PREVIEW:LARGE" />
        <link rel="canonical" href="https://www.profootballnetwork.com/games/nfl-octobox/" />
        <meta name="description" content="Challenge yourself with the daily NFL Octobox from PFSN. A fun logic game for football fans, featuring a grid-based puzzle. Find more NFL games and tools on our site." />
        <meta name="keywords" content="NFL Octobox, football puzzle, daily logic game, NFL games, football brain games, puzzle for football fans, sports puzzles" />
        <meta name="author" content="PFSN" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://nfl-octobox.vercel.app/" />
        <meta property="og:title" content="NFL Octobox: Daily Logic Game | PFSN" />
        <meta property="og:description" content="Challenge yourself with the daily NFL Octobox from PFSN. A fun logic game for football fans, featuring a grid-based puzzle. Find more NFL games and tools on our site." />
        <meta property="og:image" content="https://statico.profootballnetwork.com/wp-content/uploads/2025/09/19060049/NFL-OCTOBOX.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://nfl-octobox.vercel.app/" />
        <meta property="twitter:title" content="NFL Octobox: Daily Logic Game | PFSN" />
        <meta property="twitter:description" content="Challenge yourself with the daily NFL Octobox from PFSN. A fun logic game for football fans, featuring a grid-based puzzle. Find more NFL games and tools on our site." />
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
          data-no-optimize="1"
          data-cfasync="false"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w, d) {
                w.adthrive = w.adthrive || {};
                w.adthrive.cmd = w.adthrive.cmd || [];
                w.adthrive.plugin = 'adthrive-ads-manual';
                w.adthrive.host = 'ads.adthrive.com';
                var s = d.createElement('script');
                s.async = true;
                s.defer = true;
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
              "@graph": [
                {
                  "@type": "WebPage",
                  "@id": "https://www.profootballnetwork.com/games/nfl-octobox/",
                  "url": "https://www.profootballnetwork.com/games/nfl-octobox/",
                  "name": "NFL Octobox: Daily Logic Game | PFSN",
                  "description": "Challenge yourself with the daily NFL Octobox from PFSN. A fun logic game for football fans, featuring a grid-based puzzle. Find more NFL games and tools on our site.",
                  "isPartOf": {
                    "@id": "https://www.profootballnetwork.com/#website"
                  },
                  "about": {
                    "@id": "https://www.profootballnetwork.com/games/nfl-octobox/#game"
                  },
                  "datePublished": "2025-09-13T00:00:00+00:00",
                  "dateModified": "2025-09-13T00:00:00+00:00",
                  "breadcrumb": {
                    "@id": "https://www.profootballnetwork.com/games/nfl-octobox/#breadcrumb"
                  }
                },
                {
                  "@type": "Game",
                  "@id": "https://www.profootballnetwork.com/games/nfl-octobox/#game",
                  "name": "NFL Octobox",
                  "description": "Challenge yourself with the daily NFL Octobox from PFSN. A fun logic game for football fans, featuring a grid-based puzzle.",
                  "genre": "Puzzle",
                  "gamePlatform": "Web Browser",
                  "operatingSystem": "Any",
                  "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
                  },
                  "author": {
                    "@id": "https://www.profootballnetwork.com/#organization"
                  },
                  "publisher": {
                    "@id": "https://www.profootballnetwork.com/#organization"
                  }
                },
                {
                  "@type": "NewsMediaOrganization",
                  "@id": "https://www.profootballnetwork.com/#organization",
                  "name": "Pro Football Sports Network",
                  "alternateName": "PFSN",
                  "url": "https://www.profootballnetwork.com/",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://statico.profootballnetwork.com/wp-content/uploads/2025/06/12093424/tools-navigation-06-12-25.jpg",
                    "width": 300,
                    "height": 124
                  },
                  "sameAs": [
                    "https://facebook.com/PFSN365",
                    "https://x.com/PFSN365"
                  ],
                  "contactPoint": {
                    "@type": "ContactPoint",
                    "contactType": "customer service",
                    "email": "contact@profootballnetwork.com"
                  }
                },
                {
                  "@type": "WebSite",
                  "@id": "https://www.profootballnetwork.com/#website",
                  "url": "https://www.profootballnetwork.com/",
                  "name": "PFSN",
                  "description": "Your source for NFL news, analysis, fantasy football tools, and interactive games",
                  "publisher": {
                    "@id": "https://www.profootballnetwork.com/#organization"
                  },
                  "potentialAction": [
                    {
                      "@type": "SearchAction",
                      "target": {
                        "@type": "EntryPoint",
                        "urlTemplate": "https://www.profootballnetwork.com/?s={search_term_string}"
                      },
                      "query-input": "required name=search_term_string"
                    }
                  ]
                },
                {
                  "@type": "SiteNavigationElement",
                  "@id": "https://www.profootballnetwork.com/games/nfl-octobox/#breadcrumb",
                  "name": "NFL Games",
                  "url": "https://www.profootballnetwork.com/nfl/",
                  "hasPart": [
                    {
                      "@type": "SiteNavigationElement",
                      "name": "NFL Octobox",
                      "url": "https://www.profootballnetwork.com/games/nfl-octobox/"
                    },
                    {
                      "@type": "SiteNavigationElement",
                      "name": "NFL Player Guessing Game",
                      "url": "https://www.profootballnetwork.com/nfl-player-guessing-game/"
                    },
                    {
                      "@type": "SiteNavigationElement",
                      "name": "NFL Draft Guessing Game",
                      "url": "https://www.profootballnetwork.com/cta-guess-nfl-prospects-tools/"
                    },
                    {
                      "@type": "SiteNavigationElement",
                      "name": "NFL Word Fumble",
                      "url": "https://www.profootballnetwork.com/nfl-word-fumble-cta/"
                    }
                  ]
                }
              ]
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

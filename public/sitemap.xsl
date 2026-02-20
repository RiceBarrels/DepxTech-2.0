<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <xsl:output method="html" indent="yes" encoding="UTF-8" />

  <xsl:template match="/">
    <html lang="en">
      <head>
        <title>Sitemap — DepxTech</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #09090b;
            color: #fafafa;
            min-height: 100vh;
          }
          .header {
            padding: 3rem 2rem 2rem;
            max-width: 1200px;
            margin: 0 auto;
          }
          .header h1 {
            font-size: 1.75rem;
            font-weight: 800;
            letter-spacing: -0.02em;
          }
          .header p {
            color: #a1a1aa;
            margin-top: 0.5rem;
            font-size: 0.875rem;
          }
          .header .count {
            display: inline-block;
            margin-top: 0.75rem;
            padding: 0.25rem 0.75rem;
            background: #18181b;
            border: 1px solid #27272a;
            border-radius: 9999px;
            font-size: 0.75rem;
            color: #a1a1aa;
          }
          .table-wrap {
            max-width: 1200px;
            margin: 1.5rem auto 3rem;
            padding: 0 2rem;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.8125rem;
          }
          thead th {
            text-align: left;
            padding: 0.75rem 1rem;
            color: #71717a;
            font-weight: 500;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 1px solid #27272a;
            position: sticky;
            top: 0;
            background: #09090b;
          }
          tbody tr {
            border-bottom: 1px solid #18181b;
            transition: background 0.15s;
          }
          tbody tr:hover {
            background: #18181b;
          }
          td {
            padding: 0.625rem 1rem;
            vertical-align: middle;
          }
          td a {
            color: #a78bfa;
            text-decoration: none;
            word-break: break-all;
          }
          td a:hover {
            text-decoration: underline;
            color: #c4b5fd;
          }
          .priority {
            display: inline-block;
            padding: 0.125rem 0.5rem;
            border-radius: 9999px;
            font-size: 0.6875rem;
            font-weight: 600;
          }
          .priority-high { background: #052e16; color: #4ade80; }
          .priority-med  { background: #1a2e05; color: #a3e635; }
          .priority-low  { background: #1c1917; color: #a1a1aa; }
          .freq {
            color: #a1a1aa;
          }
          .date {
            color: #71717a;
            font-variant-numeric: tabular-nums;
          }
          @media (max-width: 768px) {
            .header { padding: 2rem 1rem 1.5rem; }
            .table-wrap { padding: 0 0.5rem; }
            td, th { padding: 0.5rem; font-size: 0.75rem; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>DepxTech Sitemap</h1>
          <p>This sitemap contains all indexable pages on depxtech.com.</p>
          <span class="count">
            <xsl:value-of select="count(sitemap:urlset/sitemap:url)" /> URLs
          </span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>URL</th>
                <th>Priority</th>
                <th>Frequency</th>
                <th>Last Modified</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <tr>
                  <td>
                    <a href="{sitemap:loc}">
                      <xsl:value-of select="sitemap:loc" />
                    </a>
                  </td>
                  <td>
                    <xsl:variable name="p" select="sitemap:priority" />
                    <xsl:choose>
                      <xsl:when test="$p &gt;= 0.8">
                        <span class="priority priority-high"><xsl:value-of select="$p" /></span>
                      </xsl:when>
                      <xsl:when test="$p &gt;= 0.5">
                        <span class="priority priority-med"><xsl:value-of select="$p" /></span>
                      </xsl:when>
                      <xsl:otherwise>
                        <span class="priority priority-low"><xsl:value-of select="$p" /></span>
                      </xsl:otherwise>
                    </xsl:choose>
                  </td>
                  <td class="freq">
                    <xsl:value-of select="sitemap:changefreq" />
                  </td>
                  <td class="date">
                    <xsl:value-of select="substring(sitemap:lastmod, 1, 10)" />
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>

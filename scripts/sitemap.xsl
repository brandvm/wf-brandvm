<?xml version="1.0" encoding="UTF-8"?>
<!-- Browser view of the sitemap (index + group files): clickable links.
     Search engines ignore the stylesheet and read the XML. -->
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="robots" content="noindex"/>
        <title>XML Sitemap · Brand Vision</title>
        <style>
          body{margin:0;font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Arial,sans-serif;color:#1b1d24;background:#f4f5f8}
          .w{max-width:1100px;margin:0 auto;padding:40px 20px}
          h1{font-size:28px;font-weight:500;margin:0 0 6px}
          p{margin:0 0 24px;color:#5f6575}
          a{color:#2a3f8f;text-decoration:none}
          a:hover{text-decoration:underline}
          table{width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,.06)}
          th,td{text-align:left;padding:10px 14px;border-bottom:1px solid #e6e8ee}
          th{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#5f6575;background:#fafbfc}
          td.d{white-space:nowrap;color:#5f6575;width:1%}
          td.n{color:#8a90a0;width:1%;text-align:right}
          tr:last-child td{border-bottom:0}
          .back{display:inline-block;margin-bottom:16px}
        </style>
      </head>
      <body>
        <div class="w">
          <xsl:choose>
            <xsl:when test="s:sitemapindex">
              <h1>XML Sitemap</h1>
              <p>This index lists <xsl:value-of select="count(s:sitemapindex/s:sitemap)"/> sitemaps. Click one to see its URLs.</p>
              <table>
                <tr><th>Sitemap</th><th>Last modified</th></tr>
                <xsl:for-each select="s:sitemapindex/s:sitemap">
                  <tr>
                    <td><a href="{s:loc}"><xsl:value-of select="s:loc"/></a></td>
                    <td class="d"><xsl:value-of select="substring(s:lastmod,1,10)"/></td>
                  </tr>
                </xsl:for-each>
              </table>
            </xsl:when>
            <xsl:otherwise>
              <a class="back" href="sitemap.xml">← Sitemap index</a>
              <h1>XML Sitemap</h1>
              <p>This sitemap contains <xsl:value-of select="count(s:urlset/s:url)"/> URLs.</p>
              <table>
                <tr><th></th><th>URL</th><th>Last modified</th></tr>
                <xsl:for-each select="s:urlset/s:url">
                  <tr>
                    <td class="n"><xsl:value-of select="position()"/></td>
                    <td><a href="{s:loc}"><xsl:value-of select="s:loc"/></a></td>
                    <td class="d"><xsl:value-of select="substring(s:lastmod,1,10)"/></td>
                  </tr>
                </xsl:for-each>
              </table>
            </xsl:otherwise>
          </xsl:choose>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>

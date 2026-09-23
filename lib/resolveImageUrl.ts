import https from "https";

/**
 * Resolves indirect or page image links (e.g. ImgBB viewer links) to direct image URLs.
 * If user pastes `https://ibb.co/PvHWQX2m`, this extracts the direct `https://i.ibb.co/zTv2J93n/Cushion12-01.webp` file.
 */
export async function resolveDirectImageUrl(url?: string | null): Promise<string> {
  if (!url || typeof url !== "string") return "";

  const trimmed = url.trim();

  // If string contains an embed code with i.ibb.co (HTML <img>, BBCode [img], etc.)
  const directMatch = trimmed.match(/https?:\/\/i\.ibb\.co\/[^\s"'<>\)\]]+/i);
  if (directMatch) {
    return directMatch[0];
  }

  // If already a direct image link ending with an image extension, return as-is
  if (/\.(jpg|jpeg|png|webp|avif|gif)(\?.*)?$/i.test(trimmed)) {
    return trimmed;
  }

  // If it's an ImgBB viewer page (e.g. https://ibb.co/PvHWQX2m or https://ibb.co/fGTVjCN8)
  const ibbMatch = trimmed.match(/https?:\/\/ibb\.co\/([a-zA-Z0-9_-]+)/i);
  if (ibbMatch) {
    const targetUrl = ibbMatch[0];
    try {
      const html = await new Promise<string>((resolve, reject) => {
        const req = https.get(
          targetUrl,
          {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
              Accept:
                "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            },
            timeout: 8000,
          },
          (res) => {
            // Handle redirects if any
            if (
              res.statusCode &&
              res.statusCode >= 300 &&
              res.statusCode < 400 &&
              res.headers.location
            ) {
              https.get(
                res.headers.location,
                {
                  headers: {
                    "User-Agent":
                      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                  },
                },
                (redirectRes) => {
                  let data = "";
                  redirectRes.on("data", (chunk) => (data += chunk));
                  redirectRes.on("end", () => resolve(data));
                }
              ).on("error", reject);
              return;
            }

            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => resolve(data));
          }
        );

        req.on("error", reject);
        req.on("timeout", () => {
          req.destroy();
          reject(new Error("Timeout resolving ImgBB URL"));
        });
      });

      // 1. Look for <meta property="og:image" content="https://i.ibb.co/..." />
      const ogMatch = html.match(
        /<meta\s+property=["']og:image["']\s+content=["'](https?:\/\/[^"']+)["']/i
      );
      if (ogMatch && ogMatch[1] && ogMatch[1].includes("i.ibb.co")) {
        return ogMatch[1];
      }

      // 2. Look for <link rel="image_src" href="https://i.ibb.co/..." />
      const linkMatch = html.match(
        /<link\s+rel=["']image_src["']\s+href=["'](https?:\/\/[^"']+)["']/i
      );
      if (linkMatch && linkMatch[1] && linkMatch[1].includes("i.ibb.co")) {
        return linkMatch[1];
      }

      // 3. Fallback: look for <img ... src="https://i.ibb.co/..."
      const imgMatch = html.match(
        /src=["'](https?:\/\/i\.ibb\.co\/[^"']+)["']/i
      );
      if (imgMatch && imgMatch[1]) {
        return imgMatch[1];
      }
    } catch (err) {
      console.warn("Failed to resolve ImgBB viewer link:", err);
    }
  }

  return trimmed;
}

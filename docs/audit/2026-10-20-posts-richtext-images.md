# Post rich-text image compression: brandvm.com

Done **2026-10-20**, confirmed by the user (one test post published first,
then "confirm" for the rest). Images inside Posts `post-content` only.

## Result

- 1,160 live posts read fresh through the Webflow API; 3,619 body images
  measured. Rich-text images get no responsive `srcset`, so every visitor
  downloaded the full original.
- **1,053 images over 300 KB** (465 webp, 426 png, 162 jpeg)
  converted to **WebP q82, max 1600 px wide**: **1,014 MB → 138 MB**.
  One image gained nothing and was left alone; GIF and SVG were not touched.
- **511 posts** updated and published (1066 image swaps), 0 errors.
  Each post was re-read just before editing; only `src` values changed. After
  each update the stored HTML was checked (same visible text, same image
  count, no old URL left) before publishing. No post had other pending edits.
- Spot check after the run: 25 random updated posts on www.brandvm.com, none
  still loading an old file.

## Rollback

- `docs/cms/posts-richtext-backup-2026-10-20.jsonl`: the original
  `post-content` of every updated post (one JSON line per post). To restore a
  post, PATCH its `post-content` back (send `name` and `slug` too, see
  GOTCHAS) and publish it.
- Original files remain in the asset library.
- Script: `docs/cms/posts-richtext-images.py` (plan / test / apply; reads
  `WEBFLOW_TOKEN` from `.env`).

## Broken images found (not fixable automatically)

12 Webflow files from the migration return HTTP 403 (mangled names with
stacked file-ID prefixes); the originals can't be downloaded. Re-upload or
remove by hand:

| Post | File |
|---|---|
| /post/15-vision-mission-statement-examples | `6a7f4b0d26f00601805734c5_69cf0e4c7a2729b35d079e24_67aa8a5943b1e892c8b8` |
| /post/art-of-fomo-marketing-product-launch | `6a7f4bd2d0bec702a6f0fef1_69cf208dfe4494a85ea15f94_69090dc751633ca367d7` |
| /post/b2b-saas-marketing-strategy-2025 | `6a7f4be626f0060180579a2e_69cf1131e4119d9f3cd41591_67d452388735b967c600` |
| /post/biggest-celebrity-brand-partnerships-collaborations | `6a7f4c6a13e187af8db2994d_69cf0eddb2275b5f9c8d47a4_67af9662623a2ea3ba28` |
| /post/canadian-companies-fortune-500 | `6a7f4e51518cbcf0ddd9bdb8_69cf0c6102afc147d9eb2898_67858af7a36ea08d1489` |
| /post/canadian-companies-fortune-500 | `6a7f4e51518cbcf0ddd9bdc3_69cf0c6202afc147d9eb28ad_67858acd1b0a345c49e9` |
| /post/celebrity-fashion-brands | `6a7f4e6483ff6c1be3cc1fef_69cf0fad6b0715e9440e568c_67c0a017ae4be6974a82` |
| /post/companies-with-most-employees-ranking | `6a7f4eb5433b78c3969d1526_69cf0c6790311f1bc633ec5a_68b8ae4a876fc1cc018d` |
| /post/history-of-social-media-timeline | `6a7f56f02d634d9aca239add_69cf15e3271bc43684b809ff_687ff1718174e2d0fcd3` |
| /post/history-of-social-media-timeline | `6a7f56f02d634d9aca239af2_69cf15e3271bc43684b809fa_687ff2338174e2d0fcd3` |
| /post/kim-kardashian-branding | `6a7f58dab245d44ed3376cf9_6786b57f7434f7c4b052ece2_64fb6304a57351c7556f` |
| /post/top-music-festivals-to-attend-in-2025 | `6a7f663917d589885d291311_6793cc8efe54b337a2713ee4_67448dbf97b1ac57e758` |

11 more images hotlinked from Wikimedia are refused (HTTP 400):
/post/most-expensive-universities-2025 (10) and /post/bmws-marketing (1).
Download them from Wikimedia and upload to Webflow.

## Still open

- 48 converted images remain slightly over 300 KB (large, detailed graphics).
- Rich-text images have no alt text check in this pass.

# CMS image compression: brandvm.com

Done **2026-10-20**, confirmed by the user ("confirm to production"). Image
and MultiImage CMS fields only; images inside Rich Text were not touched.

## What changed

- Every Image field on every live item was measured (1,564 values; 983
  unique live files). 102 unique files over 300 KB; 101 converted (one
  gained nothing and was skipped).
- Converted to **WebP, quality 82**, longest edge capped at 2400 px (post
  thumbnails 1600, author avatars 1000, orbit images 1200). Transparency kept.
- **69.9 MB → 18.0 MB** for these files; largest file 4.1 MB → 463 KB.
- Uploaded as **new** assets (originals stay in the asset library; Webflow's
  in-place `compress_assets` was not used because it discards the original).
- 146 field values on **92 live items** pointed at the new assets, alt text
  kept as it was (none set), then the 92 items published. None had other
  unpublished edits. Checked on the live site afterwards.

| Collection | Files | Before | After |
|---|---|---|---|
| CaseStudies | 39 | 36.1 MB | 7.2 MB |
| Posts | 23 | 13.0 MB | 2.8 MB |
| SvcTabs | 19 | 8.6 MB | 4.2 MB |
| Industries | 15 | 7.8 MB | 3.4 MB |
| Authors | 2 | 3.1 MB | 0.2 MB |
| Orbit | 2 | 0.7 MB | 0.2 MB |
| SvcBranding | 1 | 0.5 MB | 0.2 MB |

## Rollback

`docs/cms/cms-images-rollback-2026-10-20.json` holds each item's original
field values (`fileId`, `url`, `alt`). To roll an item back, send those
values with `update_collection_items` (Case Studies also needs `tagline`,
`meta-title`, `meta-description`, `name`, `slug`; other collections `name`,
`slug` — see GOTCHAS) and publish the item.

## Not done / follow-ups

- **6,036 images inside post rich text** (not reachable this way).
- **OG images:** these fields also feed `og:image`; LinkedIn's WebP support is
  unreliable. ~70% of these fields were already WebP before this change.
- **Alt text:** none of these image fields has alt text.
- Draft and archived items were not touched.

## Files

| Collection | Field | Item | Before | After | New asset |
|---|---|---|---|---|---|
| CaseStudies | `thumbnail---full` | landscaping-services-website | PNG 4000x2324 · 4,143 KB | 2400x1394 · 240 KB | `6ad78eb0680fc43af076cfc9` |
| Authors | `avatar` | arman-tale | PNG 1228x1226 · 2,777 KB | 1000x998 · 118 KB | `6ad78eb0a35c125f0206b825` |
| CaseStudies | `thumbnail---full` | structural-engineering-firm-website | PNG 4000x2000 · 2,273 KB | 2400x1200 · 315 KB | `6ad78eb1c28c570b7f98bdc4` |
| CaseStudies | `thumbnail---full` | luxury-spa-branding | PNG 1688x1264 · 2,243 KB | 1688x1264 · 77 KB | `6ad78eb1c0a264daf7e23a15` |
| CaseStudies | `thumbnail---full` | leaside-blvd | PNG 2000x1000 · 2,086 KB | 2000x1000 · 58 KB | `6ad78eb17b473264360b0e30` |
| CaseStudies | `thumbnail---full` | pr-agency-website-seo | PNG 2101x1051 · 2,014 KB | 2101x1051 · 129 KB | `6ad78eb17b473264360b0e43` |
| CaseStudies | `thumbnail---full` | merchandise-manufacturer-branding-website | PNG 4000x2000 · 1,670 KB | 2400x1200 · 93 KB | `6ad78eb167a4ad0b2e69b535` |
| CaseStudies | `thumbnail---full` | retail-marketing-conference-website-2023 | PNG 1530x698 · 1,658 KB | 1530x698 · 185 KB | `6ad78eb1d3ddfe25f0aaac9d` |
| CaseStudies | `thumbnail---full` | retail-marketing-conference-website-2024 | PNG 2000x1000 · 1,535 KB | 2000x1000 · 113 KB | `6ad78eb2d3ddfe25f0aaacb1` |
| Posts | `post-thubmnail` | nike-marketing | JPEG 1600x840 · 1,510 KB | 1600x840 · 117 KB | `6ad78eb2265ff7a3667e16bc` |
| CaseStudies | `thumbnail---full` | luxury-real-estate-development-branding | PNG 2880x1800 · 1,493 KB | 2400x1500 · 336 KB | `6ad78eb2c28c570b7f98be50` |
| Industries | `card-cover` | food-and-beverage-marketing | WEBP 4000x2240 · 1,291 KB | 2400x1344 · 382 KB | `6ad78eb27fbe08e02345d046` |
| CaseStudies | `thumbnail---full` | themis-law-firm | PNG 2101x1051 · 1,278 KB | 2101x1051 · 51 KB | `6ad78eb2a594e64a99a2d010` |
| CaseStudies | `thumbnail---full` | machine-vision-technology-website | WEBP 12000x6000 · 1,175 KB | 2400x1200 · 191 KB | `6ad78eb2680fc43af076d0fb` |
| CaseStudies | `thumbnail---full` | luxury-fashion-branding | PNG 4000x2000 · 1,093 KB | 2400x1200 · 50 KB | `6ad78eb2265ff7a3667e1711` |
| SvcTabs | `image` | iconography | WEBP 4000x2041 · 1,010 KB | 2400x1225 · 463 KB | `6ad78eb2978113592c4fb86d` |
| Posts | `post-thubmnail` | marilyn-monroe-brand-icon | WEBP 4000x2016 · 992 KB | 1600x806 · 41 KB | `6ad78eb3a35c125f0206b8d6` |
| Posts | `post-thubmnail` | amiris-marketing-strategy | JPEG 3648x5472 · 973 KB | 1067x1600 · 40 KB | `6ad78eb3265ff7a3667e172c` |
| Posts | `post-thubmnail` | top-music-festivals-to-attend-in-2025 | WEBP 4000x2016 · 963 KB | 1600x806 · 219 KB | `6ad78eb3c0a264daf7e23a8b` |
| Industries | `tab-image-4` | food-and-beverage-marketing | WEBP 4000x2035 · 917 KB | 2400x1221 · 254 KB | `6ad78eb3a808e0a090a6993a` |
| CaseStudies | `thumbnail---full` | moving-company-website | PNG 4000x2000 · 913 KB | 2400x1200 · 149 KB | `6ad78eb3af01409caee1963b` |
| Posts | `post-thubmnail` | tomorrowland-festival-ultimate-marketing-guide | AVIF 4096x2732 · 877 KB | 1600x1067 · 295 KB | `6ad78eb3bf770c7b276fc9da` |
| Industries | `card-cover` | education-marketing | WEBP 4000x2240 · 843 KB | 2400x1344 · 322 KB | `6ad78eb41a34090bb2a82d7f` |
| CaseStudies | `client-logo` | youth-wellness-awareness-campaign | PNG 2444x1536 · 808 KB | 2400x1508 · 368 KB | `6ad78eb4a35c125f0206b94f` |
| CaseStudies | `thumbnail---full` | municipal-association-website | WEBP 1688x1264 · 800 KB | 1688x1264 · 54 KB | `6ad78eb4538a72bcc5c946ef` |
| CaseStudies | `thumbnail---square` | machine-vision-technology-website | WEBP 7800x6000 · 785 KB | 2400x1846 · 213 KB | `6ad78eb498686c3b96871c71` |
| CaseStudies | `thumbnail---full` | custom-aluminum-solutions-seo | JPEG 4000x3000 · 731 KB | 2400x1800 · 431 KB | `6ad78eb498686c3b96871c84` |
| SvcTabs | `image` | logo-redesign-2 | WEBP 4000x2041 · 729 KB | 2400x1225 · 325 KB | `6ad78eb4a35c125f0206b985` |
| Industries | `hero-image` | food-and-beverage-marketing | WEBP 4000x1716 · 720 KB | 2400x1030 · 251 KB | `6ad78eb4e0cf3cbadd4de8fe` |
| CaseStudies | `thumbnail---full` | hostel-booking-branding-website | WEBP 4000x2000 · 663 KB | 2400x1200 · 421 KB | `6ad78eb4593c237126c8d4bb` |
| CaseStudies | `thumbnail---full` | homeschool-education-branding-website | WEBP 4000x2000 · 658 KB | 2400x1200 · 383 KB | `6ad78eb4680fc43af076d1c3` |
| CaseStudies | `thumbnail---full` | construction-service-firm-branding-website | WEBP 1672x941 · 650 KB | 1672x941 · 252 KB | `6ad78eb5a594e64a99a2d13d` |
| CaseStudies | `thumbnail---full` | corporate-law-firm-branding-website | WEBP 12000x6000 · 636 KB | 2400x1200 · 65 KB | `6ad78eb5a35c125f0206b9c8` |
| Posts | `post-thubmnail` | best-christmas-marketing-campaigns | JPEG 2560x1440 · 587 KB | 1600x900 · 232 KB | `6ad78eb567a4ad0b2e69b7bc` |
| Posts | `post-thubmnail` | 6-most-expensive-phones-in-the-world | JPEG 1600x840 · 584 KB | 1600x840 · 32 KB | `6ad78ee667e3d53061f04410` |
| Posts | `post-thubmnail` | fendi-identity-it-girls-carrie-bradshaw | PNG 1554x808 · 582 KB | 1554x808 · 68 KB | `6ad78ee63f0eed0e6f26f5da` |
| SvcTabs | `image` | ux-overhaul | WEBP 4000x2045 · 578 KB | 2400x1227 · 220 KB | `6ad78ee73f0eed0e6f26f5ed` |
| CaseStudies | `thumbnail---full` | custom-home-builder-branding-website | PNG 1920x1080 · 516 KB | 1920x1080 · 86 KB | `6ad78ee76a331fe1632bfa84` |
| Industries | `hero-image` | education-marketing | WEBP 4000x1716 · 512 KB | 2400x1030 · 212 KB | `6ad78ee79cee1ae8235fb6c8` |
| Posts | `post-thubmnail` | building-your-unique-brand-voice | WEBP 1220x615 · 502 KB | 1220x615 · 26 KB | `6ad78ee7a30545bd4da9c9c7` |
| SvcBranding | `cover-image` | graphic-design | WEBP 4000x1715 · 497 KB | 2400x1029 · 195 KB | `6ad78ee779354b30546ee38e` |
| Posts | `post-thubmnail` | small-business-data-driven-marketing-tools | WEBP 5260x3510 · 496 KB | 1600x1068 · 167 KB | `6ad78ee779354b30546ee3a1` |
| SvcTabs | `image` | go-to-market-plan | WEBP 4000x2041 · 487 KB | 2400x1225 · 232 KB | `6ad78ee75230511ca212a62d` |
| SvcTabs | `image` | woocommerce-plugins-integrations | WEBP 4000x2041 · 481 KB | 2400x1225 · 268 KB | `6ad78ee7680fc43af076e63c` |
| Industries | `tab-image-2` | health-wellness-marketing | WEBP 4000x2041 · 479 KB | 2400x1225 · 296 KB | `6ad78ee87736a13d2c1ae88e` |
| Industries | `tab-image-2` | entertainment-marketing | WEBP 4000x2041 · 479 KB | 2400x1225 · 296 KB | `6ad78ee87736a13d2c1ae8a1` |
| SvcTabs | `image` | shopify-apps-integrations | WEBP 3952x2017 · 478 KB | 2400x1225 · 272 KB | `6ad78ee8d15ff923bebf7712` |
| SvcTabs | `image` | wordpress-maintenance | WEBP 4000x2040 · 468 KB | 2400x1224 · 249 KB | `6ad78ee88397f3b865af50de` |
| CaseStudies | `client-logo` | coffee-branding-packaging-design | PNG 1780x851 · 466 KB | 1780x851 · 59 KB | `6ad78ee802ba67f2c4f243fd` |
| CaseStudies | `thumbnail---full` | youth-wellness-awareness-campaign | WEBP 4000x2000 · 465 KB | 2400x1200 · 326 KB | `6ad78ee8bcad2a6336467902` |
| Posts | `post-thubmnail` | burj-khalifa-marketing | PNG 1600x534 · 460 KB | 1600x534 · 40 KB | `6ad78ee80223bc77ce402826` |
| Posts | `post-thubmnail` | red-bulls-top-marketing | AVIF 3809x5713 · 454 KB | 1067x1600 · 171 KB | `6ad78ee8bcad2a633646795b` |
| SvcTabs | `image` | ux-analytics | WEBP 4000x2042 · 452 KB | 2400x1225 · 243 KB | `6ad78ee87736a13d2c1ae93b` |
| SvcTabs | `image` | wordpress-seo | WEBP 4000x2040 · 441 KB | 2400x1224 · 244 KB | `6ad78ee9d3ddfe25f0aac2a3` |
| SvcTabs | `image` | gutenberg-development | WEBP 4000x2040 · 435 KB | 2400x1224 · 230 KB | `6ad78ee99cee1ae8235fb79e` |
| CaseStudies | `thumbnail---full` | pr-agency-website | WEBP 4000x2000 · 432 KB | 2400x1200 · 257 KB | `6ad78ee928e9316a8a7bc3c0` |
| Posts | `post-thubmnail` | mastering-the-art-of-rebranding-is-now-the-moment-for-change | JPEG 1920x1080 · 415 KB | 1600x900 · 215 KB | `6ad78ee9a808e0a090a6a9d0` |
| Posts | `post-thubmnail` | small-business-branding | WEBP 2542x1690 · 408 KB | 1600x1064 · 103 KB | `6ad78ee9a35c125f0206c8bd` |
| CaseStudies | `thumbnail---full` | electric-scooter-branding-storefront | WEBP 4000x2000 · 406 KB | 2400x1200 · 241 KB | `6ad78ee9bf770c7b276fe58e` |
| Posts | `post-thubmnail` | zaras-marketing-news | WEBP 4000x2016 · 392 KB | 1600x806 · 57 KB | `6ad78eea0223bc77ce4028b4` |
| Posts | `post-thubmnail` | 2024-gym-marketing | JPEG 1920x1280 · 391 KB | 1600x1067 · 121 KB | `6ad78eea0b24c8154a2b3603` |
| CaseStudies | `thumbnail---full` | live-music-events-branding | WEBP 4000x2000 · 385 KB | 2400x1200 · 246 KB | `6ad78eead015faf06ed1d99e` |
| Posts | `post-thubmnail` | mcdonalds-marketing-strategy | WEBP 5597x3149 · 380 KB | 1600x900 · 83 KB | `6ad78eea28e9316a8a7bc42b` |
| Posts | `post-thubmnail` | chatbots-in-marketing | PNG 1186x786 · 376 KB | 1186x786 · 80 KB | `6ad78eea02ba67f2c4f2449e` |
| CaseStudies | `thumbnail---full` | community-crisis-support-branding-website | WEBP 8000x4000 · 376 KB | 2400x1200 · 93 KB | `6ad78eea02ba67f2c4f244b1` |
| Posts | `post-thubmnail` | what-is-local-seo-improve-seo | WEBP 1736x1140 · 375 KB | 1600x1051 · 70 KB | `6ad78eea0223bc77ce402971` |
| SvcTabs | `image` | shopify-development | WEBP 3952x2017 · 370 KB | 2400x1225 · 155 KB | `6ad78eebbcad2a6336467c14` |
| CaseStudies | `thumbnail---full` | law-firm-website-seo | WEBP 8000x4000 · 367 KB | 2400x1200 · 102 KB | `6ad78eeb593c237126c8e1e1` |
| Industries | `card-cover` | technology-marketing | WEBP 4000x2240 · 362 KB | 2400x1344 · 240 KB | `6ad78f15bcad2a6336468f62` |
| CaseStudies | `thumbnail---full` | boutique-hotel-branding-website | WEBP 4000x2000 · 358 KB | 2400x1200 · 219 KB | `6ad78f15e49b20feb2fefdb6` |
| CaseStudies | `thumbnail---full` | digital-pharmacy-platform-website | WEBP 8000x4000 · 358 KB | 2400x1200 · 58 KB | `6ad78f15448fc27e1beeaf74` |
| Industries | `card-cover` | travel-hospitality-marketing | WEBP 4000x2240 · 357 KB | 2400x1344 · 250 KB | `6ad78f167fbe08e02345f31b` |
| Posts | `post-thubmnail` | top-web-design-trends-in-2024 | JPEG 1920x1080 · 356 KB | 1600x900 · 197 KB | `6ad78f1667a4ad0b2e69ca87` |
| CaseStudies | `thumbnail---full` | environmental-engineering-website | WEBP 2180x1422 · 353 KB | 2180x1422 · 154 KB | `6ad78f16448fc27e1beeaf9c` |
| SvcTabs | `image` | website-redesign | WEBP 4000x2041 · 352 KB | 2400x1225 · 155 KB | `6ad78f160b24c8154a2b453e` |
| Posts | `post-thubmnail` | is-digital-marketing-essential-for-your-plumbing-business | JPEG 1920x1080 · 351 KB | 1600x900 · 191 KB | `6ad78f167b473264360b31f1` |
| Orbit | `image` | campaign-collage-frame | WEBP 3011x2198 · 350 KB | 1200x876 · 74 KB | `6ad78f16bcad2a633646905c` |
| SvcTabs | `image` | print-graphic-design | WEBP 3950x2015 · 347 KB | 2400x1224 · 162 KB | `6ad78f1717fc8f1e63230e29` |
| Authors | `avatar` | dana-nemirovsky | JPEG 2684x4032 · 347 KB | 666x1000 · 55 KB | `6ad78f1702ba67f2c4f2521f` |
| Orbit | `image` | social-haus-posters | WEBP 1978x2472 · 339 KB | 960x1200 · 91 KB | `6ad78f177b473264360b3231` |
| CaseStudies | `thumbnail---square` | digital-pharmacy-platform-website | WEBP 5200x4000 · 339 KB | 2400x1846 · 211 KB | `6ad78f17fc4f9671ca5c5cf0` |
| CaseStudies | `thumbnail---full` | coffee-branding-packaging-design | WEBP 4000x2000 · 337 KB | 2400x1200 · 178 KB | `6ad78f1766d329614807839e` |
| SvcTabs | `image` | typography | WEBP 4000x2041 · 337 KB | 2400x1225 · 142 KB | `6ad78f172ea3356cfaebcd71` |
| CaseStudies | `thumbnail---full` | healthcare-executive-search-website | WEBP 2000x1000 · 335 KB | 2000x1000 · 235 KB | `6ad78f17448fc27e1beeb04e` |
| CaseStudies | `thumbnail---square` | healthcare-executive-search-website | WEBP 2000x1000 · 335 KB | 2000x1000 · 235 KB | `6ad78f17448fc27e1beeb04e` |
| CaseStudies | `thumbnail---full` | consumer-software-company-seo | WEBP 1580x970 · 332 KB | 1580x970 · 93 KB | `6ad78f1779354b30546efd22` |
| Industries | `tab-image-1` | b2c-marketing | WEBP 4000x1976 · 327 KB | 2400x1186 · 169 KB | `6ad78f18bcad2a6336469183` |
| SvcTabs | `image` | packaging-graphic-design | WEBP 3950x2015 · 324 KB | 2400x1224 · 175 KB | `6ad78f1867a4ad0b2e69cb84` |
| SvcTabs | `image` | brand-collaterals | WEBP 4000x2041 · 324 KB | 2400x1225 · 240 KB | `6ad78f18fc4f9671ca5c5d21` |
| SvcTabs | `image` | brand-messaging | WEBP 4000x2041 · 318 KB | 2400x1225 · 130 KB | `6ad78f18a808e0a090a6bb4d` |
| Industries | `card-cover` | not-for-profit-marketing | WEBP 4000x2240 · 317 KB | 2400x1344 · 148 KB | `6ad78f18fc4f9671ca5c5d4a` |
| SvcTabs | `image` | content-migration | WEBP 4000x2045 · 315 KB | 2400x1227 · 125 KB | `6ad78f18d015faf06ed1e478` |
| Industries | `card-cover` | startups-marketing | WEBP 4000x2240 · 313 KB | 2400x1344 · 164 KB | `6ad78f18076159e0bcc32f50` |
| Posts | `post-thubmnail` | fifa-womens-2023 | WEBP 6000x3376 · 310 KB | 1600x900 · 73 KB | `6ad78f197736a13d2c1affc6` |
| Industries | `tab-image-3` | health-wellness-marketing | WEBP 4000x2041 · 308 KB | 2400x1225 · 112 KB | `6ad78f1979354b30546efd4f` |
| Industries | `tab-image-3` | entertainment-marketing | WEBP 4000x2041 · 308 KB | 2400x1225 · 112 KB | `6ad78f19b14c1a558434fecf` |
| CaseStudies | `thumbnail---full` | enterprise-ordering-platform | WEBP 998x721 · 306 KB | 998x721 · 89 KB | `6ad78f1966d3296148078724` |
| CaseStudies | `thumbnail---square` | enterprise-ordering-platform | WEBP 998x721 · 306 KB | 998x721 · 89 KB | `6ad78f1966d3296148078724` |
| Industries | `hero-image` | b2c-marketing | WEBP 4000x1716 · 306 KB | 2400x1030 · 187 KB | `6ad78f197736a13d2c1b01ef` |
| SvcTabs | `image` | heuristics | WEBP 4000x2042 · 306 KB | 2400x1225 · 112 KB | `6ad78f19bcad2a6336469206` |
| Posts | `post-thubmnail` | 5-reasons-why-small-local-businesses-cannot-afford-to-stay-offline | JPEG 1920x1080 · 300 KB | 1600x900 · 144 KB | `6ad78f190223bc77ce403a28` |

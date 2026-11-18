// Case study cards (S | Projects, every page that lists case studies) are
// clicked through an empty full-card link, .project-overlay-link, and the
// visible title next to it is aria-hidden. With no text the link has no
// accessible name: a screen reader reads it as "link" and PageSpeed fails
// "Links do not have a discernible name".
//
// The name should be a CMS-bound aria-label on the link in Webflow, but the
// Webflow MCP cannot bind a CMS field inside the S | Projects component
// ("not inside a CMS context"), so it is set here from the card's title.
// If someone binds it in the Designer, this module leaves it alone.
export function initCardLinkNames() {
  document.querySelectorAll<HTMLAnchorElement>('a.project-overlay-link').forEach((link) => {
    if (link.getAttribute('aria-label')?.trim() || link.textContent?.trim()) return;
    const card = link.closest('.project-card');
    const title = card?.querySelector('.project-card-title')?.textContent?.trim()
      || card?.querySelector('img[alt]')?.getAttribute('alt')?.trim();
    if (title) link.setAttribute('aria-label', title);
  });
}

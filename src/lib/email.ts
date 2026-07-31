interface RenderArgs {
  html: string;
  firstName: string;
  trackingClickUrl: string;
  trackingPixelUrl: string;
}

/**
 * Templates support {{first_name}} and {{tracking_link}} placeholders.
 * A tracking pixel is appended automatically so simulation "open" rates can be
 * measured even for templates that don't reference it explicitly.
 */
export function renderSimulationEmail({ html, firstName, trackingClickUrl, trackingPixelUrl }: RenderArgs): string {
  let rendered = html
    .replaceAll("{{first_name}}", firstName)
    .replaceAll("{{tracking_link}}", trackingClickUrl);

  rendered += `<img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:none" />`;
  return rendered;
}

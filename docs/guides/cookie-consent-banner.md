<!--
kb_guide
kb_pwa
kb_everyone
kb_sync_latest_only
-->

# Cookie Consent Banner

The configuration of the cookie consent banner is placed in `app.component.html`

```html
<ish-cookie-banner
  [options]="{
    updatedAt: 'Mon Jul 27 2020 12:03:39 GMT+0200',
    options: [
      {
        id: 'required',
        required: true,
        messageKeyTitle: 'cookie_consent.dialog.sections.essential.title',
        messageKeyContent: 'cookie_consent.dialog.sections.essential.content',
        whitelistedCookies: ['apiToken']
      },
      {
        id: 'functional',
        messageKeyTitle: 'cookie_consent.dialog.sections.functional.title',
        messageKeyContent: 'cookie_consent.dialog.sections.functional.content'
      },
      {
        id: 'tracking',
        messageKeyTitle: 'cookie_consent.dialog.sections.tracking.title',
        messageKeyContent: 'cookie_consent.dialog.sections.tracking.content'
      }
    ]
  }"
></ish-cookie-banner>
```

Options:

`updatedAt` is the the date of the latest update of your privacy policy.
If this date is newer than the date in the client cookie, the banner will show again.

`options` contains the items for cookie consent.
The first item should be the "required" option to parse whitelistedCookies correctly.
The option with id "tracking" is currently used to start google-tag-manager and sentry error logging if enabled.

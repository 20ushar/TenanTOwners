<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/28f8103e-9953-43d7-b068-1fd2de5424a1

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Meta Pixel

Meta Pixel `1568105821708997` is enabled by default. Set `VITE_META_PIXEL_ID` in the deployment environment to override it without changing source code. Pixel IDs are public browser configuration; never put Meta access tokens or other secrets in `VITE_*` variables.

The app tracks SPA `PageView` events, `ViewContent` for property details, `Lead` after successful enquiries and applications, and the custom event `WhatsAppClick` from property contact buttons.

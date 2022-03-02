⚠️ **This repo is soon to be deprecated, we should not build on it anymore** ⚠️

TODO before sunset 🌅
- [ ] Make the Wyre platform app in the [discover catalog](https://github.com/LedgerHQ/ledger-live-assets/blob/master/platform/apps/v1/data.json#L470) use the new [platform-app-wyre repo](https://github.com/LedgerHQ/platform-app-wyre)
- [ ] Move the [web-browwser](https://github.com/LedgerHQ/ledger-live-platform-apps/blob/main/pages/app/web-browser.tsx) app in it's own repo
- [X] Move the [dapp-browser](https://github.com/LedgerHQ/ledger-live-platform-apps/blob/main/pages/app/dapp-browser.tsx) app in it's own repo. ✅ Done -> cf. [**here**](https://github.com/LedgerHQ/eth-dapp-browser)

----

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## How to test?

After running the development server, you can test locally the `dapp-browser` and `web-browser` related applications by providing a `mock=true` query argument to the corresponding URL.

Example:

- Paraswap:

  `http://localhost:3000/app/dapp-browser?url=https%3A%2F%2Fparaswap.io%2F%3Fembed%3Dtrue%26referrer%3Dledger2&nanoApp=Paraswap&dappName=ParaSwap&mock=true`

- Rainbow.me:

  `http://localhost:3000/app/web-browser?url=https%3A%2F%2Frainbow.me%2F%7Baccount.address%7D&currencies=ethereum&webAppName=Rainbow.me&mock=true`

You can also test in the Ledger Live desktop environment (without mock) by uploading your own manifest referencing your local development server URL. Please refer to the [developer mode doc](https://developers.ledger.com/docs/platform-app/developer-mode/) for related information.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

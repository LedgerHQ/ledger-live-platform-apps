This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Working with `ledger-live-platform-sdk`

[`ledger-live-platform-sdk`](https://github.com/LedgerHQ/ledger-live-platform-sdk) is still in development for now and not available on npm. Here is a setup process using [Yalc](https://github.com/wclr/yalc):

- First, clone the [`ledger-live-platform-sdk`](https://github.com/LedgerHQ/ledger-live-platform-sdk).

- Setup the [`ledger-live-platform-sdk`](https://github.com/LedgerHQ/ledger-live-platform-sdk) using the README provided in the project repo, then build and publish it locally using:

```bash
yalc publish
```

- In this `ledger-live-platform-apps` repo, install the packages and link the `ledger-live-platform-sdk` dependency using:

```bash
yarn && yalc link ledger-live-platform-sdk
```

You should then be good to go. Alternativelly or if you experience an issue with the linking process, you can use [`yalc add`](https://github.com/wclr/yalc#add) instead of [`yalc link`](https://github.com/wclr/yalc#link).

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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

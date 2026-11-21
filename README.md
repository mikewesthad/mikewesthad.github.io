# mikewesthad

Personal Portfolio website: https://www.mikewesthad.com/

Built with:

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)

## Usage

To run the site under "development" mode, make sure you have the node version in `.nvmrc` (`nvm use`) and pnpm installed, and then run:

```
pnpm install
pnpm dev
```

To run the site under "production" mode, run:

```
pnpm build
pnpm start
```

### Dependency safety

`pnpm-workspace.yaml` enables pnpm's supply-chain checks: package versions published less than 7 days ago are rejected (`minimumReleaseAge`), as are versions whose publish trust level drops below earlier releases (`trustPolicy`). If an install fails with `ERR_PNPM_NO_MATURE_MATCHING_VERSION`, wait for the version to mature rather than disabling the check.

## Deploying

The site is set up to deploy a new version anytime anything is pushed to the `main` branch.

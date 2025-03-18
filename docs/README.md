# Compound React Documentation

This folder contains the documentation for the Compound React library, built with [Mintlify](https://mintlify.com/).

## Local Development

### Option 1: Simple Preview (Compatible with any Node.js version)

For a simple preview of the documentation structure:

```bash
# Install dependencies
npm install

# Start the preview server
npm start
```

This will start a simple HTTP server at `http://localhost:3000` where you can preview the documentation structure.

### Option 2: Mintlify CLI (Requires Node.js v18.17.0 or later)

For the full Mintlify experience, you need to use the Mintlify CLI:

```bash
# Make sure you have Node.js v18.17.0 or later
# If using nvm:
nvm install 18.17.0
nvm use 18.17.0

# Install the Mintlify CLI
npm install -g mintlify

# Start the development server
mintlify dev
```

This will start a local server at `http://localhost:3000` where you can preview the documentation with all Mintlify features.

## Troubleshooting

If you encounter an error with the Mintlify CLI related to the `sharp` package, make sure you're using Node.js v18.17.0 or later:

```
Error: Could not load the "sharp" module using the darwin-arm64 runtime
Possible solutions:
- Please upgrade Node.js:
    Found 18.12.1
    Requires ^18.17.0 || ^20.3.0 || >=21.0.0
```

## Documentation Structure

The documentation is organized as follows:

- **Getting Started**: Introduction, installation, and quickstart guides
- **Core Concepts**: Information about the Compound protocol and supported networks/markets
- **Hooks**: Documentation for all the hooks provided by the library
- **API Reference**: Detailed API reference for the library
- **Examples**: Example code snippets and use cases

## Adding New Pages

To add a new page to the documentation, create a new `.mdx` file in the appropriate directory. Each page should have a frontmatter section at the top with the title and description:

```mdx
---
title: 'Page Title'
description: 'Page description'
---

# Page Content
```

Then, add the page to the navigation in the `mintlify.json` file.

## Deployment

The documentation is automatically deployed when changes are pushed to the main branch. You can also manually deploy the documentation using the Mintlify CLI:

```bash
mintlify deploy
```

## Customization

You can customize the documentation by editing the `mintlify.json` file. This file contains the configuration for the documentation, including the navigation, colors, and other settings.

## Resources

- [Mintlify Documentation](https://mintlify.com/docs)
- [MDX Documentation](https://mdxjs.com/) 
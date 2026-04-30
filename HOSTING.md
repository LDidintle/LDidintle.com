# Hosting Guide for LDidintle.com

This site is a static HTML/CSS/JavaScript portfolio. The simplest hosting options are GitHub Pages, Netlify, or Vercel.

## Recommended Option: GitHub Pages

GitHub Pages is a good fit because this site is mainly for GitHub project links and does not need a backend.

### 1. Create the Repository

Create a public GitHub repository named:

```text
LDidintle.com
```

Then push these files:

```text
index.html
styles.css
script.js
HOSTING.md
```

### 2. Enable GitHub Pages

1. Open the repository on GitHub.
2. Go to `Settings`.
3. Go to `Pages`.
4. Under `Build and deployment`, choose:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
5. Save.

GitHub will give you a temporary URL similar to:

```text
https://ldidintle.github.io/LDidintle.com/
```

### 3. Buy or Connect the Domain

Buy the domain from a registrar such as Namecheap, GoDaddy, Cloudflare Registrar, or Domains.co.za.

Use:

```text
LDidintle.com
```

### 4. Add the Custom Domain in GitHub

In the GitHub repository:

1. Go to `Settings`.
2. Go to `Pages`.
3. In `Custom domain`, enter:

```text
LDidintle.com
```

4. Save.
5. Turn on `Enforce HTTPS` once GitHub allows it.

### 5. Configure DNS at the Domain Registrar

Add these DNS records:

```text
Type: A
Name: @
Value: 185.199.108.153

Type: A
Name: @
Value: 185.199.109.153

Type: A
Name: @
Value: 185.199.110.153

Type: A
Name: @
Value: 185.199.111.153

Type: CNAME
Name: www
Value: LDidintle.github.io
```

DNS can take a few minutes to 24 hours to update.

## Alternative: Netlify

Netlify is also simple:

1. Create a Netlify account.
2. Choose `Add new site`.
3. Import the GitHub repository.
4. Leave build command empty.
5. Set publish directory to:

```text
.
```

6. Add `LDidintle.com` under `Domain management`.
7. Follow Netlify's DNS instructions.

## What to Update Before Publishing

- Replace or add a resume link if you want a downloadable PDF.
- Add screenshots later for the strongest projects.
- Keep project descriptions honest and based on actual repository code.
- Do not commit `.env` files, API keys, database passwords, or generated build folders.

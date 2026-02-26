# Zaava Collection (Angular 21) - Developer Documentation

This document explains the complete project structure, routing, page ownership, and exactly where to change things.

## 1. Project Overview

Zaava Collection is a standalone Angular 21 ecommerce web app with:

- User website (home, products, product details, cart, policy pages)
- Admin dashboard (login, dashboard, category master, product master, carousel master, orders)
- Static JSON/in-memory data (no backend yet)
- Bootstrap + FontAwesome UI
- WhatsApp-based order placement from cart

## 2. Tech Stack

- Angular `21.1.x` (standalone components + lazy loading)
- Bootstrap `5.3.x`
- RxJS
- FontAwesome (CDN in `src/index.html`)

## 3. Run the Project

```bash
npm install
npm run start
```

App runs at: `http://localhost:4200`

Useful commands:

```bash
npm run build
npm run test
npx tsc -p tsconfig.app.json --noEmit
```

## 4. Core Architecture

- Root app uses `app.routes.ts` with lazy-loaded feature routes.
- Two layout shells:
  - `WebsiteLayoutComponent` for customer-facing pages
  - `AdminLayoutComponent` for admin area
- `adminAuthGuard` protects all `/admin/*` routes.
- `AuthService` persists admin session in `localStorage` so refresh does not log out.
- Data comes from `src/app/core/data/*.data.ts` through services.

## 5. Folder Structure (Key)

```text
src/app/
  app.routes.ts
  app.config.ts
  app.ts / app.html / app.css

  core/
    data/
      products.data.ts
      categories.data.ts
      banners.data.ts
      orders.data.ts
    models/
      product.model.ts
      category.model.ts
      banner.model.ts
      order.model.ts
      user.model.ts
    services/
      product.service.ts
      category.service.ts
      banner.service.ts
      cart.service.ts
      order.service.ts
      auth.service.ts
      toast-notification.service.ts
    guards/
      admin-auth.guard.ts

  layouts/
    website-layout/
      website-layout.component.ts/html/css
    admin-layout/
      admin-layout.component.ts/html/css

  shared/
    components/
      product-card/
        product-card.component.ts/html/css
      cart-toast/
        cart-toast.component.ts/html/css

  features/
    home/
      home.page.ts/html/css
      home.routes.ts
    products/
      products.page.ts/html/css
      products.routes.ts
    product-details/
      product-details.page.ts/html/css
      product-details.routes.ts
    cart/
      cart.page.ts/html/css
      cart.routes.ts
    auth/
      admin-login.page.ts/html/css
      auth.routes.ts
    admin/
      dashboard/
      manage-categories/
      manage-products/
      manage-banners/
      orders/
    policies/
      terms-and-conditions.page.ts/html
      privacy-policy.page.ts/html
      shipping-policy.page.ts/html
      return-policy.page.ts/html
      policy-pages.css
```

## 6. Route Map

Defined in: `src/app/app.routes.ts`

### Website Routes

- `/` -> Home (`features/home`)
- `/products` -> Product listing (`features/products`)
- `/products/:id` -> Product details (`features/product-details`)
- `/cart` -> Cart + checkout popup + WhatsApp order (`features/cart`)
- `/terms-and-conditions` -> Policy page
- `/privacy-policy` -> Policy page
- `/shipping-policy` -> Policy page
- `/return-policy` -> Policy page

### Admin Routes

- `/admin-login` -> Admin login page
- `/admin/dashboard` -> Dashboard
- `/admin/categories` -> Category master CRUD
- `/admin/products` -> Product master CRUD
- `/admin/banners` -> Carousel master CRUD
- `/admin/orders` -> Orders list

`/admin/*` is protected by `adminAuthGuard`.

## 7. Page Ownership (What each page contains)

### Website

1. Home (`features/home`)
- Hero carousel (auto move)
- Women categories grid
- Saree spotlight section
- Category-wise product rows with `View All`
- Add-to-cart action from cards

2. Products (`features/products`)
- Search + category-filtered listing
- Shows products based on query params

3. Product Details (`features/product-details`)
- Main image + thumbnails
- Modal image viewer
- Size/quantity selectors
- Add to cart button
- Suggested products carousel

4. Cart (`features/cart`)
- Cart item list + quantity update/remove
- Order summary
- Place-order popup
- WhatsApp message send flow with product + customer details

5. Policy Pages (`features/policies`)
- Terms & Conditions
- Privacy Policy
- Shipping Policy
- Return Policy

### Admin

1. Admin Login (`features/auth/admin-login`)
- Modern login UI
- Demo credentials shown
- Redirects to dashboard after successful login

2. Dashboard (`features/admin/dashboard`)
- KPI cards + recent orders + sync status

3. Category Master (`features/admin/manage-categories`)
- Add/Edit/Delete category
- Parent category + featured toggle

4. Product Master (`features/admin/manage-products`)
- Add/Edit/Delete product
- Category dropdown from category master

5. Carousel Master (`features/admin/manage-banners`)
- Add/Edit/Delete hero slides 

6. Orders (`features/admin/orders`)
- Static order details and accordion view

## 8. Data & State Management

### Static Seed Data

- Products: `core/data/products.data.ts`
- Categories: `core/data/categories.data.ts`
- Banners: `core/data/banners.data.ts`
- Orders: `core/data/orders.data.ts`

### Services

- `ProductService`: product list + CRUD in memory
- `CategoryService`: category list + CRUD in memory
- `BannerService`: hero slide list + CRUD in memory
- `CartService`: `BehaviorSubject` cart state
- `AuthService`: admin auth + `localStorage` session
- `OrderService`: order list (static)
- `ToastNotificationService`: global animated cart toast

## 9. Where to Change What (Quick Guide)

### A) Change logo or branding

- Navbar/footer logo element: `layouts/website-layout/website-layout.component.html`
- Logo asset file: `public/zaava-logo.svg`
- Logo sizes/colors: `layouts/website-layout/website-layout.component.css`

### B) Change Instagram/social links

- Footer social links: `layouts/website-layout/website-layout.component.html`

### C) Add/Edit product/category/banner data

- Default seed data: `core/data/*.data.ts`
- Runtime CRUD behavior: related `core/services/*.service.ts`

### D) Edit homepage sections

- Data mapping: `features/home/home.page.ts`
- Layout/template: `features/home/home.page.html`
- Styling: `features/home/home.page.css`

### E) Edit Add to Cart button style globally

- Global button class: `src/styles.css`
- Class name used: `.btn-add-cart`

### F) Edit admin sidebar/topbar behavior

- Structure: `layouts/admin-layout/admin-layout.component.html`
- Navigation animation/style: `layouts/admin-layout/admin-layout.component.css`
- Route transition logic: `layouts/admin-layout/admin-layout.component.ts`

### G) Edit policy content/legal text

- Terms: `features/policies/terms-and-conditions.page.html`
- Privacy: `features/policies/privacy-policy.page.html`
- Shipping: `features/policies/shipping-policy.page.html`
- Return: `features/policies/return-policy.page.html`

### H) Edit WhatsApp order flow

- Logic + message format: `features/cart/cart.page.ts`
- Popup UI: `features/cart/cart.page.html`
- Popup style: `features/cart/cart.page.css`

## 10. Auth Notes

Admin credentials (static):

- Email: `admin@zaava.com`
- Password: `Admin@123`

Session behavior:

- Login persists across refresh via `localStorage` (`AuthService`)
- Logout clears session and routes to `/`

## 11. UI/Global Styling

- Main global styles: `src/styles.css`
- Includes:
  - Theme variables
  - Card/button/shared utilities
  - Modal blur behavior
  - Transition tuning

## 12. Current Limitations

- No backend/database (data resets on full reload except admin login session)
- Policy pages are static content pages
- WhatsApp order opens prefilled message; user sends final message manually in WhatsApp

## 13. Recommended Next Steps

1. Add `localStorage` persistence for categories/products/banners/cart.
2. Add backend APIs for orders and inventory sync.
3. Add role-based admin users and password reset.
4. Add unit/integration tests for services and critical routes.

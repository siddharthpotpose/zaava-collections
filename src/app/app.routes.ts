import { Routes } from '@angular/router';
import { adminAuthGuard } from './core/guards/admin-auth.guard';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { WebsiteLayoutComponent } from './layouts/website-layout/website-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: WebsiteLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./features/home/home.routes').then((m) => m.HOME_ROUTES)
      },
      {
        path: 'products',
        loadChildren: () => import('./features/products/products.routes').then((m) => m.PRODUCTS_ROUTES)
      },
      {
        path: 'products/:id',
        loadChildren: () =>
          import('./features/product-details/product-details.routes').then((m) => m.PRODUCT_DETAILS_ROUTES)
      },
      {
        path: 'cart',
        loadChildren: () => import('./features/cart/cart.routes').then((m) => m.CART_ROUTES)
      },
      {
        path: 'terms-and-conditions',
        loadComponent: () =>
          import('./features/policies/terms-and-conditions.page').then(
            (m) => m.TermsAndConditionsPage
          )
      },
      {
        path: 'privacy-policy',
        loadComponent: () => import('./features/policies/privacy-policy.page').then((m) => m.PrivacyPolicyPage)
      },
      {
        path: 'shipping-policy',
        loadComponent: () => import('./features/policies/shipping-policy.page').then((m) => m.ShippingPolicyPage)
      },
      {
        path: 'return-policy',
        loadComponent: () => import('./features/policies/return-policy.page').then((m) => m.ReturnPolicyPage)
      }
    ]
  },
  {
    path: 'admin-login',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES)
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivateChild: [adminAuthGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./features/admin/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES)
      },
      {
        path: 'categories',
        loadChildren: () =>
          import('./features/admin/manage-categories/manage-categories.routes').then(
            (m) => m.MANAGE_CATEGORIES_ROUTES
          )
      },
      {
        path: 'products',
        loadChildren: () =>
          import('./features/admin/manage-products/manage-products.routes').then(
            (m) => m.MANAGE_PRODUCTS_ROUTES
          )
      },
      {
        path: 'banners',
        loadChildren: () =>
          import('./features/admin/manage-banners/manage-banners.routes').then((m) => m.MANAGE_BANNERS_ROUTES)
      },
      {
        path: 'advertisements',
        loadChildren: () =>
          import('./features/admin/manage-advertisements/manage-advertisements.routes').then(
            (m) => m.MANAGE_ADVERTISEMENTS_ROUTES
          )
      },
      {
        path: 'orders',
        loadChildren: () => import('./features/admin/orders/orders.routes').then((m) => m.ORDERS_ROUTES)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];

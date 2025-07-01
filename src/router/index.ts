import { createRouter, createWebHashHistory } from 'vue-router';
import AppLayout from '@/layout/AppLayout.vue';
import ClientLayout from '@/layout/client/ClientLayout.vue';
import { AuthService } from '../service/auth/AuthService';
import type { UserResponse } from '../service/auth/AuthService';
import { useAuthStore } from '../stores/auth';


const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: AppLayout,
      meta: { requiresAuth: true, role: 'ADMIN' },
      children: [
        { path: '/', name: 'dashboard', component: () => import('@/views/Dashboard.vue') },
        { path: '/documentation', name: 'documentation', component: () => import('@/views/pages/admin/product/ProductList.vue') },
        { path: '/productadd', name: 'productadd', component: () => import('@/views/pages/admin/product/ProductForm.vue') },
        { path: '/product-parent/:id/update', name: 'ProductUpdateParent', component: () => import('@/views/pages/admin/product/ProductUpdateParent.vue') },
        { path: '/product/delete/:id', name: 'productupdatetrue', component: () => import('@/views/pages/admin/product/ProductUpdateParent.vue') },
        { path: '/product-child/:id/update', name: 'ProductUpdateChild', component: () => import('@/views/pages/admin/product/ProductUpdateChild.vue') },
        { path: '/addvariantsdetails/:id', name: 'addvariantsdetails', component: () => import('@/views/pages/admin/product/AddVariantsDetails.vue') },
        { path: '/category', name: 'category', component: () => import('@/views/pages/admin/category/CategoryList.vue') },
        { path: '/categoryadd', name: 'categoryadd', component: () => import('@/views/pages/admin/category/CategoryForm.vue') },
        { path: '/customers', name: 'customers', component: () => import('@/views/pages/admin/customer/CustomerList.vue') },
        { path: '/customers/edit/:id', name: 'customerEdit', component: () => import('@/views/pages/admin/customer/CustomerUpdate.vue') },
        { path: '/customerAdd', name: 'customerAdd', component: () => import('@/views/pages/admin/customer/CustomerForm.vue') },
        { path: '/supplier', name: 'supplier', component: () => import('@/views/pages/admin/supplier/SupplierList.vue') },
        { path: '/coupon', name: 'coupon', component: () => import('@/views/pages/admin/coupon/CouponList.vue') },
        { path: '/admin/coupon/gift/:couponId', name: 'GiftCoupon', component: () => import('@/views/pages/admin/coupon/CouponForm.vue') },
        { path: '/supplieradd', name: 'supplieradd', component: () => import('@/views/pages/admin/supplier/SupplierForm.vue') },
        { path: '/attribute', name: 'attribute', component: () => import('@/views/pages/admin/attribute/AttributeList.vue') },
        { path: '/discount', name: 'discount', component: () => import('@/views/pages/admin/discount/DiscountList.vue') },
        { path: '/discountadd', name: 'discountadd', component: () => import('@/views/pages/admin/discount/DiscountForm.vue') },
        { path: '/discount/:id/update', name: 'discountupdate', component: () => import('@/views/pages/admin/discount/DiscountFromUpdate.vue') },
        { path: '/tet', name: 'tet', component: () => import('@/views/pages/admin/discount/Tet.vue') },
        { path: '/attribute/edit', name: 'attributeadd', component: () => import('@/views/pages/admin/attribute/AttributeForm.vue') },
        { path: '/tag', name: 'tag', component: () => import('@/views/pages/admin/tag/TagList.vue') },
        { path: '/order', name: 'order', component: () => import('@/views/pages/admin/order/Invoice.vue') },
        { path: '/home', name: 'home', component: () => import('@/views/pages/admin/statistical/Statistical.vue') },
      ],
    },

    {
      path: '/client',
      component: ClientLayout,
      children: [
        { path: '', name: 'client-home', component: () => import('@/views/pages/client/Home.vue') },
        { path: 'about', name: 'client-about', component: () => import('@/views/pages/client/About.vue') },
        { path: 'product', name: 'client-product', component: () => import('@/views/pages/client/product/ProductList.vue') },
        { path: 'product/collection', name: 'client-product-collection', component: () => import('@/views/pages/client/product/ProductCollection.vue') },
        { path: 'product/:id', name: 'client-product-details', component: () => import('@/views/pages/client/product/ProductDetails.vue'),props: true, },
        { path: 'wishlist/:userId', name: 'client-wishlist-details', component: () => import('@/views/pages/client/wishlist/FavoriteProductlist.vue') },
        { path: 'cart/:userId', name: 'cart-view', component: () => import('@/views/pages/client/cart/CartView.vue'),
        meta: { requiresAuth: true, role: 'CUSTOMER' }, },
      ],
    },
    
    {
      path: '/auth',
      component: ClientLayout,
      children: [
        { path: 'login', name: 'login', component: () => import('@/views/pages/auth/Login.vue') },
        { path: 'register', name: 'register', component: () => import('@/views/pages/auth/Register.vue') },
        {

            //Phía ADMIN
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue')
                },
                {
                    path: '/documentation',
                    name: 'documentation',
                    component: () => import('@/views/pages/admin/product/ProductList.vue')
                },

                {
                    path: '/productadd',
                    name: 'prodductadd',
                    component: () => import('@/views/pages/admin/product/ProductForm.vue')
                },
                {
                    path: '/productupdateparent/:id',
                    name: 'ProductUpdateParent',
                    component: () => import('@/views/pages/admin/product/ProductUpdateParent.vue'),
                },
                {
                    path: '/productdelete/:id',
                    name: 'productupdatetrue',
                    component: () => import('@/views/pages/admin/product/ProductUpdateParent.vue'),
                },
                {
                    path: '/productupdatechild/:id',
                    name: 'ProductUpdateChild',
                    component: () => import('@/views/pages/admin/product/ProductUpdateChild.vue'),
                },
                {
                    path: '/addvariantsdetails/:id',
                    name: 'addvariantsdetails',
                    component: () => import('@/views/pages/admin/product/AddVariantsDetails.vue')
                },
                {
                    path: '/category',
                    name: 'category',
                    component: () => import('@/views/pages/admin/category/CategoryList.vue')
                },
                {
                    path: '/categoryadd',
                    name: 'categoryadd',
                    component: () => import('@/views/pages/admin/category/CategoryForm.vue')
                },
                {
                    path: '/customers',
                    name: 'customers',
                    component: () => import('@/views/pages/admin/customer/CustomerList.vue')
                },
                {
                    path: '/customers/edit/:id',
                    name: 'customerEdit',
                    component: () => import('@/views/pages/admin/customer/CustomerUpdate.vue')
                },
                {
                    path: '/customerAdd',
                    name: 'customerAdd',
                    component: () => import('@/views/pages/admin/customer/CustomerForm.vue')
                },
                {
                    path: '/supplier',
                    name: 'supplier',
                    component: () => import('@/views/pages/admin/supplier/SupplierList.vue')
                },
                {
                    path: '/coupon',
                    name: 'coupon',
                    component: () => import('@/views/pages/admin/coupon/CouponList.vue')
                },
                {
                    path: '/admin/coupon/gift/:couponId',
                    name: 'GiftCoupon',
                    component: () => import('@/views/pages/admin/coupon/CouponForm.vue')
                },
                {
                    path: '/supplieraddadd',
                    name: 'supplieradd',
                    component: () => import('@/views/pages/admin/supplier/SupplierForm.vue')
                },

                {
                    path: '/attribute',
                    name: 'attribute',
                    component: () => import('@/views/pages/admin/attribute/AttributeList.vue')
                },
                {
                    path: '/discount',
                    name: 'discount',
                    component: () => import('@/views/pages/admin/discount/DiscountList.vue')
                },
                {
                    path: '/discountadd',
                    name: 'discountadd',
                    component: () => import('@/views/pages/admin/discount/DiscountForm.vue')
                },

                {
                    path: '/discountupdate/:id',
                    name: 'discountupdate',
                    component: () => import('@/views/pages/admin/discount/DiscountFromUpdate.vue')
                },

                {
                    path: '/atributeadd',
                    name: 'atributeadd',
                    component: () => import('@/views/pages/admin/attribute/AttributeForm.vue')
                },
                {
                    path: '/tag',
                    name: 'tag',
                    component: () => import('@/views/pages/admin/tag/TagList.vue')
                },
                // phần BÁN HÀNG 
                {
                    path: '/order',
                    name: 'order',
                    component: () => import('@/views/pages/admin/order/Invoice.vue')
                },
                // phần thống kê
                {
                    path: '/home',
                    name: 'home',
                    component: () => import('@/views/pages/admin/statistical/Statistical.vue')
                },
                {
                    path: '/management',
                    name: 'management',
                    component: () => import('@/views/pages/admin/management/ManagementList.vue')
                },
                {
                    path: '/management/order/:id',
                    name: 'order-detail',
                    component: () => import('@/views/pages/admin/management/Management.vue')
                },
                {
                    path: '/uikit/formlayout',
                    name: 'formlayout',
                    component: () => import('@/views/uikit/FormLayout.vue')
                },

                {
                    path: '/uikit/formlayout',
                    name: 'formlayout',
                    component: () => import('@/views/uikit/FormLayout.vue')
                },
                {
                    path: '/uikit/input',
                    name: 'input',
                    component: () => import('@/views/uikit/Input.vue')
                },
                {
                    path: '/uikit/floatlabel',
                    name: 'floatlabel',
                    component: () => import('@/views/uikit/FloatLabel.vue')
                },
                {
                    path: '/uikit/invalidstate',
                    name: 'invalidstate',
                    component: () => import('@/views/uikit/InvalidState.vue')
                },
                {
                    path: '/uikit/button',
                    name: 'button',
                    component: () => import('@/views/uikit/Button.vue')
                },
                {
                    path: '/uikit/table',
                    name: 'table',
                    component: () => import('@/views/uikit/Table.vue')
                },
                {
                    path: '/uikit/list',
                    name: 'list',
                    component: () => import('@/views/uikit/List.vue')
                },
                {
                    path: '/uikit/tree',
                    name: 'tree',
                    component: () => import('@/views/uikit/Tree.vue')
                },
                {
                    path: '/uikit/panel',
                    name: 'panel',
                    component: () => import('@/views/uikit/Panels.vue')
                },

                {
                    path: '/uikit/overlay',
                    name: 'overlay',
                    component: () => import('@/views/uikit/Overlay.vue')
                },
                {
                    path: '/uikit/media',
                    name: 'media',
                    component: () => import('@/views/uikit/Media.vue')
                },
                {
                    path: '/uikit/menu',
                    component: () => import('@/views/uikit/Menu.vue'),
                    children: [
                        {
                            path: '/uikit/menu',
                            component: () => import('@/views/uikit/menu/PersonalDemo.vue')
                        },
                        {
                            path: '/uikit/menu/seat',
                            component: () => import('@/views/uikit/menu/SeatDemo.vue')
                        },
                        {
                            path: '/uikit/menu/payment',
                            component: () => import('@/views/uikit/menu/PaymentDemo.vue')
                        },
                        {
                            path: '/uikit/menu/confirmation',
                            component: () => import('@/views/uikit/menu/ConfirmationDemo.vue')
                        }
                    ]
                },
                {
                    path: '/uikit/message',
                    name: 'message',
                    component: () => import('@/views/uikit/Messages.vue')
                },
                {
                    path: '/uikit/file',
                    name: 'file',
                    component: () => import('@/views/uikit/File.vue')
                },
                {
                    path: '/uikit/charts',
                    name: 'charts',
                    component: () => import('@/views/uikit/Chart.vue')
                },
                {
                    path: '/uikit/misc',
                    name: 'misc',
                    component: () => import('@/views/uikit/Misc.vue')
                },
                {
                    path: '/blocks',
                    name: 'blocks',
                    component: () => import('@/views/utilities/Blocks.vue')
                },
                {
                    path: '/utilities/icons',
                    name: 'icons',
                    component: () => import('@/views/utilities/Icons.vue')
                },
                {
                    path: '/pages/timeline',
                    name: 'timeline',
                    component: () => import('@/views/pages/Timeline.vue')
                },
                {
                    path: '/pages/empty',
                    name: 'empty',
                    component: () => import('@/views/pages/Empty.vue')
                },
                {
                    path: '/pages/crud',
                    name: 'crud',
                    component: () => import('@/views/pages/Crud.vue')
                },
                {
                    path: '/pages/test',
                    name: 'test',
                    component: () => import('@/views/pages/Test.vue')
                },

                {
                    path: '/pages/producttest',
                    name: 'producttest',
                    component: () => import('@/views/pages/TestProduct.vue')
                },

            ]
        },
        // Phía Client

        {
            path: '/client',
            component: ClientLayout,
            children: [
                {
                    path: '',
                    name: 'client-home',
                    component: () => import('@/views/pages/client/Home.vue')
                },
                {
                    path: 'about',
                    name: 'client-about',
                    component: () => import('@/views/pages/client/About.vue')
                },
                {
                    path: 'product',
                    name: 'client-product',
                    component: () => import('@/views/pages/client/product/ProductList.vue')
                },
                {
                    path: 'product/collection',
                    name: 'client-product-collection',
                    component: () => import('@/views/pages/client/product/ProductCollection.vue')
                },
                {
                    path: 'product/:id',
                    name: 'client-product-details',
                    component: () => import('@/views/pages/client/product/ProductDetails.vue')
                }
            ]
        },


        {
          path: 'userdetails/:id',
          name: 'userdetails',
          component: () => import('@/views/pages/auth/UserDetails.vue'),
          meta: { requiresAuth: true, role: 'CUSTOMER' },
        },
        {
          path: 'change-password',
          name: 'change-password',
          component: () => import('@/views/pages/auth/ChangePassword.vue'),
          meta: { requiresAuth: true, role: 'CUSTOMER' },
        },
        { path: 'access', name: 'accessDenied', component: () => import('@/views/pages/auth/Access.vue') },
        { path: 'error', name: 'error', component: () => import('@/views/pages/auth/Error.vue') },
      ],
    },
    { path: '/landing', name: 'landing', component: () => import('@/views/pages/Landing.vue') },
    { path: '/:pathMatch(.*)*', name: 'notfound', component: () => import('@/views/pages/NotFound.vue') },
  ],
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiredRole = to.matched[0]?.meta.role;
  const userId = parseInt(sessionStorage.getItem('userId') || '0');

  if (userId && !isNaN(userId)) {
    try {
      const response = await AuthService.findByUserId(userId);
      if (response.data) {
        const user = response.data;
        sessionStorage.setItem('userInfo', JSON.stringify(user));
        sessionStorage.setItem('userId', user.userId.toString());
        authStore.setUser(user.userId, user);
        await authStore.fetchWishlist(); // Tải wishlist trước khi chuyển hướng
        await authStore.fetchCart();
      } else {
        sessionStorage.clear();
        authStore.clearUser();
      }
    } catch (error) {
      sessionStorage.clear();
      authStore.clearUser();
    }
  }

  if (requiresAuth && !authStore.userId) {
    next('/auth/login');
  } else if (requiresAuth && authStore.userId && requiredRole && authStore.userInfo?.role !== requiredRole) {
    if (authStore.userInfo?.role === 'ADMIN') {
      next('/category');
    } else if (authStore.userInfo?.role === 'CUSTOMER') {
      next('/client');
    } else {
      next('/auth/login');
    }
  } else {
    next();
  }
});

export default router;
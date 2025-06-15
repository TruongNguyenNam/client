import { createRouter, createWebHashHistory } from 'vue-router';
import AppLayout from '@/layout/AppLayout.vue';
import ClientLayout from '@/layout/client/ClientLayout.vue'; 

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
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
                path: 'product/:id',
                name: 'client-product-details',
                component: () => import('@/views/pages/client/product/ProductDetails.vue')
              }
            ]
          },


        {
            path: '/landing',
            name: 'landing',
            component: () => import('@/views/pages/Landing.vue')
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        },

        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        },
        {
            path: '/pages/admin/product/formpro',
            name: 'formpro',
            component: () => import('@/views/pages/admin/product/ProductForm.vue') // Đảm bảo file này tồn tại
        }
    ]
});

export default router;

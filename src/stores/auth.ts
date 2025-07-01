// src/stores/auth.ts
import { defineStore } from 'pinia';
import type { WishlistResponse, WishlistRequest } from '../model/client/wishlist';
import type { ShoppingCartResponse, ShoppingCartRequest } from '../model/client/cart';
import { WishlistClientService } from '../service/client/WishlistClientService';
import { CartClientService } from '../service/client/CartClientService';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    userId: null as number | null,
    userInfo: null as any | null,
    wishlist: [] as WishlistResponse[],
    wishlistCount: 0,
    cart: [] as ShoppingCartResponse[],
    cartCount: 0,
  }),
  actions: {
    setUser(userId: number, userInfo: any) {
      this.userId = userId;
      this.userInfo = userInfo;
    },
    clearUser() {
      this.userId = null;
      this.userInfo = null;
      this.wishlist = [];
      this.wishlistCount = 0;
      this.cart = [];
      this.cartCount = 0;
    },
    async fetchWishlist() {
      if (!this.userId) return;
      try {
        const response = await WishlistClientService.getWishlistByUserId(this.userId);
        if (response.status === 200 && response.data) {
          this.wishlist = response.data;
          this.wishlistCount = response.data.reduce((count, item) => count + (item.product?.length || 0), 0);
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách yêu thích:', error);
        this.wishlist = [];
        this.wishlistCount = 0;
      }
    },
    async addToWishlist(productId: number) {
      if (!this.userId) return;
      try {
        const request: WishlistRequest = {
          userId: this.userId,
          productId,
          addedDate: new Date(),
          deleted: false,
        };
        const response = await WishlistClientService.addToWishlist(request);
        if (response.status === 200) {
          await this.fetchWishlist();
        }
      } catch (error) {
        console.error('Lỗi khi thêm vào danh sách yêu thích:', error);
      }
    },
    async removeFromWishlist(wishlistId: number) {
      try {
        const response = await WishlistClientService.removeFromWishlist(wishlistId);
        if (response.status === 200) {
          await this.fetchWishlist();
        }
      } catch (error) {
        console.error('Lỗi khi xóa khỏi danh sách yêu thích:', error);
      }
    },
    async fetchCart() {
      if (!this.userId) return;
      try {
        const response = await CartClientService.viewCart(this.userId);
        if (response.status === 200 && response.data) {
          this.cart = response.data;
          this.cartCount = response.data.length; 
        }
      } catch (error) {
        console.error('Lỗi khi tải giỏ hàng:', error);
        this.cart = [];
        this.cartCount = 0;
      }
    },
    async addToCart(productId: number, quantity: number = 1) {
      if (!this.userId) return;
      try {
        const request: ShoppingCartRequest = {
          userId: this.userId,
          productId,
          quantity,
        };
        const response = await CartClientService.addToCart(request);
        if (response.status === 200) {
          await this.fetchCart();
        }
      } catch (error) {
        console.error('Lỗi khi thêm vào giỏ hàng:', error);
      }
    },
    async removeFromCart(cartItemId: number) {
      try {
        const response = await CartClientService.removeProductFromCart(cartItemId);
        if (response.status === 200) {
          await this.fetchCart();
        }
      } catch (error) {
        console.error('Lỗi khi xóa khỏi giỏ hàng:', error);
      }
    },
    async updateCartQuantity(cartItemId: number, quantity: number) {
      try {
        const response = await CartClientService.updateCartQuantity(cartItemId, quantity);
        if (response.status === 200) {
          await this.fetchCart();
        }
      } catch (error) {
        console.error('Lỗi khi cập nhật số lượng giỏ hàng:', error);
      }
    },
  },
});
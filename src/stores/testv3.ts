// đây là phần có danh sách yêu thích

import { defineStore } from 'pinia';
import type { WishlistResponse,WishlistRequest } from '../model/client/wishlist';
import { WishlistClientService } from '../service/client/WishlistClientService';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    userId: null as number | null,
    userInfo: null as any | null, 
    wishlist: [] as WishlistResponse[],
    wishlistCount: 0,
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
    },
    async fetchWishlist() {
      if (!this.userId) return;
      try {
        const response = await WishlistClientService.getWishlistByUserId(this.userId);
        if (response.status === 200 && response.data) {
          this.wishlist = response.data;
          // Tính tổng số sản phẩm trong tất cả các mục wishlist
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
  },
});
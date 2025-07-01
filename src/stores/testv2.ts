import { defineStore } from 'pinia';

// phần lưu trữ authen


export const useAuthStore = defineStore('auth', {
  state: () => ({
    userId: null as number | null,
    username: null as string | null,
    role: null as string | null,
  }),
  actions: {
    setUser(user: { userId: number; username: string; role: string }) {
      this.userId = user.userId;
      this.username = user.username;
      this.role = user.role;
    },
    clearUser() {
      this.userId = null;
      this.username = null;
      this.role = null;
    },
  },
  getters: {
    isAuthenticated: (state) => state.userId !== null,
  },
});
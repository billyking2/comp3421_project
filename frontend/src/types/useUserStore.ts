import {defineStore} from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        userId: null as string | null,
    }),
    actions: {
        setUserId(userId: string | null) {
            this.userId = userId;
        },
    },
})


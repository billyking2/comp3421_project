import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createPinia } from 'pinia';
import types from './types/index'
import router from './router/index'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { useUserStore } from './store/useUserStore.ts';
import { getCurrentUser } from './services/authService.ts';

const app = createApp(App)
const pinia = createPinia();

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}



app.use(pinia);
app.use(types)

const userStore = useUserStore()


try {
  const { data } = await getCurrentUser()

  if (data.authenticated) {
    userStore.setUser(data)
  } else {
    userStore.signOut()
  }

} catch (error) {
  console.error('Failed to check authentication status:', error)
  userStore.signOut()
} finally {
  userStore.setInitialized()
}

app.use(router);
app.mount('#app')

import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createPinia } from 'pinia';
import types from './types/index.ts'
import router from './router/index.ts'

const app = createApp(App)
const pinia = createPinia();
app.use(router);
app.use(pinia);
app.use(types)
app.mount('#app')

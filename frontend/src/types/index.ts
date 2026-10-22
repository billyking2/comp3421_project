import type { App } from 'vue'
import lazyLoad from './lazyLoad'

export default {
  install(app: App) {
    app.directive('lazyLoad', lazyLoad)
  },
}
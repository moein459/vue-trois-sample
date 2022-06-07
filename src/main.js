import { createApp } from 'vue'
import App from './App.vue'

import { TroisJSVuePlugin } from 'troisjs'

const app = createApp(App)
    .use(TroisJSVuePlugin)

app.mount('#app');

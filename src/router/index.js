import { createRouter, createWebHistory } from 'vue-router';
import Layout from '../components/Layout.vue';
import FileUploader from '../pages/FileUploader.vue';
import FileViewer from '../components/FileViewer.vue';
import Manage from '../pages/Manage.vue';
import TextToQR from '../pages/TextToQR.vue';
import URLShortener from '../pages/URLShortener.vue';
import Redirect from '../components/Redirect.vue';
import Home from '../pages/Home.vue';

const routes = [
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '',
        component: Home,
        props: true
      },
      {
        path: 'upload',
        component: FileUploader,
        props: true
      },
      {
        path: 'view',
        component: FileViewer
      },
      {
        path: 'view/:hash',
        component: FileViewer
      },
      {
        path: 'manage',
        component: Manage,
        props: true
      },
      {
        path: 'text',
        component: TextToQR
      },
      {
        path: 'url',
        component: URLShortener
      }
    ]
  },
  {
    path: '/r/:hash',
    component: Redirect
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
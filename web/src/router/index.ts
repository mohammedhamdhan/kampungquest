import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { supabase } from '@/lib/supabase'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Welcome',
    component: () => import('@/pages/Welcome.vue')
  },
  {
    path: '/auth',
    name: 'Auth',
    component: () => import('@/pages/AuthPage.vue')
  },
  {
    path: '/onboarding',
    name: 'Onboarding',
    component: () => import('@/pages/Onboarding.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/quests',
    name: 'QuestList',
    component: () => import('@/pages/QuestList.vue'),
    meta: { requiresAuth: true, requiresRole: true }
  },
  {
    path: '/teach/:questId',
    name: 'TeachQuest',
    component: () => import('@/pages/TeachQuest.vue'),
    props: true,
    meta: { requiresAuth: true, requiresRole: true }
  },
  {
    path: '/review',
    name: 'ReviewTile',
    component: () => import('@/pages/ReviewTile.vue'),
    meta: { requiresAuth: true, requiresRole: true }
  },
  {
    path: '/map',
    name: 'Map',
    component: () => import('@/pages/Map.vue'),
    meta: { requiresAuth: true, requiresRole: true }
  },
  {
    path: '/pairs',
    name: 'Pairs',
    component: () => import('@/pages/PairsPage.vue'),
    meta: { requiresAuth: true, requiresRole: true }
  },
  {
    path: '/join/:code',
    name: 'JoinPair',
    component: () => import('@/pages/JoinPair.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/pages/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/pages/Settings.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/community',
    name: 'Community',
    component: () => import('@/pages/Community.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession()
  const isAuthenticated = !!session?.user

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Auth', query: { redirect: to.fullPath } })
    return
  }

  if (to.meta.requiresRole && isAuthenticated) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session!.user.id)
      .single()

    if (!userData?.role) {
      next({ name: 'Onboarding' })
      return
    }
  }

  next()
})

export default router
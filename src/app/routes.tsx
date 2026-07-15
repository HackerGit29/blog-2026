import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Pages publiques
import { PortfolioHome } from '../pages/PortfolioHome';
import { Blog } from '../pages/Blog';
import { BlogArticle } from '../pages/BlogArticle';
import { BlogVideos } from '../pages/BlogVideos';

// Auth
import { Login } from '../pages/auth/Login';

// Admin
import { AdminContent } from '../pages/AdminContent';
import { AdminLayout } from '../pages/admin/AdminLayout';
import { AdminDashboard } from '../pages/admin/Dashboard';
import { ArticleManager } from '../pages/admin/ArticleManager';
import { AdminVideos } from '../pages/admin/AdminVideos';
import { AdminCommunity } from '../pages/admin/AdminCommunity';
import { AdminSettings } from '../pages/admin/AdminSettings';
import { AdminMessages } from '../components/admin/AdminMessages';
import { AdminNotifications } from '../components/admin/AdminNotifications';

// Inbox
import { Inbox } from '../pages/Inbox';

// Guards
import { AuthGuard } from '../components/auth/AuthGuard';
import { AdminGuard } from '../components/auth/AdminGuard';
import { SuperAdminGuard } from '../components/auth/SuperAdminGuard';
import { RootRedirect } from '../components/auth/RootRedirect';

/**
 * Table de routage de l'application.
 *
 * Hiérarchie des accès :
 *   Public          → /blog, /blog/*, /:username
 *   Admin           → /admin (dashboard, articles, vidéos, paramètres)
 *   SuperAdmin only → /admin/community
 *
 * Route racine `/` :
 *   Connecté → redirige vers /:username (profil personnel)
 *   Invité   → PortfolioHome avec données du store
 */
export function AppRoutes() {
  return (
    <Routes>
      {/* ── Racine ──────────────────────────────────────────────── */}
      <Route path="/" element={<RootRedirect />} />

      {/* ── Blog public ─────────────────────────────────────────── */}
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/videos" element={<BlogVideos />} />
      <Route path="/blog/:slug" element={<BlogArticle />} />

      {/* ── Auth ────────────────────────────────────────────────── */}
      <Route path="/login" element={<Login />} />

      {/* ── Inbox (auth requis) ─────────────────────────────────── */}
      <Route
        path="/inbox"
        element={
          <AuthGuard>
            <Inbox />
          </AuthGuard>
        }
      />

      {/* ── Route bloquée /goal ─────────────────────────────────── */}
      <Route path="/goal" element={<Navigate to="/blog" replace />} />

      {/* ── Admin (role = admin) ────────────────────────────────── */}
      <Route
        path="/admin"
        element={
          <AuthGuard>
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          </AuthGuard>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="articles" element={<ArticleManager />} />
        <Route path="videos" element={<AdminVideos />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="notifications" element={<AdminNotifications />} />

        {/* SuperAdmin uniquement */}
        <Route
          path="community"
          element={
            <SuperAdminGuard>
              <AdminCommunity />
            </SuperAdminGuard>
          }
        />
      </Route>

      {/* Legacy */}
      <Route
        path="/admin/content"
        element={
          <AuthGuard>
            <AdminGuard>
              <AdminContent />
            </AdminGuard>
          </AuthGuard>
        }
      />

      {/* ── Profil public /:username ─────────────────────────────── */}
      <Route path="/:username" element={<PortfolioHome />} />

      {/* ── 404 ─────────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/blog" replace />} />
    </Routes>
  );
}

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Pages publiques
import { PortfolioHome } from '../pages/PortfolioHome';
import { BlogArticle } from '../pages/BlogArticle';

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
import { Banned } from '../pages/Banned';

// Guards
import { AuthGuard } from '../components/auth/AuthGuard';
import { AdminGuard } from '../components/auth/AdminGuard';
import { SuperAdminGuard } from '../components/auth/SuperAdminGuard';
import { RootRedirect } from '../components/auth/RootRedirect';

/**
 * Table de routage de l'application.
 *
 * Hiérarchie des accès :
 *   Public (par tenant) → /:user, /:user/blog/:slug, /:user/videos/:slug
 *   Auth               → /login, /inbox, /banned
 *   Admin              → /admin/*
 *   SuperAdmin only    → /admin/community
 *
 * Route racine `/` :
 *   Connecté → redirige vers /:user (profil public)
 *   Invité   → profil par défaut du store
 *
 * Le segment `:user` identifie le tenant (ex: "admin"). Toutes les pages
 * publiques sont scopées par tenant.
 */
export function AppRoutes() {
  return (
    <Routes>
      {/* ── Racine ──────────────────────────────────────────────── */}
      <Route path="/" element={<RootRedirect />} />

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

      {/* ── Banned ──────────────────────────────────────────────── */}
      <Route path="/banned" element={<Banned />} />

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

      {/* ── Profil public /:user ────────────────────────────────── */}
      <Route path="/:user" element={<PortfolioHome />} />

      {/* ── Contenu par slug : /:user/blog/:slug ou /:user/videos/:slug ── */}
      <Route path="/:user/blog/:slug" element={<BlogArticle />} />
      <Route path="/:user/videos/:slug" element={<BlogArticle />} />

      {/* ── 404 ─────────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

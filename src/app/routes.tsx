import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Blog } from '../pages/Blog';
import { BlogArticle } from '../pages/BlogArticle';
import { BlogVideos } from '../pages/BlogVideos';
import { AdminContent } from '../pages/AdminContent';
import { Login } from '../pages/auth/Login';
import { AdminLayout } from '../pages/admin/AdminLayout';
import { AdminDashboard } from '../pages/admin/Dashboard';
import { ArticleManager } from '../pages/admin/ArticleManager';
import { AdminVideos } from '../pages/admin/AdminVideos';
import { AdminCommunity } from '../pages/admin/AdminCommunity';
import { AdminSettings } from '../pages/admin/AdminSettings';
import { AuthGuard } from '../components/auth/AuthGuard';
import { AdminGuard } from '../components/auth/AdminGuard';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/blog" replace />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/videos" element={<BlogVideos />} />
      <Route path="/blog/:slug" element={<BlogArticle />} />

      <Route path="/login" element={<Login />} />

      <Route path="/admin" element={
        <AuthGuard>
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        </AuthGuard>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="articles" element={<ArticleManager />} />
        <Route path="videos" element={<AdminVideos />} />
        <Route path="community" element={<AdminCommunity />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="/admin/content" element={<AuthGuard><AdminGuard><AdminContent /></AdminGuard></AuthGuard>} />

      <Route path="*" element={<Navigate to="/blog" replace />} />
    </Routes>
  );
}

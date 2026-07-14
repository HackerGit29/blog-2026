import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Blog } from '../pages/Blog';
import { BlogArticle } from '../pages/BlogArticle';
import { BlogVideos } from '../pages/BlogVideos';
import { AdminContent } from '../pages/AdminContent';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/blog" replace />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/videos" element={<BlogVideos />} />
      <Route path="/blog/:slug" element={<BlogArticle />} />
      
      <Route path="/admin/content" element={<AdminContent />} />
    </Routes>
  );
}

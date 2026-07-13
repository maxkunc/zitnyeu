import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import IndexPage from "@/pages/Index";
import AdminPage from "@/routes/admin";
import ProjectDetailPage from "@/routes/projekty.$id";
import NotFoundPage from "@/pages/NotFound";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/projekty/:id" element={<ProjectDetailPage />} />
        {/* Zpětná kompatibilita se starým base path /zitnyeu */}
        <Route path="/zitnyeu" element={<Navigate to="/" replace />} />
        <Route path="/zitnyeu/*" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
    </>
  );
}

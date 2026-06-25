import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import IndexPage from "@/pages/Index";
import AdminPage from "@/pages/Admin";
import ProjectDetailPage from "@/pages/ProjectDetail";
import NotFoundPage from "@/pages/NotFound";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/projekty/:id" element={<ProjectDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
    </>
  );
}

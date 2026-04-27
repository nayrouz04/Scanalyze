import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard    from "../pages/dashboard/Dashboard";
import Upload       from "../pages/upload/Upload";
import Editor       from "../pages/editor/Editor";
import Verification from "../pages/verification/Verification";
import UserManagement from "../pages/userManagement/UserManagement";
import DataExport   from "../pages/dataExport/DataExport";
import LoginPage    from "../pages/auth/LoginPage";
import SignUpPage   from "../pages/auth/SignUpPage";
import DashboardLayout from "../layouts/DashboardLayout";
import PrivateRoute from "../routes/PrivateRoute";

export default function AppNavigation() {
  return (
    <BrowserRouter>
      <Routes>

        {/* AUTH — pages publiques */}
        <Route path="/login"  element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* DASHBOARD — pages protégées */}
        <Route element={<PrivateRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/"            element={<Dashboard />} />
            <Route path="/upload"      element={<Upload />} />
            <Route path="/editor"      element={<Editor />} />
            <Route path="/verification" element={<Verification />} />
            <Route path="/users"       element={<UserManagement />} />
            <Route path="/export"      element={<DataExport />} />
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
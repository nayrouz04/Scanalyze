import { Routes, Route } from "react-router-dom";
import DashboardLayout  from "../layouts/DashboardLayout";
import PrivateRoute, { ProtectedStep } from "./PrivateRoute";
import LoginPage        from "../pages/auth/LoginPage";
import SignUpPage       from "../pages/auth/SignUpPage";
import Dashboard        from "../pages/dashboard/Dashboard";
import Upload           from "../pages/upload/Upload";
import Editor           from "../pages/editor/Editor";
import Verification     from "../pages/verification/Verification";
import UserManagement   from "../pages/userManagement/UserManagement";
import DataExport       from "../pages/dataExport/DataExport";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login"  element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      <Route element={
        <PrivateRoute>
          <DashboardLayout />
        </PrivateRoute>
      }>
        <Route path="/" element={<Dashboard />} />

        <Route path="/upload" element={
          <PrivateRoute userOnly><Upload /></PrivateRoute>
        } />

        <Route path="/verification" element={
          <PrivateRoute userOnly>
            <ProtectedStep stepId="verification">
              <Verification />
            </ProtectedStep>
          </PrivateRoute>
        } />

        <Route path="/editor" element={
          <PrivateRoute userOnly>
            <ProtectedStep stepId="editor">
              <Editor />
            </ProtectedStep>
          </PrivateRoute>
        } />

        <Route path="/export" element={
          <PrivateRoute userOnly>
            <ProtectedStep stepId="export">
              <DataExport />
            </ProtectedStep>
          </PrivateRoute>
        } />

        <Route path="/users" element={
          <PrivateRoute adminOnly><UserManagement /></PrivateRoute>
        } />
      </Route>
    </Routes>
  );
}
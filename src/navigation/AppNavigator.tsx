// ─────────────────────────────────────────────
//  navigation/AppNavigator.tsx
//  Chef d'orchestre de toute la navigation
//  → Déclare toutes les routes de l'app
//  → Associe chaque URL → composant
//  → Gère les redirections
//  → Utilise PrivateRoute pour protéger les pages
//  → SignUp est privée (Admin seulement)
// ─────────────────────────────────────────────

import { Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "./routes";
import PrivateRoute from "./PrivateRoute";

// ── Pages publiques ───────────────────────────
import Login from "../containers/Login";

// ── Pages privées ─────────────────────────────
import SignUp       from "../containers/SignUp";
import Dashboard    from "../containers/Dashboard";
import Upload       from "../containers/Upload";
import Editor       from "../containers/Editor";
import Verification from "../containers/Verification";
import DataExport   from "../containers/DataExport";

// ─────────────────────────────────────────────
export default function AppNavigator() {
  return (
    <Routes>

      {/* Page par défaut → Login */}
      <Route
        path={ROUTES.DEFAULT}
        element={<Navigate to={ROUTES.LOGIN} replace />}
      />

      {/* ══════════════════════════════════════
           PAGE PUBLIQUE
           Seul Login est accessible sans connexion
          ══════════════════════════════════════ */}
      <Route
        path={ROUTES.LOGIN}
        element={<Login />}
      />

      {/* ══════════════════════════════════════
           PAGES PRIVÉES
           Toutes nécessitent une connexion
           SignUp → réservé à l'Admin
          ══════════════════════════════════════ */}
      <Route
        path={ROUTES.SIGNUP}
        element={
          <PrivateRoute>
            <SignUp />
          </PrivateRoute>
        }
      />
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path={ROUTES.UPLOAD}
        element={
          <PrivateRoute>
            <Upload />
          </PrivateRoute>
        }
      />
      <Route
        path={ROUTES.EDITOR}
        element={
          <PrivateRoute>
            <Editor />
          </PrivateRoute>
        }
      />
      <Route
        path={ROUTES.VERIFICATION}
        element={
          <PrivateRoute>
            <Verification />
          </PrivateRoute>
        }
      />
      <Route
        path={ROUTES.EXPORT}
        element={
          <PrivateRoute>
            <DataExport />
          </PrivateRoute>
        }
      />

      {/* Route inconnue → Login */}
      <Route
        path="*"
        element={<Navigate to={ROUTES.LOGIN} replace />}
      />

    </Routes>
  );
}
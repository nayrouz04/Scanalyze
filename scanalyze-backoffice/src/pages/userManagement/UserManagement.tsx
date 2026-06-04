// src/pages/userManagement/UserManagement.tsx  (backoffice)
import { useState } from "react";
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody,
  Chip, IconButton, TextField, Select, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions, FormControl, InputLabel, Tooltip,
  Pagination, InputAdornment, Switch, Avatar, CircularProgress, Alert, Tabs, Tab,
} from "@mui/material";
import AddIcon         from "@mui/icons-material/Add";
import EditIcon        from "@mui/icons-material/Edit";
import DeleteIcon      from "@mui/icons-material/Delete";
import SearchIcon      from "@mui/icons-material/Search";
import BlockIcon       from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { colors, inputSx, selectSx, tableHeadCellSx, tableCellSx, btnPrimarySx, btnDangerSx } from "@theme";

import {
  useListUsersQuery,
  useListPendingUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useEnableUserMutation,
  useDisableUserMutation,
} from "@services/adminApi";

import type { AdminUser } from "@models/authModels";

const ROWS_PER_PAGE = 5;

const emptyForm = {
  full_name:      "",
  email:          "",
  role:           "user" as "admin" | "user",
  password:       "",
  office_address: "",
  phone_nbr:      "",
};

const AVATAR_PALETTE = [
  colors.blueButton, "#0f766e", "#7c3aed", "#b45309", "#be185d", "#065f46",
];

const switchCheckedSx = {
  "& .MuiSwitch-switchBase.Mui-checked":                    { color: colors.green  },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#166534"   },
} as const;

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function getAvatarColor(name: string) {
  return AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length];
}

export default function UserManagement() {

  const [tab,          setTab]          = useState<0 | 1>(0);
  const [search,       setSearch]       = useState<string>("");
  const [roleFilter,   setRoleFilter]   = useState<string>("all");
  const [page,         setPage]         = useState<number>(1);
  const [createOpen,   setCreateOpen]   = useState<boolean>(false);
  const [editOpen,     setEditOpen]     = useState<boolean>(false);
  const [deleteOpen,   setDeleteOpen]   = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [form,         setForm]         = useState(emptyForm);
  const [editActive,   setEditActive]   = useState<boolean>(true);

  // ── RTK Query ───────────────────────────────────────────────────────────────
  const { data: allUsers     = [], isLoading: loadingAll,     isError: errorAll     } = useListUsersQuery();
  const { data: pendingUsers = [], isLoading: loadingPending, isError: errorPending } = useListPendingUsersQuery();

  const [createUser, { isLoading: creating }] = useCreateUserMutation();
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation();
  const [enableUser]                          = useEnableUserMutation();
  const [disableUser]                         = useDisableUserMutation();

  // ── Données selon l'onglet actif ────────────────────────────────────────────
  const users     = tab === 0 ? allUsers : pendingUsers;
  const isLoading = tab === 0 ? loadingAll : loadingPending;
  const isError   = tab === 0 ? errorAll   : errorPending;

  const filtered = users.filter((u) => {
    const matchSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginated  = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  const isRestricted = (user: AdminUser) => user.role === "admin";

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    try {
      await createUser({
        email:          form.email,
        password:       form.password,
        full_name:      form.full_name,
        office_address: form.office_address,
        phone_nbr:      form.phone_nbr || undefined,
        role:           form.role,
        is_active:      true,
      }).unwrap();
      setCreateOpen(false);
      setForm(emptyForm);
    } catch (err) { console.error("Erreur création:", err); }
  };

  const handleEdit = async () => {
    if (!selectedUser) return;
    try {
      await updateUser({
        id:   selectedUser.id,
        data: { full_name: form.full_name, email: form.email, is_active: editActive },
      }).unwrap();
      setEditOpen(false);
      setSelectedUser(null);
    } catch (err) { console.error("Erreur modification:", err); }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await deleteUser(selectedUser.id).unwrap();
      setDeleteOpen(false);
      setSelectedUser(null);
    } catch (err) { console.error("Erreur suppression:", err); }
  };

  const handleToggleActive = async (user: AdminUser) => {
    if (isRestricted(user)) return;
    try {
      if (user.is_active) {
        await disableUser(user.id).unwrap();
      } else {
        await enableUser(user.id).unwrap();
      }
    } catch (err) { console.error("Erreur toggle:", err); }
  };

  const openEdit = (user: AdminUser) => {
    setSelectedUser(user);
    setForm({ full_name: user.full_name, email: user.email, role: user.role, password: "", office_address: user.office_address ?? "", phone_nbr: user.phone_nbr ?? "" });
    setEditActive(user.is_active);
    setEditOpen(true);
  };

  const openDelete = (user: AdminUser) => { setSelectedUser(user); setDeleteOpen(true); };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>

      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color={colors.textWhite}>
            User Management
          </Typography>
          <Typography variant="body2" color={colors.textMuted} mt={0.5}>
            Manage and control system users
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}
          onClick={() => { setForm(emptyForm); setCreateOpen(true); }} sx={btnPrimarySx}>
          Create User
        </Button>
      </Box>

      {/* Onglets */}
      <Tabs
        value={tab}
        onChange={(_, v) => { setTab(v); setPage(1); setSearch(""); }}
        sx={{ mb: 2, "& .MuiTab-root": { color: colors.textMuted }, "& .Mui-selected": { color: colors.blueMuted } }}
      >
        <Tab label={`Tous les utilisateurs (${allUsers.length})`} />
        <Tab
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              En attente
              {pendingUsers.length > 0 && (
                <Chip label={pendingUsers.length} size="small"
                  sx={{ bgcolor: colors.amber, color: "#000", fontSize: 10, height: 18 }} />
              )}
            </Box>
          }
        />
      </Tabs>

      {/* Contenu */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <CircularProgress size={32} />
        </Box>
      ) : isError ? (
        <Alert severity="error">Impossible de charger les utilisateurs.</Alert>
      ) : (
        <Box sx={{ bgcolor: colors.bgCard, borderRadius: 2, border: `1px solid ${colors.borderCard}`, p: 2 }}>

          {/* Filtres */}
          <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
            <TextField
              placeholder="Search by name, email..."
              value={search} size="small"
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              sx={{ flex: 1, minWidth: 200, ...inputSx }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: colors.textMuted, fontSize: 18 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select value={roleFilter} displayEmpty sx={selectSx}
                onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="user">User</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Tableau */}
          {filtered.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Typography color={colors.textMuted}>Aucun utilisateur trouvé.</Typography>
            </Box>
          ) : (
            <>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={tableHeadCellSx}>Full Name</TableCell>
                    <TableCell sx={tableHeadCellSx}>Role</TableCell>
                    <TableCell sx={tableHeadCellSx}>Active</TableCell>
                    <TableCell sx={{ ...tableHeadCellSx, textAlign: "right" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginated.map((user) => {
                    const restricted = isRestricted(user);
                    return (
                      <TableRow key={user.id} sx={{ "&:hover": { bgcolor: colors.bgDark }, opacity: restricted ? 0.75 : 1 }}>

                        <TableCell sx={tableCellSx}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Avatar sx={{ width: 34, height: 34, bgcolor: getAvatarColor(user.full_name), fontSize: 13, fontWeight: "bold" }}>
                              {getInitials(user.full_name)}
                            </Avatar>
                            <Box>
                              <Typography color={colors.textWhite} fontSize={13} fontWeight={500}>{user.full_name}</Typography>
                              <Typography color={colors.textMuted} fontSize={11}>{user.email}</Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell sx={tableCellSx}>
                          <Chip label={user.role.toUpperCase()} size="small" variant="outlined"
                            sx={{ borderColor: user.role === "admin" ? colors.blueButton : colors.borderCard, color: user.role === "admin" ? colors.blueMuted : colors.textMuted, fontSize: 10 }} />
                        </TableCell>

                        <TableCell sx={tableCellSx}>
                          {tab === 1 ? (
                            // Onglet pending — boutons approuver/refuser
                            <Box sx={{ display: "flex", gap: 0.5 }}>
                              <Tooltip title="Approuver">
                                <IconButton size="small" onClick={() => handleToggleActive(user)}
                                  disabled={user.is_active} sx={{ color: colors.green, "&:hover": { bgcolor: `${colors.green}22` } }}>
                                  <CheckCircleIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Désactiver">
                                <IconButton size="small" onClick={() => handleToggleActive(user)}
                                  disabled={!user.is_active} sx={{ color: colors.red, "&:hover": { bgcolor: `${colors.red}22` } }}>
                                  <BlockIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          ) : (
                            // Onglet tous — switch
                            <Tooltip title={restricted ? "Cannot change admin status" : user.is_active ? "Désactiver" : "Activer"}>
                              <span>
                                <Switch checked={user.is_active} size="small"
                                  onChange={() => handleToggleActive(user)}
                                  disabled={restricted} sx={switchCheckedSx} />
                              </span>
                            </Tooltip>
                          )}
                        </TableCell>

                        <TableCell sx={{ ...tableCellSx, textAlign: "right" }}>
                          {restricted ? (
                            <Tooltip title="Admins cannot manage other admins">
                              <span>
                                <IconButton size="small" disabled sx={{ color: colors.borderCard }}>
                                  <BlockIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          ) : (
                            <>
                              <Tooltip title="Modifier">
                                <IconButton size="small" onClick={() => openEdit(user)} sx={{ color: colors.blueMuted }}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Supprimer">
                                <IconButton size="small" onClick={() => openDelete(user)} sx={{ color: colors.red }}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2, flexWrap: "wrap", gap: 1 }}>
                <Typography variant="caption" color={colors.textMuted}>
                  Showing {Math.min((page - 1) * ROWS_PER_PAGE + 1, filtered.length)} to{" "}
                  {Math.min(page * ROWS_PER_PAGE, filtered.length)} of {filtered.length} users
                </Typography>
                {totalPages > 1 && (
                  <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} size="small" />
                )}
              </Box>
            </>
          )}
        </Box>
      )}

      {/* Dialog Create */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)}>
        <DialogTitle sx={{ color: colors.textWhite }}>Create User</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="Full Name" fullWidth value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })} sx={inputSx} />
            <TextField label="Email" fullWidth value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} sx={inputSx} />
            <TextField label="Office Address" fullWidth value={form.office_address}
              onChange={(e) => setForm({ ...form, office_address: e.target.value })} sx={inputSx} />
            <TextField label="Phone (optionnel)" fullWidth value={form.phone_nbr}
              onChange={(e) => setForm({ ...form, phone_nbr: e.target.value })} sx={inputSx} />
            <FormControl fullWidth>
              <InputLabel sx={{ color: colors.textMuted }}>Role</InputLabel>
              <Select value={form.role} label="Role"
                onChange={(e) => setForm({ ...form, role: e.target.value as "admin" | "user" })} sx={selectSx}>
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Password" type="password" fullWidth value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} sx={inputSx} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateOpen(false)} sx={{ color: colors.textMuted }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}
            disabled={creating || !form.full_name || !form.email || !form.password || !form.office_address}
            sx={btnPrimarySx}>
            {creating ? <CircularProgress size={18} /> : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Edit */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle sx={{ color: colors.textWhite }}>Edit User</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="Full Name" fullWidth value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })} sx={inputSx} />
            <TextField label="Email" fullWidth value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} sx={inputSx} />
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1.5, borderRadius: 1.5, border: `1px solid ${colors.borderCard}`, bgcolor: colors.bgDark }}>
              <Box>
                <Typography variant="body2" color={colors.textWhite} fontWeight={600}>Compte actif</Typography>
                <Typography variant="caption" color={colors.textMuted}>
                  {editActive ? "L'utilisateur peut se connecter" : "Accès désactivé"}
                </Typography>
              </Box>
              <Switch checked={editActive} onChange={(e) => setEditActive(e.target.checked)} sx={switchCheckedSx} />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditOpen(false)} sx={{ color: colors.textMuted }}>Cancel</Button>
          <Button variant="contained" onClick={handleEdit}
            disabled={updating || !form.full_name || !form.email} sx={btnPrimarySx}>
            {updating ? <CircularProgress size={18} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Delete */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle sx={{ color: colors.textWhite }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography color={colors.textMuted}>
            Are you sure you want to delete{" "}
            <Typography component="span" color={colors.textWhite} fontWeight="bold">
              {selectedUser?.full_name}
            </Typography>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)} sx={{ color: colors.textMuted }}>Cancel</Button>
          <Button variant="contained" onClick={handleDelete} disabled={deleting} sx={btnDangerSx}>
            {deleting ? <CircularProgress size={18} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
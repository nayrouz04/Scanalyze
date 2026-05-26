// UserManagement — admin page for creating, editing, deleting, and toggling users
// Admin users are visible but their action buttons are locked (restricted)
import { useState } from "react";
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody,
  Chip, IconButton, TextField, Select, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions, FormControl, InputLabel, Tooltip,
  Pagination, InputAdornment, Switch, Avatar,
} from "@mui/material";
import AddIcon    from "@mui/icons-material/Add";
import EditIcon   from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import BlockIcon  from "@mui/icons-material/Block";
import {
  colors, inputSx, selectSx,
  tableHeadCellSx, tableCellSx,
  btnPrimarySx, btnDangerSx,
} from "@theme";
 
interface User {
  id:       string;
  fullName: string;
  email:    string;
  role:     "admin" | "user";
  active:   boolean;
}
 
const MOCK_USERS: User[] = [
  { id: "1", fullName: "Julianne Devis",    email: "j.devis@scanalyze.io",      role: "admin", active: true  },
  { id: "2", fullName: "Marcus Knight",     email: "m.knight@scanalyze.io",     role: "user",  active: true  },
  { id: "3", fullName: "Sarah Lopez",       email: "s.lopez@scanalyze.io",      role: "user",  active: false },
  { id: "4", fullName: "Robert Blackstone", email: "r.blackstone@scanalyze.io", role: "admin", active: true  },
  { id: "5", fullName: "Nina Patel",        email: "n.patel@scanalyze.io",      role: "user",  active: false },
  { id: "6", fullName: "Tom Erikson",       email: "t.erikson@scanalyze.io",    role: "user",  active: true  },
];
 
const ROWS_PER_PAGE = 4;
 
const emptyForm = { fullName: "", email: "", role: "user" as "admin" | "user", password: "" };
 
const AVATAR_PALETTE = [
  colors.blueButton, "#0f766e", "#7c3aed", "#b45309", "#be185d", "#065f46",
];
 
const switchCheckedSx = {
  "& .MuiSwitch-switchBase.Mui-checked":                   { color: colors.green },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#166534" },
} as const;
 
function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}
 
function getAvatarColor(name: string) {
  return AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length];
}
 
export default function UserManagement() {
  const [users,        setUsers]        = useState<User[]>(MOCK_USERS);
  const [search,       setSearch]       = useState<string>("");
  const [roleFilter,   setRoleFilter]   = useState<string>("all");
  const [page,         setPage]         = useState<number>(1);
  const [createOpen,   setCreateOpen]   = useState<boolean>(false);
  const [editOpen,     setEditOpen]     = useState<boolean>(false);
  const [deleteOpen,   setDeleteOpen]   = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form,         setForm]         = useState(emptyForm);
  const [editActive,   setEditActive]   = useState<boolean>(false);
 
  const filtered = users.filter((u) => {
    const matchSearch = u.fullName.toLowerCase().includes(search.toLowerCase())
                     || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });
 
  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginated  = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);
 
  const isRestricted = (user: User) => user.role === "admin";
 
  const handleCreate = () => {
    setUsers((prev) => [
      { id: String(Date.now()), fullName: form.fullName, email: form.email, role: form.role, active: false },
      ...prev,
    ]);
    setCreateOpen(false);
    setForm(emptyForm);
  };
 
  const handleEdit = () => {
    if (!selectedUser) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id
          ? { ...u, fullName: form.fullName, email: form.email, active: editActive }
          : u,
      ),
    );
    setEditOpen(false);
    setSelectedUser(null);
  };
 
  const handleDelete = () => {
    if (!selectedUser) return;
    setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
    setDeleteOpen(false);
    setSelectedUser(null);
  };
 
  const handleToggleActive = (user: User) => {
    if (isRestricted(user)) return;
    setUsers((prev) =>
      prev.map((u) => u.id === user.id ? { ...u, active: !u.active } : u),
    );
  };
 
  const openEdit = (user: User) => {
    setSelectedUser(user);
    setForm({ fullName: user.fullName, email: user.email, role: user.role, password: "" });
    setEditActive(user.active);
    setEditOpen(true);
  };
 
  const openDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteOpen(true);
  };
 
  // ── Formulaire Create ─────────────────────────────────────────────────────
  const CreateFormFields = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
      <TextField
        label="Full Name" fullWidth value={form.fullName}
        onChange={(e) => setForm({ ...form, fullName: e.target.value })} sx={inputSx}
      />
      <TextField
        label="Email" fullWidth value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })} sx={inputSx}
      />
      <FormControl fullWidth>
        <InputLabel sx={{ color: colors.textMuted }}>Role</InputLabel>
        <Select
          value={form.role} label="Role"
          onChange={(e) => setForm({ ...form, role: e.target.value as "admin" | "user" })}
          sx={selectSx}
        >
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="user">User</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label="Password" type="password" fullWidth value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })} sx={inputSx}
      />
    </Box>
  );
 
  // ── Formulaire Edit ───────────────────────────────────────────────────────
  const EditFormFields = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
      <TextField
        label="Full Name" fullWidth value={form.fullName}
        onChange={(e) => setForm({ ...form, fullName: e.target.value })} sx={inputSx}
      />
      <TextField
        label="Email" fullWidth value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })} sx={inputSx}
      />
      <Box
        sx={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          px: 2, py: 1.5, borderRadius: 1.5,
          border: `1px solid ${colors.borderCard}`,
          bgcolor: colors.bgDark,
        }}
      >
        <Box>
          <Typography variant="body2" color={colors.textWhite} fontWeight={600}>
            Compte actif
          </Typography>
          <Typography variant="caption" color={colors.textMuted}>
            {editActive ? "L'utilisateur peut se connecter" : "Accès désactivé"}
          </Typography>
        </Box>
        <Switch
          checked={editActive}
          onChange={(e) => setEditActive(e.target.checked)}
          sx={switchCheckedSx}
        />
      </Box>
    </Box>
  );
 
  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
 
      {/* ── Page header ── */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color={colors.textWhite}>User Management</Typography>
          <Typography variant="body2" color={colors.textMuted} mt={0.5}>Manage and control system users</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}
          onClick={() => { setForm(emptyForm); setCreateOpen(true); }} sx={btnPrimarySx}>
          Create User
        </Button>
      </Box>
 
      {/* ── Table card ── */}
      <Box sx={{ bgcolor: colors.bgCard, borderRadius: 2, border: `1px solid ${colors.borderCard}`, p: 2 }}>
 
        <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
          <TextField
            placeholder="Search by name, email..." value={search} size="small"
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            sx={{ flex: 1, minWidth: 200, ...inputSx }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: colors.textMuted, fontSize: 18 }} />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={roleFilter} displayEmpty sx={selectSx}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            >
              <MenuItem value="all">All Roles</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="user">User</MenuItem>
            </Select>
          </FormControl>
        </Box>
 
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
                <TableRow key={user.id} sx={{
                  "&:hover": { bgcolor: colors.bgDark },
                  opacity: restricted ? 0.75 : 1,
                }}>
                  <TableCell sx={tableCellSx}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar sx={{
                        width: 34, height: 34,
                        bgcolor: getAvatarColor(user.fullName),
                        fontSize: 13, fontWeight: "bold",
                      }}>
                        {getInitials(user.fullName)}
                      </Avatar>
                      <Box>
                        <Typography color={colors.textWhite} fontSize={13} fontWeight={500}>{user.fullName}</Typography>
                        <Typography color={colors.textMuted} fontSize={11}>{user.email}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
 
                  <TableCell sx={tableCellSx}>
                    <Chip
                      label={user.role.toUpperCase()} size="small" variant="outlined"
                      sx={{
                        borderColor: user.role === "admin" ? colors.blueButton : colors.borderCard,
                        color:       user.role === "admin" ? colors.blueMuted  : colors.textMuted,
                        fontSize: 10,
                      }}
                    />
                  </TableCell>
 
                  <TableCell sx={tableCellSx}>
                    <Tooltip title={restricted ? "Cannot change admin status" : user.active ? "Désactiver" : "Activer"}>
                      <span>
                        <Switch
                          checked={user.active} size="small"
                          onChange={() => handleToggleActive(user)}
                          disabled={restricted}
                          sx={switchCheckedSx}
                        />
                      </span>
                    </Tooltip>
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
      </Box>
 
      {/* ── Create User Dialog ── */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)}>
        <DialogTitle sx={{ color: colors.textWhite }}>Create User</DialogTitle>
        <DialogContent><CreateFormFields /></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateOpen(false)} sx={{ color: colors.textMuted }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}
            disabled={!form.fullName || !form.email || !form.password} sx={btnPrimarySx}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
 
      {/* ── Edit User Dialog ── */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle sx={{ color: colors.textWhite }}>Edit User</DialogTitle>
        <DialogContent><EditFormFields /></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditOpen(false)} sx={{ color: colors.textMuted }}>Cancel</Button>
          <Button variant="contained" onClick={handleEdit}
            disabled={!form.fullName || !form.email} sx={btnPrimarySx}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
 
      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle sx={{ color: colors.textWhite }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography color={colors.textMuted}>
            Are you sure you want to delete{" "}
            <Typography component="span" color={colors.textWhite} fontWeight="bold">
              {selectedUser?.fullName}
            </Typography>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)} sx={{ color: colors.textMuted }}>Cancel</Button>
          <Button variant="contained" onClick={handleDelete} sx={btnDangerSx}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
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

// User — shape of a single user record
interface User {
  id:       string;
  fullName: string;
  email:    string;
  role:     "admin" | "user";
  active:   boolean;
}

// TODO: replace with RTK Query API call when backend user endpoints are ready
const MOCK_USERS: User[] = [
  { id: "1", fullName: "Julianne Devis",    email: "j.devis@scanalyze.io",      role: "admin", active: true  },
  { id: "2", fullName: "Marcus Knight",     email: "m.knight@scanalyze.io",     role: "user",  active: true  },
  { id: "3", fullName: "Sarah Lopez",       email: "s.lopez@scanalyze.io",      role: "user",  active: false },
  { id: "4", fullName: "Robert Blackstone", email: "r.blackstone@scanalyze.io", role: "admin", active: true  },
  { id: "5", fullName: "Nina Patel",        email: "n.patel@scanalyze.io",      role: "user",  active: false },
  { id: "6", fullName: "Tom Erikson",       email: "t.erikson@scanalyze.io",    role: "user",  active: true  },
];

const ROWS_PER_PAGE = 4;

// Empty form state — reused to reset after submit or cancel
const emptyForm = { fullName: "", email: "", role: "user" as "admin" | "user", password: "" };

// Returns up to 2 uppercase initials from a full name (e.g. "John Doe" → "JD")
function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

// Returns a consistent avatar background color based on the first character of the name
function getAvatarColor(name: string) {
  const palette = [colors.blueButton, "#0f766e", "#7c3aed", "#b45309", "#be185d", "#065f46"];
  return palette[name.charCodeAt(0) % palette.length];
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

  // Filter by search text (name or email) and selected role
  const filtered = users.filter((u) => {
    const matchSearch = u.fullName.toLowerCase().includes(search.toLowerCase())
                     || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginated  = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  // Admin users are read-only — their actions are blocked
  const isRestricted = (user: User) => user.role === "admin";

  // Prepend the new user to the list with active=false (pending activation)
  const handleCreate = () => {
    setUsers((prev) => [
      { id: String(Date.now()), fullName: form.fullName, email: form.email, role: form.role, active: false },
      ...prev,
    ]);
    setCreateOpen(false);
    setForm(emptyForm);
  };

  // Update only the selected user's editable fields
  const handleEdit = () => {
    if (!selectedUser) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id
          ? { ...u, fullName: form.fullName, email: form.email, role: form.role }
          : u,
      ),
    );
    setEditOpen(false);
    setSelectedUser(null);
  };

  // Remove the selected user from the list
  const handleDelete = () => {
    if (!selectedUser) return;
    setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
    setDeleteOpen(false);
    setSelectedUser(null);
  };

  // Toggle active status — blocked for admin users
  const handleToggleActive = (user: User) => {
    if (isRestricted(user)) return;
    setUsers((prev) =>
      prev.map((u) => u.id === user.id ? { ...u, active: !u.active } : u),
    );
  };

  // Open edit dialog pre-filled with the selected user's data
  const openEdit = (user: User) => {
    setSelectedUser(user);
    setForm({ fullName: user.fullName, email: user.email, role: user.role, password: "" });
    setEditOpen(true);
  };

  // Open delete confirmation dialog for the selected user
  const openDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteOpen(true);
  };

  // Shared form fields reused in both Create and Edit dialogs
  // Password field is hidden in edit mode (editOpen=true)
  const FormFields = () => (
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
      {/* Password only in Create mode */}
      {!editOpen && (
        <TextField
          label="Password" type="password" fullWidth value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} sx={inputSx}
        />
      )}
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

        {/* Search + role filter */}
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

        {/* ── Users table ── */}
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
                  // Dim admin rows visually to indicate they are read-only
                  opacity: restricted ? 0.75 : 1,
                }}>
                  {/* Avatar + name + email */}
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

                  {/* Role chip */}
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

                  {/* Active toggle — locked for admin users */}
                  <TableCell sx={tableCellSx}>
                    <Tooltip title={restricted ? "Cannot change admin status" : user.active ? "Désactiver" : "Activer"}>
                      <span>
                        <Switch
                          checked={user.active} size="small"
                          onChange={() => handleToggleActive(user)}
                          disabled={restricted}
                          sx={{
                            "& .MuiSwitch-switchBase.Mui-checked": { color: colors.green },
                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#166534" },
                          }}
                        />
                      </span>
                    </Tooltip>
                  </TableCell>

                  {/* Action buttons — replaced by a lock icon for admin rows */}
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

        {/* Pagination + record count */}
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
        <DialogContent><FormFields /></DialogContent>
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
        <DialogContent><FormFields /></DialogContent>
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

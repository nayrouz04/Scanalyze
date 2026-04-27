//Hook pour gerer tous les etats locaux de la page  
import { useState } from "react";
//composant MUI specifiques a cette page
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
import { colors, inputSx, selectSx, tableHeadCellSx, tableCellSx, btnPrimarySx, btnDangerSx } from "../../theme";


//type TS definissent la structure d'un utilisateur 
interface User { id: string; fullName: string; email: string; role: "admin" | "user"; active: boolean; }


//TODO / a remplacr par un appel API RTK Query plus tard .
const MOCK_USERS: User[] = [
  { id: "1", fullName: "Julianne Devis",    email: "j.devis@scanalyze.io",      role: "admin", active: true },
  { id: "2", fullName: "Marcus Knight",     email: "m.knight@scanalyze.io",     role: "user",  active: true },
  { id: "3", fullName: "Sarah Lopez",       email: "s.lopez@scanalyze.io",      role: "user",  active: false },
  { id: "4", fullName: "Robert Blackstone", email: "r.blackstone@scanalyze.io", role: "admin", active: true },
  { id: "5", fullName: "Nina Patel",        email: "n.patel@scanalyze.io",      role: "user",  active: false },
  { id: "6", fullName: "Tom Erikson",       email: "t.erikson@scanalyze.io",    role: "user",  active: true },
];

//4 utilisateurs par page
const ROWS_PER_PAGE = 4;
//formulaire vide réutilisé pour reinitialiser le formulaire 
const emptyForm = { fullName: "", email: "", role: "user" as "admin" | "user", password: "" };


//extrait les initiales d'un nom
function getInitials(name: string) { return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2); }
function getAvatarColor(name: string) {
  const palette = [colors.blueButton, "#0f766e", "#7c3aed", "#b45309", "#be185d", "#065f46"];
  return palette[name.charCodeAt(0) % palette.length];
}


//les etats:
export default function UserManagement() {
  const [users,      setUsers]      = useState<User[]>(MOCK_USERS); //liste complete des utilisateurs
  const [search,     setSearch]     = useState("");  //texte de recherche 
  const [roleFilter, setRoleFilter] = useState("all");  //filtre par role 
  const [page,       setPage]       = useState(1);    //page courante 
  const [createOpen, setCreateOpen] = useState(false);   //ouvre/ferme dialog création
  const [editOpen,   setEditOpen]   = useState(false);   //ouvre/ferme dialog edition
  const [deleteOpen, setDeleteOpen] = useState(false);   //ouvre/ferme dialog de suppression
  const [selectedUser, setSelectedUser] = useState<User | null>(null);   //utilisateur en cours d'edition/suppression
  const [form, setForm] = useState(emptyForm);    //donnés de formulaire 

  //filtre les ytilisateurs selon : 
  const filtered   = users.filter((u) => {
    //nom ou email contient le etxte recherché
    const matchSearch = u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    //role correspondants au filtre sélectionné 
    const matchRole   = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  //meme princip de pagination qu le dashboard
  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginated  = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);



  //crée un utilisateur et l'ajoute en tete de la liste 
  const handleCreate = () => {
    setUsers((prev) => [{ id: String(Date.now()), fullName: form.fullName, email: form.email, role: form.role, active: false }, ...prev]);
    setCreateOpen(false); setForm(emptyForm);
  };

  //modifie uniquement l'utilisateur sélectionné 
  const handleEdit = () => {
    if (!selectedUser) return;
    setUsers((prev) => prev.map((u) => u.id === selectedUser.id ? { ...u, fullName: form.fullName, email: form.email, role: form.role } : u));
    setEditOpen(false); setSelectedUser(null);
  };

  //supprime l'utilisateur sélectionné avec filrer garde tous sauf celui avec l'id correspondant 
  const handleDelete = () => {
    if (!selectedUser) return;
    setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
    setDeleteOpen(false); setSelectedUser(null);
  };

  //inverse l'etat active de l'utilisateur 
  const handleToggleActive = (user: User) => setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, active: !u.active } : u));
  const openEdit   = (user: User) => { setSelectedUser(user); setForm({ fullName: user.fullName, email: user.email, role: user.role, password: "" }); setEditOpen(true); };
  const openDelete = (user: User) => { setSelectedUser(user); setDeleteOpen(true); };

  const FormFields = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
      <TextField label="Full Name" fullWidth value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} sx={inputSx} />
      <TextField label="Email"     fullWidth value={form.email}    onChange={(e) => setForm({ ...form, email: e.target.value })}    sx={inputSx} />
      <FormControl fullWidth>
        <InputLabel sx={{ color: colors.textMuted }}>Role</InputLabel>
        <Select value={form.role} label="Role" onChange={(e) => setForm({ ...form, role: e.target.value as "admin" | "user" })} sx={selectSx}>
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="user">User</MenuItem>
        </Select>
      </FormControl>
      {!editOpen && (
        <TextField label="Password" type="password" fullWidth value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} sx={inputSx} />
      )}
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color={colors.textWhite}>User Management</Typography>
          <Typography variant="body2" color={colors.textMuted} mt={0.5}>Manage and control system users</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm(emptyForm); setCreateOpen(true); }} sx={btnPrimarySx}>
          Create User
        </Button>
      </Box>

      <Box sx={{ bgcolor: colors.bgCard, borderRadius: 2, border: `1px solid ${colors.borderCard}`, p: 2 }}>
        <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
          <TextField placeholder="Search by name, email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            size="small" sx={{ flex: 1, minWidth: 200, ...inputSx }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: colors.textMuted, fontSize: 18 }} /></InputAdornment> }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} displayEmpty sx={selectSx}>
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
            {paginated.map((user) => (
              <TableRow key={user.id} sx={{ "&:hover": { bgcolor: colors.bgDark } }}>
                <TableCell sx={tableCellSx}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar sx={{ width: 34, height: 34, bgcolor: getAvatarColor(user.fullName), fontSize: 13, fontWeight: "bold" }}>
                      {getInitials(user.fullName)}
                    </Avatar>
                    <Box>
                      <Typography color={colors.textWhite} fontSize={13} fontWeight={500}>{user.fullName}</Typography>
                      <Typography color={colors.textMuted} fontSize={11}>{user.email}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={tableCellSx}>
                  <Chip label={user.role.toUpperCase()} size="small" variant="outlined"
                    sx={{ borderColor: user.role === "admin" ? colors.blueButton : colors.borderCard, color: user.role === "admin" ? colors.blueMuted : colors.textMuted, fontSize: 10 }} />
                </TableCell>
                <TableCell sx={tableCellSx}>
                  <Tooltip title={user.active ? "Désactiver" : "Activer"}>
                    <Switch checked={user.active} onChange={() => handleToggleActive(user)} size="small"
                      sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: colors.green }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#166534" } }} />
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ ...tableCellSx, textAlign: "right" }}>
                  <Tooltip title="Modifier"><IconButton size="small" onClick={() => openEdit(user)}   sx={{ color: colors.blueMuted }}><EditIcon   fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Supprimer"><IconButton size="small" onClick={() => openDelete(user)} sx={{ color: colors.red }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2, flexWrap: "wrap", gap: 1 }}>
          <Typography variant="caption" color={colors.textMuted}>
            Showing {Math.min((page - 1) * ROWS_PER_PAGE + 1, filtered.length)} to {Math.min(page * ROWS_PER_PAGE, filtered.length)} of {filtered.length} users
          </Typography>
          {totalPages > 1 && <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} size="small" />}
        </Box>
      </Box>

      {/* Create Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)}>
        <DialogTitle sx={{ color: colors.textWhite }}>Create User</DialogTitle>
        <DialogContent><FormFields /></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateOpen(false)} sx={{ color: colors.textMuted }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!form.fullName || !form.email || !form.password} sx={btnPrimarySx}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle sx={{ color: colors.textWhite }}>Edit User</DialogTitle>
        <DialogContent><FormFields /></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditOpen(false)} sx={{ color: colors.textMuted }}>Cancel</Button>
          <Button variant="contained" onClick={handleEdit} disabled={!form.fullName || !form.email} sx={btnPrimarySx}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle sx={{ color: colors.textWhite }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography color={colors.textMuted}>
            Are you sure you want to delete{" "}
            <Typography component="span" color={colors.textWhite} fontWeight="bold">{selectedUser?.fullName}</Typography>?
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
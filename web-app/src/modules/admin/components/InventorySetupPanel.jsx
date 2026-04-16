import {
  Box,
  Button,
  Grid,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

const INVENTORY_LIST_PAGE_SIZE = 5;

export default function InventorySetupPanel({
  loading,
  setupTab,
  setSetupTab,
  mdBrand,
  setMdBrand,
  mdModel,
  setMdModel,
  mdVersion,
  setMdVersion,
  mdBasePrice,
  setMdBasePrice,
  srName,
  setSrName,
  srAddress,
  setSrAddress,
  createBrandFb,
  createModelFb,
  createVersionFb,
  createPriceFb,
  createSrNameFb,
  createSrAddrFb,
  submitCreateMasterData,
  submitCreateShowroom,
  mdFilterBrand,
  setMdFilterBrand,
  mdFilterModel,
  setMdFilterModel,
  showroomKeyword,
  setShowroomKeyword,
  loadMasterData,
  loadShowrooms,
  masterDataList,
  mdListPage,
  setMdListPage,
  showroomList,
  srListPage,
  setSrListPage,
  setEditingMd,
  removeMasterData,
  setEditingSr,
  removeShowroom,
}) {
  return (
    <Paper variant="outlined" sx={{ mb: 2, overflow: "hidden" }}>
      <Tabs value={setupTab} onChange={(_, v) => setSetupTab(v)} sx={{ borderBottom: 1, borderColor: "divider", px: 1 }}>
        <Tab label="Tạo" />
        <Tab label="Tìm" />
      </Tabs>

      {setupTab === 0 ? (
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                Tạo master data
              </Typography>
              <Grid container spacing={1.5}>
                <Grid item xs={6}>
                  <TextField fullWidth size="small" label="Brand" value={mdBrand} {...createBrandFb} onChange={(e) => setMdBrand(e.target.value)} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth size="small" label="Model" value={mdModel} {...createModelFb} onChange={(e) => setMdModel(e.target.value)} />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Version"
                    value={mdVersion}
                    {...createVersionFb}
                    onChange={(e) => setMdVersion(e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Base price"
                    value={mdBasePrice}
                    {...createPriceFb}
                    onChange={(e) => setMdBasePrice(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" onClick={submitCreateMasterData} disabled={loading || !mdBrand || !mdModel || !mdVersion || !mdBasePrice}>
                    Tạo master data
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                Tạo showroom
              </Typography>
              <Grid container spacing={1.5}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Tên showroom"
                    value={srName}
                    {...createSrNameFb}
                    onChange={(e) => setSrName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Địa chỉ"
                    value={srAddress}
                    {...createSrAddrFb}
                    onChange={(e) => setSrAddress(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" onClick={submitCreateShowroom} disabled={loading || !srName}>
                    Tạo showroom
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      ) : (
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                Tìm &amp; quản lý master data
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
                <TextField size="small" label="Brand" value={mdFilterBrand} onChange={(e) => setMdFilterBrand(e.target.value)} />
                <TextField size="small" label="Model" value={mdFilterModel} onChange={(e) => setMdFilterModel(e.target.value)} />
                <Button variant="outlined" onClick={loadMasterData} disabled={loading}>
                  Tìm
                </Button>
              </Box>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Master data</TableCell>
                      <TableCell align="right">Tác vụ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {masterDataList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3}>
                          <Typography variant="body2" color="text.secondary">
                            Chưa có kết quả — nhấn «Tìm» (có thể để trống để xem tất cả).
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      masterDataList
                        .slice(mdListPage * INVENTORY_LIST_PAGE_SIZE, mdListPage * INVENTORY_LIST_PAGE_SIZE + INVENTORY_LIST_PAGE_SIZE)
                        .map((m) => (
                          <TableRow key={m.id}>
                            <TableCell>{m.id}</TableCell>
                            <TableCell>
                              {m.brand} {m.model} {m.version}
                            </TableCell>
                            <TableCell align="right">
                              <Button size="small" onClick={() => setEditingMd({ ...m })}>
                                Sửa
                              </Button>
                              <Button size="small" color="error" onClick={() => removeMasterData(m.id)}>
                                Xóa
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
                {masterDataList.length > 0 ? (
                  <TablePagination
                    component="div"
                    count={masterDataList.length}
                    page={mdListPage}
                    onPageChange={(_, p) => setMdListPage(p)}
                    rowsPerPage={INVENTORY_LIST_PAGE_SIZE}
                    rowsPerPageOptions={[INVENTORY_LIST_PAGE_SIZE]}
                    labelRowsPerPage="Số dòng"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
                  />
                ) : null}
              </TableContainer>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                Tìm &amp; quản lý showroom
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
                <TextField size="small" label="Từ khóa tên" value={showroomKeyword} onChange={(e) => setShowroomKeyword(e.target.value)} />
                <Button variant="outlined" onClick={loadShowrooms} disabled={loading}>
                  Tìm
                </Button>
              </Box>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Showroom</TableCell>
                      <TableCell align="right">Tác vụ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {showroomList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3}>
                          <Typography variant="body2" color="text.secondary">
                            Chưa có kết quả — nhấn «Tìm».
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      showroomList
                        .slice(srListPage * INVENTORY_LIST_PAGE_SIZE, srListPage * INVENTORY_LIST_PAGE_SIZE + INVENTORY_LIST_PAGE_SIZE)
                        .map((s) => (
                          <TableRow key={s.id}>
                            <TableCell>{s.id}</TableCell>
                            <TableCell>{s.name}</TableCell>
                            <TableCell align="right">
                              <Button size="small" onClick={() => setEditingSr({ ...s })}>
                                Sửa
                              </Button>
                              <Button size="small" color="error" onClick={() => removeShowroom(s.id)}>
                                Xóa
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
                {showroomList.length > 0 ? (
                  <TablePagination
                    component="div"
                    count={showroomList.length}
                    page={srListPage}
                    onPageChange={(_, p) => setSrListPage(p)}
                    rowsPerPage={INVENTORY_LIST_PAGE_SIZE}
                    rowsPerPageOptions={[INVENTORY_LIST_PAGE_SIZE]}
                    labelRowsPerPage="Số dòng"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
                  />
                ) : null}
              </TableContainer>
            </Grid>
          </Grid>
        </Box>
      )}
    </Paper>
  );
}

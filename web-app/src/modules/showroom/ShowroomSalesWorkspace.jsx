import { Alert, Box, Tab, Tabs, Typography } from "@mui/material";
import ContractTab from "./components/ContractTab";
import LeadsTab from "./components/LeadsTab";
import LockCarTab from "./components/LockCarTab";
import { useShowroomSales } from "./hooks/useShowroomSales";

export default function ShowroomSalesWorkspace() {
  const sales = useShowroomSales();

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} gutterBottom>
        CRM tích hợp &amp; chốt sale showroom
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Chọn lead để khóa xe, rà voucher hiện có của khách và lên hợp đồng với số tiền thanh toán tự tính.
      </Typography>
      {sales.msg.text ? (
        <Alert severity={sales.msg.type === "success" ? "success" : "error"} sx={{ mb: 2 }}>
          {sales.msg.text}
        </Alert>
      ) : null}

      <Tabs value={sales.tab} onChange={(_, v) => sales.setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Lead showroom" />
        <Tab label="Lock xe" />
        <Tab label="Lên hợp đồng" />
      </Tabs>

      {sales.tab === 0 ? (
        <LeadsTab leads={sales.leads} loading={sales.loading} onRefresh={sales.loadLeads} onPickLead={sales.pickLead} />
      ) : null}

      {sales.tab === 1 ? (
        <LockCarTab vinToLock={sales.vinToLock} setVinToLock={sales.setVinToLock} loading={sales.loading} onLock={sales.lockCarForContract} />
      ) : null}

      {sales.tab === 2 ? (
        <ContractTab
          loading={sales.loading}
          contractLeadId={sales.contractLeadId}
          setContractLeadId={sales.setContractLeadId}
          contractVin={sales.contractVin}
          setContractVin={sales.setContractVin}
          voucherCode={sales.voucherCode}
          setVoucherCode={sales.setVoucherCode}
          leadVouchers={sales.leadVouchers}
          createdContractNo={sales.createdContractNo}
          carBasePrice={sales.carBasePrice}
          discountAmount={sales.discountAmount}
          finalAmount={sales.finalAmount}
          selectedVoucher={sales.selectedVoucher}
          onLoadLeadVouchers={() => sales.loadLeadVouchers(sales.contractLeadId)}
          onCreateContract={sales.createContract}
        />
      ) : null}
    </Box>
  );
}

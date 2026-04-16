import { useEffect, useMemo, useState } from "react";
import { portalApi } from "../../../services/portalApiService";

export function useShowroomSales() {
  const [tab, setTab] = useState(0);
  const [leads, setLeads] = useState([]);
  const [vinToLock, setVinToLock] = useState("");
  const [contractVin, setContractVin] = useState("");
  const [contractLeadId, setContractLeadId] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [createdContractNo, setCreatedContractNo] = useState("");
  const [leadVouchers, setLeadVouchers] = useState([]);
  const [carBasePrice, setCarBasePrice] = useState(0);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const selectedVoucher = useMemo(() => leadVouchers.find((v) => v.code === voucherCode) || null, [leadVouchers, voucherCode]);

  const discountAmount = useMemo(() => {
    if (!selectedVoucher) return 0;
    if (selectedVoucher.discountType === "PERCENT") {
      return (Number(carBasePrice || 0) * Number(selectedVoucher.discountValue || 0)) / 100;
    }
    return Number(selectedVoucher.discountValue || 0);
  }, [selectedVoucher, carBasePrice]);

  const finalAmount = Math.max(0, Number(carBasePrice || 0) - Number(discountAmount || 0));

  const loadLeads = async () => {
    setLoading(true);
    setMsg({ type: "", text: "" });
    try {
      const res = await portalApi.getLeadsMyShowroom();
      setLeads(res?.result || []);
      setMsg({ type: "success", text: "Đã tải lead showroom hiện tại." });
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Lỗi tải lead." });
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const loadLeadVouchers = async (leadId) => {
    if (!leadId) {
      setLeadVouchers([]);
      setVoucherCode("");
      return;
    }
    try {
      const res = await portalApi.getLeadVouchers(Number(leadId));
      const vouchers = res?.result || [];
      setLeadVouchers(vouchers);
      if (!vouchers.some((v) => v.code === voucherCode)) {
        setVoucherCode("");
      }
    } catch (e) {
      setLeadVouchers([]);
      setVoucherCode("");
      setMsg({ type: "error", text: e.message || "Không tải được voucher của khách hàng." });
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  useEffect(() => {
    const loadCar = async () => {
      if (!contractVin) {
        setCarBasePrice(0);
        return;
      }
      try {
        const res = await portalApi.getCarByVin(contractVin);
        setCarBasePrice(Number(res?.result?.basePrice || 0));
      } catch {
        setCarBasePrice(0);
      }
    };
    loadCar();
  }, [contractVin]);

  const run = async (fn, ok) => {
    setLoading(true);
    setMsg({ type: "", text: "" });
    try {
      const res = await fn();
      setMsg({ type: "success", text: ok });
      if (res?.result?.contractNo) {
        setCreatedContractNo(res.result.contractNo);
      }
      return res;
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Lỗi." });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const pickLead = async (lead) => {
    setContractLeadId(String(lead.id || ""));
    const vin = (lead.interestedVin || "").toUpperCase();
    if (vin) {
      setVinToLock(vin);
      setContractVin(vin);
    }
    await loadLeadVouchers(lead.id);
    setTab(1);
  };

  const lockCarForContract = async () =>
    run(async () => {
      const res = await portalApi.lockCar(vinToLock);
      setContractVin(vinToLock);
      return res;
    }, "Đã khóa xe thành công.");

  const createContract = async () =>
    run(
      () =>
        portalApi.createContract({
          leadId: Number(contractLeadId),
          carVin: contractVin,
          voucherCode: voucherCode || undefined,
        }),
      "Đã tạo hợp đồng. Gửi Contract No cho khách xác nhận."
    );

  return {
    tab,
    setTab,
    leads,
    vinToLock,
    setVinToLock,
    contractVin,
    setContractVin,
    contractLeadId,
    setContractLeadId,
    voucherCode,
    setVoucherCode,
    createdContractNo,
    leadVouchers,
    carBasePrice,
    discountAmount,
    finalAmount,
    msg,
    loading,
    loadLeads,
    loadLeadVouchers,
    pickLead,
    lockCarForContract,
    createContract,
    hasContractFormData: Boolean(contractLeadId && contractVin),
    hasLockVin: Boolean(vinToLock),
    selectedVoucher,
  };
}

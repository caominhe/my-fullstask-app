import { useEffect, useRef, useState } from "react";
import { portalApi } from "../../../services/portalApiService";

const INVENTORY_LIST_PAGE_SIZE = 5;

export function useInventory() {
  const [cars, setCars] = useState([]);
  const [masterDataList, setMasterDataList] = useState([]);
  const [showroomList, setShowroomList] = useState([]);
  const [allShowrooms, setAllShowrooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [setupTab, setSetupTab] = useState(0);

  const [carFilterShowroomId, setCarFilterShowroomId] = useState("");
  const [mdFilterBrand, setMdFilterBrand] = useState("");
  const [mdFilterModel, setMdFilterModel] = useState("");
  const [showroomKeyword, setShowroomKeyword] = useState("");

  const [importOpen, setImportOpen] = useState(false);
  const [importFieldErrors, setImportFieldErrors] = useState({});
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferVin, setTransferVin] = useState("");
  const [transferShowroomName, setTransferShowroomName] = useState("");
  const [transferShowroomOptions, setTransferShowroomOptions] = useState([]);

  const [vin, setVin] = useState("");
  const [masterDataId, setMasterDataId] = useState("");
  const [importMasterOptions, setImportMasterOptions] = useState([]);
  const [engineNumber, setEngineNumber] = useState("");
  const [color, setColor] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [pendingImportFiles, setPendingImportFiles] = useState([]);
  const imageInputRef = useRef(null);
  const imageMultiInputRef = useRef(null);
  const imageFolderInputRef = useRef(null);
  const [editingCar, setEditingCar] = useState(null);
  const [uploadingCarEditImages, setUploadingCarEditImages] = useState(false);
  const [pendingEditFiles, setPendingEditFiles] = useState([]);
  const editImageInputRef = useRef(null);
  const editImagesInputRef = useRef(null);

  const [mdBrand, setMdBrand] = useState("");
  const [mdModel, setMdModel] = useState("");
  const [mdVersion, setMdVersion] = useState("");
  const [mdBasePrice, setMdBasePrice] = useState("");
  const [editingMd, setEditingMd] = useState(null);

  const [srName, setSrName] = useState("");
  const [srAddress, setSrAddress] = useState("");
  const [editingSr, setEditingSr] = useState(null);

  const [mdListPage, setMdListPage] = useState(0);
  const [srListPage, setSrListPage] = useState(0);
  const [carListPage, setCarListPage] = useState(0);
  const [importMdOptionsPage, setImportMdOptionsPage] = useState(0);
  const [transferSrOptionsPage, setTransferSrOptionsPage] = useState(0);

  const fetchCarsByShowroom = async (showroomId) => {
    const res = await portalApi.getCars({
      showroomId: showroomId != null && showroomId !== "" ? Number(showroomId) : undefined,
    });
    setCars(res?.result || []);
    setCarListPage(0);
  };

  const loadCars = async () => {
    await fetchCarsByShowroom(carFilterShowroomId);
  };

  const loadAllShowrooms = async () => {
    const res = await portalApi.getShowrooms();
    setAllShowrooms(res?.result || []);
  };

  const loadMasterData = async () => {
    const res = await portalApi.getMasterData({ brand: mdFilterBrand || undefined, model: mdFilterModel || undefined });
    setMasterDataList(res?.result || []);
    setMdListPage(0);
  };

  const loadShowrooms = async () => {
    const res = await portalApi.getShowrooms(showroomKeyword || undefined);
    setShowroomList(res?.result || []);
    setSrListPage(0);
  };

  const loadAll = async () => {
    setLoading(true);
    setMsg({ type: "", text: "" });
    try {
      await Promise.all([loadCars(), loadAllShowrooms()]);
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Lỗi tải dữ liệu." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (setupTab !== 1) return;
    loadMasterData();
    loadShowrooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setupTab]);

  const showroomLabelForCar = (c) => {
    if (c.showroomName) return c.showroomName;
    if (c.showroomId != null) {
      const s = allShowrooms.find((x) => x.id === c.showroomId);
      if (s) return s.name;
    }
    return "Kho tổng";
  };

  const importMasterMenuSlice = () => {
    const start = importMdOptionsPage * INVENTORY_LIST_PAGE_SIZE;
    let slice = importMasterOptions.slice(start, start + INVENTORY_LIST_PAGE_SIZE);
    const sel = importMasterOptions.find((m) => String(m.id) === masterDataId);
    if (sel && !slice.some((m) => m.id === sel.id)) {
      slice = [sel, ...slice.filter((m) => m.id !== sel.id).slice(0, INVENTORY_LIST_PAGE_SIZE - 1)];
    }
    return slice;
  };

  const transferShowroomMenuSlice = () => {
    const start = transferSrOptionsPage * INVENTORY_LIST_PAGE_SIZE;
    let slice = transferShowroomOptions.slice(start, start + INVENTORY_LIST_PAGE_SIZE);
    const sel = transferShowroomOptions.find((s) => s.name === transferShowroomName);
    if (sel && !slice.some((s) => s.id === sel.id)) {
      slice = [sel, ...slice.filter((s) => s.id !== sel.id).slice(0, INVENTORY_LIST_PAGE_SIZE - 1)];
    }
    return slice;
  };

  const submitCreateMasterData = async () => {
    setLoading(true);
    try {
      await portalApi.createMasterData({
        brand: mdBrand,
        model: mdModel,
        version: mdVersion,
        basePrice: Number(mdBasePrice),
      });
      setMdBrand("");
      setMdModel("");
      setMdVersion("");
      setMdBasePrice("");
      setMsg({ type: "success", text: "Đã tạo master data." });
      if (setupTab === 1) await loadMasterData();
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Lỗi tạo master data." });
    } finally {
      setLoading(false);
    }
  };

  const submitCreateShowroom = async () => {
    setLoading(true);
    try {
      await portalApi.createShowroom({ name: srName, address: srAddress || undefined });
      setSrName("");
      setSrAddress("");
      setMsg({ type: "success", text: "Đã tạo showroom." });
      await loadAllShowrooms();
      if (setupTab === 1) await loadShowrooms();
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Lỗi tạo showroom." });
    } finally {
      setLoading(false);
    }
  };

  const openImportDialog = async () => {
    setVin("");
    setMasterDataId("");
    setEngineNumber("");
    setColor("");
    setPendingImportFiles([]);
    setImportFieldErrors({});
    setImportMdOptionsPage(0);
    setImportOpen(true);
    try {
      const res = await portalApi.getMasterData({});
      setImportMasterOptions(res?.result || []);
    } catch {
      setImportMasterOptions(masterDataList);
    }
  };

  const uploadPendingFiles = async (files) => {
    const validFiles = Array.from(files || []).filter(Boolean);
    if (validFiles.length === 0) return [];
    const res = await portalApi.uploadCarImages(validFiles);
    return res?.result || [];
  };

  const submitImport = async () => {
    setImportFieldErrors({});
    setLoading(true);
    try {
      let uploadedUrls = [];
      if (pendingImportFiles.length > 0) {
        setUploadingImage(true);
        uploadedUrls = await uploadPendingFiles(pendingImportFiles);
      }
      const mergedImageUrls = Array.from(new Set(uploadedUrls));
      const primaryImageUrl = mergedImageUrls[0] || undefined;
      await portalApi.importCar({
        vin: vin.trim(),
        masterDataId: masterDataId ? Number(masterDataId) : null,
        engineNumber: engineNumber.trim(),
        color: color.trim(),
        imageUrl: primaryImageUrl,
        imageUrls: mergedImageUrls,
      });
      setMsg({ type: "success", text: "Đã nhập xe mới vào kho tổng." });
      setImportOpen(false);
      setImportFieldErrors({});
      setPendingImportFiles([]);
      await loadCars();
    } catch (e) {
      if (e.fieldErrors && typeof e.fieldErrors === "object" && Object.keys(e.fieldErrors).length > 0) {
        setImportFieldErrors(e.fieldErrors);
        setMsg({ type: "", text: "" });
      } else if (e.code === 2002) {
        setImportFieldErrors({ vin: e.message });
        setMsg({ type: "", text: "" });
      } else if (e.code === 2003) {
        setImportFieldErrors({ engineNumber: e.message });
        setMsg({ type: "", text: "" });
      } else {
        setMsg({ type: "error", text: e.message || "Lỗi import." });
      }
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  };

  const pickImportImage = (file) => {
    if (!file) return;
    setPendingImportFiles((prev) => [...prev, file]);
    setMsg({ type: "success", text: "Đã chọn 1 ảnh. Bấm Lưu để upload lên Cloudinary." });
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const pickImportImages = (fileList) => {
    const files = Array.from(fileList || []).filter(Boolean);
    if (files.length === 0) return;
    setPendingImportFiles((prev) => [...prev, ...files]);
    setMsg({ type: "success", text: `Đã chọn thêm ${files.length} ảnh. Bấm Lưu để upload lên Cloudinary.` });
    if (imageMultiInputRef.current) imageMultiInputRef.current.value = "";
    if (imageFolderInputRef.current) imageFolderInputRef.current.value = "";
  };

  const normalizeCarImages = (car) => {
    const merged = [...(Array.isArray(car?.imageUrls) ? car.imageUrls : []), car?.imageUrl];
    return Array.from(new Set(merged.map((item) => String(item || "").trim()).filter(Boolean)));
  };

  const removeEditingCarImage = (imageUrl) => {
    if (!editingCar) return;
    setEditingCar((prev) => {
      const nextImages = (prev.imageUrls || []).filter((item) => item !== imageUrl);
      return {
        ...prev,
        imageUrls: nextImages,
        imageUrl: nextImages[0] || "",
      };
    });
  };

  const setPrimaryEditingCarImage = (imageUrl) => {
    if (!editingCar) return;
    setEditingCar((prev) => {
      const nextImages = [imageUrl, ...(prev.imageUrls || []).filter((item) => item !== imageUrl)];
      return {
        ...prev,
        imageUrls: nextImages,
        imageUrl: imageUrl,
      };
    });
  };

  const submitTransfer = async () => {
    setLoading(true);
    try {
      await portalApi.transferCar(transferVin, { showroomName: transferShowroomName });
      setMsg({ type: "success", text: "Đã điều chuyển xe." });
      setTransferOpen(false);
      await loadCars();
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Lỗi transfer." });
    } finally {
      setLoading(false);
    }
  };

  const saveCarUpdate = async () => {
    if (!editingCar?.vin) return;
    setLoading(true);
    try {
      let uploadedUrls = [];
      if (pendingEditFiles.length > 0) {
        setUploadingCarEditImages(true);
        uploadedUrls = await uploadPendingFiles(pendingEditFiles);
      }
      const mergedImageUrls = Array.from(new Set([...(editingCar.imageUrls || []), ...uploadedUrls]));
      const primaryImageUrl = mergedImageUrls[0] || editingCar.imageUrl || undefined;
      await portalApi.updateCar(editingCar.vin, {
        imageUrl: primaryImageUrl,
        imageUrls: mergedImageUrls,
        listedPrice: editingCar.listedPrice ? Number(editingCar.listedPrice) : undefined,
      });
      setEditingCar(null);
      setPendingEditFiles([]);
      setMsg({ type: "success", text: "Đã cập nhật xe." });
      await loadCars();
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Lỗi cập nhật xe." });
    } finally {
      setLoading(false);
      setUploadingCarEditImages(false);
    }
  };

  const pickCarEditImage = (file) => {
    if (!file || !editingCar) return;
    setPendingEditFiles((prev) => [...prev, file]);
    setMsg({ type: "success", text: "Đã chọn 1 ảnh. Bấm Lưu để upload lên Cloudinary." });
    if (editImageInputRef.current) editImageInputRef.current.value = "";
  };

  const pickCarEditImages = (fileList) => {
    const files = Array.from(fileList || []).filter(Boolean);
    if (files.length === 0 || !editingCar) return;
    setPendingEditFiles((prev) => [...prev, ...files]);
    setMsg({ type: "success", text: `Đã chọn thêm ${files.length} ảnh. Bấm Lưu để upload lên Cloudinary.` });
    if (editImagesInputRef.current) editImagesInputRef.current.value = "";
  };

  const saveMasterData = async () => {
    if (!editingMd) return;
    setLoading(true);
    try {
      await portalApi.updateMasterData(editingMd.id, editingMd);
      setEditingMd(null);
      setMsg({ type: "success", text: "Đã cập nhật master data." });
      await Promise.all([loadMasterData(), loadCars(), loadAllShowrooms()]);
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Lỗi cập nhật master data." });
    } finally {
      setLoading(false);
    }
  };

  const removeMasterData = async (id) => {
    setLoading(true);
    try {
      await portalApi.deleteMasterData(id);
      setMsg({ type: "success", text: "Đã xóa master data." });
      await Promise.all([loadMasterData(), loadCars(), loadAllShowrooms()]);
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Không thể xóa master data." });
    } finally {
      setLoading(false);
    }
  };

  const saveShowroom = async () => {
    if (!editingSr) return;
    setLoading(true);
    try {
      await portalApi.updateShowroom(editingSr.id, { name: editingSr.name, address: editingSr.address });
      setEditingSr(null);
      setMsg({ type: "success", text: "Đã cập nhật showroom." });
      await Promise.all([loadShowrooms(), loadCars(), loadAllShowrooms()]);
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Lỗi cập nhật showroom." });
    } finally {
      setLoading(false);
    }
  };

  const removeShowroom = async (id) => {
    setLoading(true);
    try {
      await portalApi.deleteShowroom(id);
      setMsg({ type: "success", text: "Đã xóa showroom." });
      await Promise.all([loadShowrooms(), loadCars(), loadAllShowrooms()]);
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Không thể xóa showroom." });
    } finally {
      setLoading(false);
    }
  };

  const openTransferDialogForVin = async (selectedVin) => {
    setTransferVin(selectedVin);
    setTransferShowroomName("");
    setTransferSrOptionsPage(0);
    setTransferOpen(true);
    try {
      const res = await portalApi.getShowrooms();
      setTransferShowroomOptions(res?.result || []);
    } catch {
      setTransferShowroomOptions(allShowrooms);
    }
  };

  return {
    cars,
    masterDataList,
    showroomList,
    allShowrooms,
    loading,
    setLoading,
    msg,
    setMsg,
    setupTab,
    setSetupTab,
    carFilterShowroomId,
    setCarFilterShowroomId,
    mdFilterBrand,
    setMdFilterBrand,
    mdFilterModel,
    setMdFilterModel,
    showroomKeyword,
    setShowroomKeyword,
    importOpen,
    setImportOpen,
    importFieldErrors,
    setImportFieldErrors,
    transferOpen,
    setTransferOpen,
    transferVin,
    setTransferVin,
    transferShowroomName,
    setTransferShowroomName,
    transferShowroomOptions,
    vin,
    setVin,
    masterDataId,
    setMasterDataId,
    importMasterOptions,
    engineNumber,
    setEngineNumber,
    color,
    setColor,
    uploadingImage,
    pendingImportFiles,
    setPendingImportFiles,
    imageInputRef,
    imageMultiInputRef,
    imageFolderInputRef,
    editingCar,
    setEditingCar,
    uploadingCarEditImages,
    pendingEditFiles,
    setPendingEditFiles,
    editImageInputRef,
    editImagesInputRef,
    mdBrand,
    setMdBrand,
    mdModel,
    setMdModel,
    mdVersion,
    setMdVersion,
    mdBasePrice,
    setMdBasePrice,
    editingMd,
    setEditingMd,
    srName,
    setSrName,
    srAddress,
    setSrAddress,
    editingSr,
    setEditingSr,
    mdListPage,
    setMdListPage,
    srListPage,
    setSrListPage,
    carListPage,
    setCarListPage,
    importMdOptionsPage,
    setImportMdOptionsPage,
    transferSrOptionsPage,
    setTransferSrOptionsPage,
    fetchCarsByShowroom,
    loadCars,
    loadMasterData,
    loadShowrooms,
    loadAll,
    showroomLabelForCar,
    importMasterMenuSlice,
    transferShowroomMenuSlice,
    submitCreateMasterData,
    submitCreateShowroom,
    openImportDialog,
    submitImport,
    pickImportImage,
    pickImportImages,
    normalizeCarImages,
    removeEditingCarImage,
    setPrimaryEditingCarImage,
    submitTransfer,
    saveCarUpdate,
    pickCarEditImage,
    pickCarEditImages,
    saveMasterData,
    removeMasterData,
    saveShowroom,
    removeShowroom,
    openTransferDialogForVin,
  };
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../services/localStorageService";
import Header from "./header/Header";
import { Box, Card, CircularProgress, Typography, Avatar } from "@mui/material";

export default function Home() {
  const navigate = useNavigate();
  // SỬA: Đổi {} thành null để Loading spinner hoạt động đúng
  const [userDetails, setUserDetails] = useState(null);

  const getUserDetails = async (accessToken) => {
    try {
      const response = await fetch("http://localhost:8080/api/v1/users/my-info", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`, // SỬA: Dùng đúng biến accessToken
        },
      });

      if (!response.ok) {
        throw new Error("Unauthorized");
      }

      const data = await response.json();
      
      // SỬA: Backend FCAR trả về dạng { result: { id, email, fullName... } }
      // Do đó ta cần set data.result vào state
      setUserDetails(data.result);
    } catch (error) {
      console.error("Lỗi lấy thông tin:", error);
      // Nếu token lỗi hoặc hết hạn, đẩy về trang login
      navigate("/login"); 
    }
  };

  useEffect(() => {
    const accessToken = getToken();

    if (!accessToken) {
      navigate("/login");
    } else {
      // Chỉ gọi API nếu có token
      getUserDetails(accessToken);
    }
  }, [navigate]);

  return (
    <>
      <Header />
      {userDetails ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          height="100vh"
          bgcolor={"#f0f2f5"}
        >
          <Card
            sx={{
              minWidth: 400,
              maxWidth: 500,
              boxShadow: 4,
              borderRadius: 4,
              padding: 4,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
              }}
            >
              {/* SỬA: Hệ thống FCAR chưa có ảnh đại diện, ta dùng Avatar của MUI làm mặc định */}
              <Avatar
                src={userDetails.avatar}       // <-- Nạp link ảnh lấy từ API vào đây
                alt={userDetails.fullName}
                sx={{ width: 80, height: 80, mb: 2 }}
              />
              <Typography variant="body1" gutterBottom>
                Welcome back to FCAR System,
              </Typography>
              {/* SỬA: Dùng fullName thay vì name */}
              <Typography variant="h4" component="h1" fontWeight="bold">
                {userDetails.fullName}
              </Typography>
              <Typography variant="body1" color="textSecondary" className="email">
                {userDetails.email}
              </Typography>
              {/* Nếu đã nhập SĐT ở bước Onboard, hiển thị thêm ở đây */}
              {userDetails.phone && (
                <Typography variant="body2" color="textSecondary">
                  SĐT: {userDetails.phone}
                </Typography>
              )}
            </Box>
          </Card>
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "30px",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <CircularProgress />
          <Typography>Loading user data...</Typography>
        </Box>
      )}
    </>
  );
}
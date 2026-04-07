import { Box, Typography } from "@mui/material";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";

/**
 * Trạng thái danh sách trống — tránh trang trắng khi API trả [].
 */
export default function EmptyState({
  title = "Chưa có dữ liệu",
  description,
  icon: Icon = InboxOutlinedIcon,
}) {
  return (
    <Box
      sx={{
        py: 4,
        px: 2,
        textAlign: "center",
        color: "text.secondary",
        border: "1px dashed",
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "action.hover",
      }}
    >
      {Icon ? <Icon sx={{ fontSize: 48, opacity: 0.45, mb: 1 }} /> : null}
      <Typography variant="subtitle1" fontWeight={600} color="text.primary">
        {title}
      </Typography>
      {description ? (
        <Typography variant="body2" sx={{ mt: 0.5, maxWidth: 420, mx: "auto" }}>
          {description}
        </Typography>
      ) : null}
    </Box>
  );
}

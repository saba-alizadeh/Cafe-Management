import React, { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Rating,
  Container,
} from "@mui/material";

export default function FeedbackForm() {
  const [rating, setRating] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    feedback: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("ارسال بازخورد:", { ...formData, rating });
    alert("از بازخورد شما سپاسگزاریم!");
  };

  return (
    <Box
      dir="rtl"
      sx={{
        bgcolor: "#594d3f",
        minHeight: "100vh",
        py: 6,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Vazir, sans-serif",
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          bgcolor: "#f6f2ea",
          borderRadius: 3,
          boxShadow: 4,
          p: 4,
        }}
      >
        <Typography
          variant="h4"
          align="center"
          fontWeight="bold"
          gutterBottom
          sx={{
            color: "#3a322a",
            mb: 4,
          }}
        >
          اشتراک بازخورد شما
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          {/* نام و ایمیل */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              mb: 3,
            }}
          >
            <TextField
              fullWidth
              label="نام"
              name="name"
              value={formData.name}
              onChange={handleChange}
              variant="outlined"
              size="small"
            />
            <TextField
              fullWidth
              label="ایمیل"
              name="email"
              value={formData.email}
              onChange={handleChange}
              variant="outlined"
              size="small"
            />
          </Box>

          {/* امتیاز */}
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            امتیاز شما
          </Typography>
          <Box dir="ltr">
            <Rating
              name="feedback-rating"
              value={rating}
              precision={1}
              onChange={(event, newValue) => setRating(newValue)}
              sx={{
                mb: 3,
                "& .MuiRating-iconFilled": { color: "#f5b301" },
                "& .MuiRating-iconEmpty": { color: "#ccc" },
              }}
            />
          </Box>

          {/* بازخورد */}
          <Typography variant="subtitle1">نظر شما</Typography>
          <TextField
            fullWidth
            name="feedback"
            multiline
            minRows={5}
            placeholder="تجربه‌ی خود را با ما در میان بگذارید..."
            value={formData.feedback}
            onChange={handleChange}
            sx={{ mb: 4 }}
          />

          {/* دکمه ارسال */}
          <Button
            type="submit"
            fullWidth
            sx={{
              bgcolor: "#3a322a",
              color: "#fff",
              borderRadius: "30px",
              py: 1.5,
              fontWeight: "bold",
              fontSize: "1rem",
              "&:hover": { bgcolor: "#2b241e" },
            }}
          >
            ارسال بازخورد
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
 
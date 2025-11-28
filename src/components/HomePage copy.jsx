import React from "react";
import {
    AppBar,
    Toolbar,
    Box,
    Button,
    IconButton,
    TextField,
    InputAdornment,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import SearchIcon from "@mui/icons-material/Search";

export default function Navbar() {
    return (
        <AppBar
            position="fixed"
            sx={{
                width: "95%",
                backgroundColor: "var(--color-secondary)",
                top: "2vh",
                left: "2.5vw",
                boxShadow: "1px 2px 10px gray",
                borderRadius: "50px",
                paddingX: 2,
                height: "10vh",
            }}
        >
            <Toolbar
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                {/* Left Icon */}
                <IconButton
                    disableRipple
                    disableFocusRipple
                    href="#logout"
                    sx={{
                        color: "var(--color-primary)",
                        "&:hover": { backgroundColor: "transparent" },
                        "&:focus": { outline: "none" },
                        "&:active": { outline: "none" },
                    }}
                >
                    <LogoutIcon />
                </IconButton>

                {/* Center Search Bar */}
                <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
                    <TextField
                        variant="outlined"
                        placeholder="Search..."
                        size="small"
                        sx={{
                            width: "40%",
                            backgroundColor: "var(--color-secondary)",
                            borderRadius: "25px",
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "25px",
                            },
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: "gray" }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                {/* Right Icons */}
                <Box sx={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <IconButton
                        disableRipple
                        disableFocusRipple
                        href="#home"
                        sx={{
                            color: "var(--color-primary)",
                            "&:hover": { backgroundColor: "transparent" },
                            "&:focus": { outline: "none" },
                            "&:active": { outline: "none" },
                        }}
                    >
                        <HomeIcon />
                    </IconButton>

                    <IconButton
                        disableRipple
                        disableFocusRipple
                        href="#settings"
                        sx={{
                            color: "var(--color-primary)",
                            "&:hover": { backgroundColor: "transparent" },
                            "&:focus": { outline: "none" },
                            "&:active": { outline: "none" },
                        }}
                    >
                        <SettingsIcon />
                    </IconButton>

                    <IconButton
                        disableRipple
                        disableFocusRipple
                        href="#mail"
                        sx={{
                            color: "var(--color-primary)",
                            "&:hover": { backgroundColor: "transparent" },
                            "&:focus": { outline: "none" },
                            "&:active": { outline: "none" },
                        }}
                    >
                        <MarkEmailUnreadIcon />
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar>
    );


}

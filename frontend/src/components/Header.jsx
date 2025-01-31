import React from "react";
import { Box, Button, AppBar, Toolbar, Typography } from "@mui/material";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const Header = () => {
  const navigate = useNavigate();

  const { isAuthenticated, logout, isAdmin } = useAuth();

  async function handleLogout(e) {
    try {
      await logout();
    } catch (err) {
      console.log(err.message);
    }
  }

  async function handleClickUser(e) {
    navigate("/users");
  }

  function handleClickTask(e) {
    navigate("/tasks");
  }

  return (
    <AppBar position="static" color="default" elevation={0}>
      <Toolbar style={{ justifyContent: "space-between" }}>
        <Box style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <Typography variant="h6" component="div" style={{ fontWeight: "bold" }}>
            Task Management System
          </Typography>
          {isAuthenticated ? (
            <div>
              <Button color="inherit" variant="outlined" onClick={handleClickTask}>
                Task Management
              </Button>
              {isAdmin ? (
                <Button color="inherit" variant="outlined" onClick={handleClickUser}>
                  User Management
                </Button>
              ) : (
                <></>
              )}
            </div>
          ) : (
            <></>
          )}
        </Box>
        {isAuthenticated ? (
          <Box style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {/* <Typography variant="body1">Logged in as: &lt;username&gt;</Typography> */}
            {/* <Button variant="outlined">Profile</Button> */}
            <Button variant="outlined" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        ) : (
          <></>
        )}
      </Toolbar>
    </AppBar>
  );
};
export default Header;

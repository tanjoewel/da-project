import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { TextField, Box, Button, TableBody, TableHead, Table, TableContainer, TableRow, Paper, TableCell } from "@mui/material";
import CreateUser from "../components/CreateUser";
import Axios from "axios";

export default function Users() {
  const [groupname, setGroupname] = useState("");
  const [users, setUsers] = useState([]);
  const [group, setGroups] = useState([]);

  // when the page first loads, get the users from the database
  useEffect(() => {
    async function getUsers() {
      try {
        const users = await Axios.get("/users");
        setUsers(users.data);
      } catch (e) {
        console.log("Error getting users");
      }
    }
    getUsers();

    async function getGroups() {
      try {
        const groups = await Axios.get("/groups");
        setGroups(groups.data);
      } catch (e) {
        console.log("Error getting groups");
      }
    }
    getGroups();
  }, []);

  async function handleUpdateClick() {
    // TODO send a request to the backend to update the user
    console.log("clicked");
  }

  async function handleCreateClick() {
    console.log("create");
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <nav>
        <NavLink to="/">Back to login</NavLink>
      </nav>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", px: 5 }}>
        <h2>Users</h2>
        <div>
          <TextField
            id="groupname"
            label="Group name"
            size="small"
            onChange={(e) => {
              setGroupname(e.target.value);
            }}
          />
          <Button onClick={handleCreateClick}>Create</Button>
        </div>
      </Box>
      <Box sx={{ mx: 3, mt: 2 }}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650, border: "1px solid black" }} aria-label="simple table" size="small">
            <TableHead>
              <TableRow sx={{ "& > th:not(:last-child)": { borderRight: "1px solid black" }, borderBottom: "2px solid black" }}>
                <TableCell label={"username"}>Username</TableCell>
                <TableCell>Password</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Group</TableCell>
                <TableCell>Account status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <CreateUser group={group} />
              {users.map((row) => {
                return (
                  <TableRow sx={{ "& > td:not(:last-child)": { borderRight: "1px solid black", p: "1px" } }} key={row.user_username}>
                    <TableCell>{row.user_username}</TableCell>
                    <TableCell>{row.user_password}</TableCell>
                    <TableCell>{row.user_email}</TableCell>
                    <TableCell></TableCell>
                    <TableCell>{row.user_enabled}</TableCell>
                    <TableCell>
                      <Button onClick={handleUpdateClick}>Update</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}

("display: flex; justify-content: space-between; align-items: center; width:100% ");

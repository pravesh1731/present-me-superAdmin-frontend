import axios from "axios";
import { BaseUrl } from "./constants";
import { removeUser } from "./userSlice";

// Shared by the sidebar and the header profile menu
export const logout = async (dispatch, navigate) => {
  try {
    await axios.post(BaseUrl + "/sadmin/logout", {}, { withCredentials: true });
    dispatch(removeUser());
    navigate("/superadmin/signin");
  } catch (err) {
    console.error("Logout failed:", err);
  }
};

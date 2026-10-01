import axios from "axios";
import { BaseUrl } from "./constants";
import {
  overviewFailed,
  overviewLoaded,
  overviewLoading,
} from "./overviewSlice";
import { setPendingCount, setVerifiedCount } from "./instituteSlice";

// Fetch the dashboard numbers. The server caches them for ~60s; pass { force: true } after an
// action (approve, verify, pay...) so the sidebar badges and dashboard update straight away.
export const loadOverview = async (dispatch, { force = false } = {}) => {
  dispatch(overviewLoading());
  try {
    const response = await axios.get(`${BaseUrl}/sadmin/overview`, {
      params: force ? { refresh: 1 } : undefined,
      withCredentials: true,
    });
    const data = response.data?.data;

    dispatch(overviewLoaded(data));
    // keep the older per-list counters in sync
    dispatch(setPendingCount(data?.institutions?.pending || 0));
    dispatch(setVerifiedCount(data?.institutions?.verified || 0));
    return data;
  } catch (err) {
    console.error("Error loading overview:", err);
    dispatch(
      overviewFailed(
        err.response?.data?.message ||
          "Unable to load the dashboard numbers. Please try again."
      )
    );
    return null;
  }
};

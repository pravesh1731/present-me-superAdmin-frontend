import React from "react";

// production
// export const BaseUrl = "/api";

// development
export const BaseUrl = location.hostname === "localhost" ? "http://localhost:3000" : "/api";


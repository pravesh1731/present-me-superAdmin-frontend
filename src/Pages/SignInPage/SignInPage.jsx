import axios from "axios";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addUser } from "../../Components/utils/userSlice";

const SignInPage = () => {
  const [emailId, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await axios.post(
        BaseUrl + "/sadmin/login",
        {
          emailId,
          password,
        },
        { withCredentials: true }
      );
      dispatch(addUser(response.data));
      navigate("/superadmin");
    } catch (err) {
      console.log("Error during sign in:", err);
      setError(
        err.response?.data?.message || "Invalid credentials. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#f0fbff] to-[#eef8ff] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-linear-to-br from-[#0BCCEB] to-[#0A80F5]  rounded-xl p-3 shadow-md mb-4">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path
                d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z"
                fill="white"
              />
              <path
                d="M2 22c0-4.418 3.582-8 8-8h4c4.418 0 8 3.582 8 8v0H2z"
                fill="white"
                opacity="0.9"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Present-Me Super Admin
          </h1>
          <p className="text-sm text-gray-500">
            Sign in to your super admin account
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-gray-800 font-semibold mb-1">Sign In</h2>
          <p className="text-sm text-gray-500 mb-6">
            Enter your credentials to access the super admin panel
          </p>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            <label className="block text-sm text-gray-600 mb-2">Email</label>
            <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 px-3 py-2 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2.94 6.94a1.5 1.5 0 011.06-.44h11.999a1.5 1.5 0 011.06.44l-6.06 4.29L2.94 6.94z" />
                <path d="M18 8.5v5A2.5 2.5 0 0115.5 16h-11A2.5 2.5 0 012 13.5v-5L9 12l9-3.5z" />
              </svg>
              <input
                type="email"
                required
                value={emailId}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="bg-transparent outline-none w-full text-sm text-gray-700"
              />
            </div>

            <label className="block text-sm text-gray-600 mb-2">Password</label>
            <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 px-3 py-2 mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5 8a5 5 0 1110 0v1h1a2 2 0 012 2v5a2 2 0 01-2 2H4a2 2 0 01-2-2v-5a2 2 0 012-2h1V8zm3-1a3 3 0 116 0v1H8V7z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="bg-transparent outline-none w-full text-sm text-gray-700"
              />
              <button type="button" className="text-xs text-gray-400 ml-2">
                👁️
              </button>
            </div>

            <div className="flex items-center justify-between mb-4">
              <label className="inline-flex items-center text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember(!remember)}
                  className="form-checkbox h-4 w-4 text-cyan-500 rounded mr-2"
                />
                Remember me
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-linear-to-br from-[#0BCCEB] to-[#0A80F5]   text-white font-medium py-2 rounded-lg shadow-md mb-4"
            >
              Sign in
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2024 Present-Me. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default SignInPage;

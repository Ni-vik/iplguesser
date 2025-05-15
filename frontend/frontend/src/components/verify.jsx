import { useEffect, useState } from "react";
import { checkDevice, registerUser as registerUserAPI } from "../api/playerApi";

const UserVerification = ({ onVerified }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState(""); // for showing errors or success messages

  let deviceId = localStorage.getItem("deviceId");
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem("deviceId", deviceId);
  }

    // let deviceId ="kahitari pan"

  useEffect(() => {
    const verifyDevice = async () => {
      const result = await checkDevice(deviceId);
      setIsVerified(result.exists);
      if (result.exists && result.user) {
        setName(result.user.name);
        localStorage.setItem('username', result.user.name);
        onVerified(result.user.name);  // ✅ Call the callback here
      }
      setIsLoading(false);
    };
    verifyDevice();
  }, [deviceId, onVerified]);

  const handleRegister = async () => {
    setMessage(""); // clear previous message
    if (!username.trim()) {
      setMessage("Please enter a username");
      return;
    }

    try {
      const result = await registerUserAPI(deviceId, username);

      if (result.error) {
        // handle known errors from backend
        if (
          result.error === "Username already taken" ||
          result.error === "Device already registered"
        ) {
          setMessage(`Error: ${result.error}. Please try another username.`);
        } else {
          setMessage("Registration failed. Please try again.");
        }
      } else if (result.user) {
      setIsVerified(true);
      setName(result.user.name);
      setMessage("User successfully registered!");
      onVerified(result.user.name);  // ✅ Callback on registration
    }
    } catch (err) {
      setMessage("Username taken.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-lg shadow-md font-sans">
      {!isLoading && isVerified && (
        <>
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
            You are logged in
          </h1>
          <h2 className="text-lg text-center text-gray-600">
            Your user name is: <span className="font-semibold">{name}</span>
          </h2>
        </>
      )}

      {!isLoading && !isVerified && (
        <>
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            User not registered
          </h1>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter a username"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          />
          <button
            onClick={handleRegister}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition"
          >
            Submit
          </button>
          {message && (
            <p
              className={`mt-4 text-center font-medium ${
                message.startsWith("Error")
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {message}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default UserVerification;

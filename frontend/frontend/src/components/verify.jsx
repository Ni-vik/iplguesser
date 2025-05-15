import { useEffect, useState } from "react";
import { checkDevice, registerUser as registerUserAPI } from "../api/playerApi";

const UserVerification = ({ onVerified }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");

//   let deviceId = localStorage.getItem("deviceId");
//   if (!deviceId) {
//     deviceId = crypto.randomUUID();
//     localStorage.setItem("deviceId", deviceId);
//   }

let deviceId = "fberfbuerbu";

  useEffect(() => {
    const verifyDevice = async () => {
      const result = await checkDevice(deviceId);
      setIsVerified(result.exists);
      if (result.exists && result.user) {
        setName(result.user.name);
        localStorage.setItem("username", result.user.name);
        onVerified(result.user.name);
      }
      setIsLoading(false);
    };
    verifyDevice();
  }, [deviceId, onVerified]);

  const handleRegister = async () => {
    setMessage("");
    if (!username.trim()) {
      setMessage("Please enter a username");
      return;
    }

    try {
      const result = await registerUserAPI(deviceId, username);
      if (result.error) {
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
        onVerified(result.user.name);
      }
    } catch (err) {
      setMessage("Username taken.Please Try Again");
    }
  };

  return (
    <div
  className="min-h-screen flex items-center justify-center relative"
  style={{
    backgroundImage: "url('/logos/intro.png')",  // ✅ only the URL here
    backgroundSize: "contain",                   // ✅ set separately
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center"
  }}
>
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div> {/* overlay blur */}
      
      <div className="relative z-10 w-full max-w-md p-6 bg-white bg-opacity-90 rounded-xl shadow-xl">
        {!isLoading && isVerified && (
          <>
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
              You are logged in
            </h1>
            <h2 className="text-lg text-center text-gray-600">
              Your user name is:{" "}
              <span className="font-semibold text-blue-700">{name}</span>
            </h2>
          </>
        )}

        {!isLoading && !isVerified && (
          <>
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
              Register to Continue
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition duration-200"
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
    </div>
  );
};

export default UserVerification;

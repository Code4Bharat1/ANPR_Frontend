const DEFAULT_IP = "192.168.0.100";

export const getBaseURL = () => {
  if (typeof window === "undefined") {
    return `http://${DEFAULT_IP}/api/v1`;
  }

  const savedIP = localStorage.getItem("API_IP");
  const ip = savedIP && savedIP.trim() !== "" ? savedIP : DEFAULT_IP;

  return `http://${ip}/api/v1`;
};

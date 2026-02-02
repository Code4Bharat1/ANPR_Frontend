import axios from "axios";

const DEFAULT_CAMERA_IP = "192.168.0.100";

function getCameraURL() {
  return `http://${DEFAULT_CAMERA_IP}`;
}

export async function POST() {
  try {
    const response = await axios.post(
      `${getCameraURL()}/api/v1/auth/login`,
      {
        username: "admin",
        password: "Admin@1923",
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",

          // ✅ EXACT camera-required headers
          "X-Alpha": "21",
          "X-Salt": "683239",
          "X-Cue": "34db55e07f7b39df480284397f7f42ec",
        },
        timeout: 8000,
      },
    );

    return Response.json(response.data, { status: 200 });
  } catch (error) {
    console.error("Camera Login Error:", error?.message);

    return Response.json(
      {
        message:
          error?.response?.data?.message ||
          error.message ||
          "Camera not reachable",
      },
      { status: 500 },
    );
  }
}

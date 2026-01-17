import axios from "axios";

export async function POST(req) {
  try {
    const formData = await req.formData();

    const response = await axios.post(
      "https://api.platerecognizer.com/v1/plate-reader/",
      formData,
      {
        headers: {
          Authorization: `Token ${process.env.PLATE_RECOGNIZER_KEY}`,
        },
      }
    );

    return Response.json(response.data);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "OCR failed" }, { status: 500 });
  }
}

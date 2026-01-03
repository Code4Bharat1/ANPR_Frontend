import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken");

  if (!token) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1>Protected Home Page</h1>
    </div>
  );
}

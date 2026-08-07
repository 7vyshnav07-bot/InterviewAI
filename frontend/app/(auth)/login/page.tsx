"use client";
import { toast } from "sonner";
import { login } from "@/services/authService";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
type LoginForm = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

 const onSubmit = async (data: LoginForm) => {
  try {
    const response = await login(data);

    localStorage.setItem("token", response.access_token);
toast.success("Login successful!");
    router.push("/dashboard");
  } catch (error) {
    console.error(error);
    toast.error("Invalid email or password");
  }
};

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="w-full max-w-md rounded-xl bg-slate-900 p-8 shadow-lg">

        <h1 className="mb-6 text-center text-3xl font-bold text-white">
          Login
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Email
            </label>

            <input
              type="email"
              {...register("email", {
                required: "Email is required",
              })}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
            />

            <p className="mt-1 text-sm text-red-400">
              {errors.email?.message}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Password
            </label>

            <input
              type="password"
              {...register("password", {
                required: "Password is required",
              })}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
            />

            <p className="mt-1 text-sm text-red-400">
              {errors.password?.message}
            </p>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Login
          </button>
        </form>
      </div>
    </main>
  );
}
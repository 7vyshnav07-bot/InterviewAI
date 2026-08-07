"use client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { registerUser } from "@/services/authService";

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      toast.success("Account created successfully!");

      router.push("/login");
    } catch (error) {
      console.error(error);
      toast.error("Registration failed");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="w-full max-w-md rounded-xl bg-slate-900 p-8 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold text-white">
          Create Account
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Full Name
            </label>

            <input
              type="text"
              {...register("name", {
                required: "Name is required",
              })}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
            />

            <p className="mt-1 text-sm text-red-400">
              {errors.name?.message}
            </p>
          </div>

          {/* Email */}
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

          {/* Password */}
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Password
            </label>

            <input
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
            />

            <p className="mt-1 text-sm text-red-400">
              {errors.password?.message}
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Confirm Password
            </label>

            <input
              type="password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === watch("password") || "Passwords do not match",
              })}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
            />

            <p className="mt-1 text-sm text-red-400">
              {errors.confirmPassword?.message}
            </p>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Register
          </button>

          <p className="text-center text-sm text-slate-400">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-medium text-blue-500 hover:underline"
            >
              Login
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}
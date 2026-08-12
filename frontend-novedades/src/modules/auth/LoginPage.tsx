import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Mail, Lock, ShieldCheck, FileCheck2, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "./AuthContext";
import { ApiError } from "@/lib/axios";

const schema = z.object({
  email: z.string().min(1, "El correo es obligatorio").email("Correo inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

type FormValues = z.infer<typeof schema>;

const highlights = [
  { icon: FileCheck2, text: "Registra incapacidades, licencias y permisos en segundos." },
  { icon: Users, text: "Cada líder revisa y confirma su propio equipo." },
  { icon: ShieldCheck, text: "Consolidado listo antes de cada cierre de nómina." },
];

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await login(values.email, values.password);
      const redirectTo = (location.state as { from?: string })?.from ?? "/";
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "No se pudo iniciar sesión.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Panel de marca */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-primary-500 p-12 text-white lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-primary-400/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-16 size-96 rounded-full bg-secondary-500/20 blur-3xl"
        />

        <img
          src="/brand/trapiche-logo.png"
          alt="Lujos El Trapiche"
          className="relative h-8 w-auto self-start object-contain brightness-0 invert"
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative max-w-md"
        >
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Gestión de Novedades de Personal
          </h1>
          <p className="mt-4 text-primary-100">
            Un solo lugar para registrar, aprobar y consolidar las novedades de tu equipo.
          </p>

          <ul className="mt-10 space-y-4">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="size-4 text-secondary-300" />
                </span>
                <span className="text-sm text-primary-100">{text}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <p className="relative text-xs text-primary-200">
          © {new Date().getFullYear()} Lujos El Trapiche · Uso interno
        </p>
      </div>

      {/* Formulario */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="mb-10 flex justify-center lg:hidden">
            <img
              src="/brand/trapiche-logo.png"
              alt="Lujos El Trapiche"
              className="h-7 w-auto object-contain"
            />
          </div>

          <div className="mb-8 hidden justify-start lg:flex">
            <img
              src="/brand/trapiche-isotipo.png"
              alt=""
              aria-hidden
              className="h-10 w-auto object-contain"
            />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Iniciar sesión</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Ingresa con tu cuenta corporativa para continuar.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4">
            <Input
              label="Correo electrónico"
              type="email"
              autoComplete="email"
              icon={Mail}
              placeholder="nombre@lujoseltrapiche.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              icon={Lock}
              placeholder="••••••••"
              error={errors.password?.message}
              {...register("password")}
            />
            <Button type="submit" size="lg" isLoading={submitting} className="mt-2 w-full">
              Ingresar
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

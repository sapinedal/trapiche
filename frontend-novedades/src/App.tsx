import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/modules/auth/AuthContext";
import { router } from "@/routes/router";
import { Z_INDEX } from "@/lib/zIndex";

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        richColors
        closeButton
        style={{ zIndex: Z_INDEX.toast }}
      />
    </AuthProvider>
  );
}

export default App;

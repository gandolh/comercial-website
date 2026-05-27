import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@core/lib/router";
import { register } from "../services/auth";
import { useAuth } from "@core/lib/auth";

export function useRegisterMutation() {
  const navigate = useNavigate();
  const authLogin = useAuth((state) => state.login);

  return useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      authLogin(data.user, data.token);
      navigate("/");
    },
  });
}

import { useMutation } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "@core/lib/router";
import { login } from "../services/auth";
import { useAuth } from "@core/lib/auth";

export function useLoginMutation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const authLogin = useAuth((state) => state.login);

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      authLogin(data.user, data.token);
      navigate(searchParams.get("next") || "/");
    },
  });
}

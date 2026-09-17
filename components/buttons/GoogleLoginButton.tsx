"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { useGoogleLoginMutation } from "@/lib/store/authApiSlice";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { Loader2 } from "lucide-react";
import Image from "next/image";

export default function GoogleLoginButton() {
  const router = useRouter();
  const [googleLoginApi, { isLoading }] = useGoogleLoginMutation();

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // 1. Fetch the user's profile from Google using the implicit access token
        const userInfoRes = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          },
        );
        const userInfo = await userInfoRes.json();

        // 2. Send the profile to your NestJS backend
        await googleLoginApi({
          profile: {
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
          },
        }).unwrap();

        toast.success("Đăng nhập Google thành công!");

        // 3. Force refresh and navigate to dashboard
        router.refresh();
        window.location.href = "/dashboard";
      } catch (error: any) {
        console.error("Google Auth Error:", error);
        toast.error("Đăng nhập bằng Google thất bại. Vui lòng thử lại.");
      }
    },
    onError: () => {
      toast.error("Google login bị hủy hoặc thất bại.");
    },
  });

  return (
    <button
      type="button"
      onClick={() => loginWithGoogle()}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 bg-white dark:bg-muted border border-border text-foreground py-3 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-muted/80 transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      ) : (
        <Image
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google logo"
          width={20}
          height={20}
        />
      )}
      {isLoading ? "ĐANG XỬ LÝ..." : "TIẾP TỤC VỚI GOOGLE"}
    </button>
  );
}

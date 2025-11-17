import { useEffect, useState } from "react";
import profileIcon from "/src/assets/userImages/profileIcon.png";
import UserHeader from "../features/users/UserPages/UserHeader";
import { userService } from "../services/user.service";
import { showSignupSuccessToast, showSignupErrorToast } from "../components/common/ToastBanner";


export default function ManageProfile() {
    const [firstName, setFirstName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [isEmailVerify, setIsEmailVerify] = useState<boolean>(false);
    const [isActive, setIsActive] = useState<boolean>(true);
    const [userId, setUserId] = useState<number | null>(null);
    const [passwordEmail, setPasswordEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // 1) Try from bm_user (stored object)
                const raw = localStorage.getItem("bm_user");
                let id: number | null = null;
                if (raw) {
                    try {
                        const parsed = JSON.parse(raw);
                        if (parsed) {
                            const candidate = parsed.id ?? parsed.userId;
                            if (candidate != null) id = Number(candidate);
                        }
                    } catch (_) {
                        // ignore parse error
                    }
                }

                // 2) Fallback: decode bm_access JWT and use payload.id
                if (id == null || Number.isNaN(id)) {
                    const token = localStorage.getItem("bm_access");
                    if (token && token.includes(".")) {
                        try {
                            const base64Url = token.split(".")[1];
                            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
                            const payload = JSON.parse(atob(base64));
                            const candidate = payload?.id ?? payload?.userId;
                            if (candidate != null) id = Number(candidate);
                        } catch (_) { }
                    }
                }

                if (id == null || Number.isNaN(id)) {
                    return; // no id available; skip call
                }

                const res: any = await userService.getById(id);
                const user = res?.output ?? res;
                const first = user?.firstName ?? "";
                const middle = user?.middleName ?? "";
                const last = user?.lastName ?? "";
                setFirstName(first);
                setMiddleName(middle);
                setLastName(last);
                setPhone(user?.mobileNo ?? "");
                setEmail(user?.email ?? "");
                setIsEmailVerify(Boolean(user?.isEmailVerify));
                setIsActive(user?.isActive ?? true);
                setUserId(Number(id));
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        };
        fetchUser();
    }, []);

    return (
        <>
            <div className="min-h-[100vh] bg-[#01351f]">
                <UserHeader fullHeight={false} />
                <div className="max-w-5xl mx-auto px-5 py-4">
                    <div className="flex flex-col items-center">
                        <img src={profileIcon} alt="" className="w-[40px] h-[78px] mb-3" />
                        <h1 className="text-white text-[16px] font-[800]">
                            Administrér profil
                        </h1>
                    </div>

                    <form
                        className="mt-6 space-y-4"
                        onSubmit={async (e) => {
                            e.preventDefault();
                            if (userId == null) return;
                            const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ");
                            const payload = {
                                id: userId,
                                firstName: firstName,
                                middleName: middleName,
                                lastName: lastName,
                                fullName: fullName,
                                email,
                                mobileNo: phone,
                                isEmailVerify: isEmailVerify,
                                isActive: isActive,
                                status: isActive ? "Active" : "InActive",
                            } as any;
                            try {
                                await userService.update(payload);
                                showSignupSuccessToast("Profil opdateret");
                            } catch (err) {
                                console.error("Failed to update profile", err);
                                showSignupErrorToast("Kunne ikke opdatere profilen");
                            }
                        }}
                    >
                        <div>
                            <label className="block text-white text-sm mb-1">Fornavn</label>
                            <input
                                className="w-full rounded-md bg-white text-gray-900 px-4 py-2.5 outline-none"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-white text-sm mb-1">Mellemnavn</label>
                            <input
                                className="w-full rounded-md bg-white text-gray-900 px-4 py-2.5 outline-none"
                                value={middleName}
                                onChange={(e) => setMiddleName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-white text-sm mb-1">Efternavn</label>
                            <input
                                className="w-full rounded-md bg-white text-gray-900 px-4 py-2.5 outline-none"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-white text-sm mb-1">Mobilnr.</label>
                            <input
                                className="w-full rounded-md bg-white text-gray-900 px-4 py-2.5 outline-none"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-white text-sm mb-1">Email</label>
                            <input
                                type="email"
                                className="w-full rounded-md bg-white text-gray-900 px-4 py-2.5 outline-none"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full bg-[#95C11F] text-white font-semibold rounded-full py-2.5 cursor-pointer"
                            >
                                Gem ændringer
                            </button>
                        </div>
                    </form>

                    <form
                        className="mt-8 space-y-4"
                        onSubmit={async (e) => {
                            e.preventDefault();
                            try {
                                await userService.resetUserPassword({
                                    email: passwordEmail || email,
                                    newPassword: newPassword,
                                });
                                showSignupSuccessToast("Adgangskode opdateret");
                                setNewPassword("");
                            } catch (err) {
                                console.error("Failed to reset password", err);
                                showSignupErrorToast("Kunne ikke opdatere adgangskoden");
                            }
                        }}
                    >
                        <h2 className="text-white text-[14px] font-[700]">Skift adgangskode</h2>
                        <div>
                            <label className="block text-white text-sm mb-1">Email</label>
                            <input
                                type="email"
                                className="w-full rounded-md bg-white text-gray-900 px-4 py-2.5 outline-none"
                                value={passwordEmail || email}
                                onChange={(e) => setPasswordEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-white text-sm mb-1">Ny adgangskode</label>
                            <input
                                type="password"
                                className="w-full rounded-md bg-white text-gray-900 px-4 py-2.5 outline-none"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full bg-[#95C11F] text-white font-semibold rounded-full py-2.5 cursor-pointer"
                            >
                                Skift adgangskode
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

import Footer from "../../../pages/Footer";
import { partnerDocumentService } from "../../../services/partnerdocument.service";
import PartnerHeader from "./PartnerHeader";
import documentImg from "/src/assets/userImages/document.png";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function PartnerDocuments() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [docs, setDocs] = useState([] as any[]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const calledRef = useRef(false);

    useEffect(() => {
        const storedPartner = localStorage.getItem("bm_partner");
        if (!storedPartner) {
            navigate("/partner/statistics", { replace: true });
        }
    }, [navigate]);

    useEffect(() => {
        if (calledRef.current) return;
        calledRef.current = true;
        const token = localStorage.getItem("bm_access");
        if (token) {
            try {
                const base64Url = token.split(".")[1];
                const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
                const decodedPayload = JSON.parse(window.atob(base64));
                console.log("Decoded Token:", decodedPayload);
                const partnerIdStr = decodedPayload?.partnerId;
                const partnerId = partnerIdStr ? parseInt(partnerIdStr, 10) : undefined;
                if (partnerId && !Number.isNaN(partnerId)) {
                    setLoading(true);
                    partnerDocumentService
                        .getPartnerDocumentByPartnerIdList(partnerId)
                        .then((res) => {
                            console.log("Partner Documents API response:", res);
                            const items = res?.output ?? [];
                            console.log("Documents:", items);
                            setDocs(items as any[]);
                        })
                        .catch((e) => {
                            setError("Failed to load documents");
                            console.error(e);
                        })
                        .finally(() => setLoading(false));
                } else {
                    console.log("partnerId missing in token");
                }
            } catch (e) {
                console.error("Failed to decode token", e);
            }
        } else {
            console.log("No token found");
        }
    }, []);

    return (
        <>
            <div className="fixed top-0 left-0 right-0">
                <PartnerHeader fullHeight={false} />
            </div>
            <div className="h-[100vh] bg-[#01351f]">
                <div className="max-w-xl md:max-w-2xl mx-auto px-4 md:px-6 pt-10 pb-16">
                    <div className="flex flex-col items-center mt-[5rem]">
                        <div className="w-[60px] h-[56px] mb-4 text-white">
                            <img src={documentImg} alt="" />
                        </div>
                        <h2 className="text-white text-[16px] font-[800] tracking-wide">
                            {t("admin.partners.Documents")}
                        </h2>
                    </div>

                    <div className="mt-6 bg-white rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.25)]">
                        <div className="w-full text-left px-6 py-5">
                            {loading && <div className="text-sm text-gray-600">Loading…</div>}
                            {error && <div className="text-sm text-red-600">{error}</div>}
                            {!loading && !error && docs.length === 0 && (
                                <div className="text-sm text-gray-600">No documents</div>
                            )}
                            {!loading && !error && docs.length > 0 && (
                                <ul className="divide-y">
                                    {docs.map((d: any) => (
                                        <li
                                            key={d.id}
                                            className="py-3 flex items-center justify-between gap-4"
                                        >
                                            <div className="min-w-0">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    {d.documentName}
                                                </div>
                                                <div className="text-sm text-gray-600 truncate">
                                                    {d.documentType || ""}
                                                </div>
                                            </div>
                                            {d.documentUrl && (
                                                <a
                                                    className="text-[#0F5132] text-sm font-medium whitespace-nowrap cursor-pointer"
                                                    href={d.documentUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        window.open(d.documentUrl, "_blank", "noopener,noreferrer");
                                                    }}
                                                >
                                                    Læs mere
                                                </a>

                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

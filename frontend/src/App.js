import React, { useMemo, useState } from "react";
import "@/App.css";
import { ShoppingCart, User, MapPin, Phone, Shirt, Package, DollarSign, Send, CheckCircle, MessageCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Toaster, toast } from "@/components/ui/sonner";
import { supabase } from "@/lib/supabaseClient";

const HARGA = {
  anakPendek: 50000,
  anakPanjang: 60000,
  dewasaPendek: 100000,
  dewasaPanjang: 110000,
};

const defaultAnak = { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
const defaultDewasa = { S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0, "4XL": 0, "5XL": 0 };

const countTotalItems = (data) => Object.values(data).reduce((sum, val) => sum + Number(val || 0), 0);
const formatRupiah = (amount) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

export default function App() {
  const [formData, setFormData] = useState({ nama: "", no_hp: "", alamat: "" });
  const [sizeAnakPendek, setSizeAnakPendek] = useState(defaultAnak);
  const [sizeAnakPanjang, setSizeAnakPanjang] = useState(defaultAnak);
  const [sizeDewasaPendek, setSizeDewasaPendek] = useState(defaultDewasa);
  const [sizeDewasaPanjang, setSizeDewasaPanjang] = useState(defaultDewasa);
  const [enableAnakPendek, setEnableAnakPendek] = useState(false);
  const [enableAnakPanjang, setEnableAnakPanjang] = useState(false);
  const [enableDewasaPendek, setEnableDewasaPendek] = useState(false);
  const [enableDewasaPanjang, setEnableDewasaPanjang] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderData, setOrderData] = useState(null);

  const totalHarga = useMemo(() => {
    let total = 0;
    if (enableAnakPendek) total += countTotalItems(sizeAnakPendek) * HARGA.anakPendek;
    if (enableAnakPanjang) total += countTotalItems(sizeAnakPanjang) * HARGA.anakPanjang;
    if (enableDewasaPendek) total += countTotalItems(sizeDewasaPendek) * HARGA.dewasaPendek;
    if (enableDewasaPanjang) total += countTotalItems(sizeDewasaPanjang) * HARGA.dewasaPanjang;
    return total;
  }, [enableAnakPendek, enableAnakPanjang, enableDewasaPendek, enableDewasaPanjang, sizeAnakPendek, sizeAnakPanjang, sizeDewasaPendek, sizeDewasaPanjang]);

  const resetForm = () => {
    setOrderSuccess(false);
    setOrderData(null);
    setFormData({ nama: "", no_hp: "", alamat: "" });
    setSizeAnakPendek(defaultAnak);
    setSizeAnakPanjang(defaultAnak);
    setSizeDewasaPendek(defaultDewasa);
    setSizeDewasaPanjang(defaultDewasa);
    setEnableAnakPendek(false);
    setEnableAnakPanjang(false);
    setEnableDewasaPendek(false);
    setEnableDewasaPanjang(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nama || !formData.no_hp || !formData.alamat) {
      toast.error("Mohon lengkapi semua data wajib.");
      return;
    }

    if (totalHarga <= 0) {
      toast.error("Mohon pilih minimal 1 kaos.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nama: formData.nama.trim(),
        no_hp: formData.no_hp.trim(),
        alamat: formData.alamat.trim(),
        size_anak_pendek: enableAnakPendek ? sizeAnakPendek : {},
        size_anak_panjang: enableAnakPanjang ? sizeAnakPanjang : {},
        size_dewasa_pendek: enableDewasaPendek ? sizeDewasaPendek : {},
        size_dewasa_panjang: enableDewasaPanjang ? sizeDewasaPanjang : {},
        total_harga: totalHarga,
      };

      const { data, error } = await supabase
        .from('orders')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error("Error submitting order:", error);
        toast.error(`Gagal mengirim pesanan: ${error.message}`);
        return;
      }

      setOrderData(data);
      setOrderSuccess(true);
      toast.success("Pesanan berhasil dikirim!");
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error("Gagal mengirim pesanan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleSizeChange = (setter, current, key, value) => {
    setter({ ...current, [key]: Math.max(0, parseInt(value, 10) || 0) });
  };

  const handleWhatsAppConfirm = () => {
    const message =
      `Halo! Saya ${formData.nama} ingin konfirmasi pesanan Kaos Khatulistiwa Batch 1:nn` +
      `Nama: ${formData.nama}n` +
      `No HP: ${formData.no_hp}n` +
      `Alamat: ${formData.alamat}nn` +
      `Total: ${formatRupiah(totalHarga)}nn` +
      "Terima kasih.";

    window.open(`https://wa.me/6285338538900?text=${encodeURIComponent(message)}`, "_blank");
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4" data-testid="order-success-screen">
        <Toaster />
        <Card className="max-w-md w-full shadow-2xl border-2 border-green-200">
          <CardContent className="pt-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <div data-testid="order-success-message">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Pesanan Berhasil</h2>
              <p className="text-gray-600">Terima kasih {formData.nama}, pesanan Anda telah kami terima.</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-left" data-testid="order-success-summary">
              <p className="text-sm text-gray-700 mb-1"><span className="font-semibold">Total:</span> {formatRupiah(totalHarga)}</p>
              <p className="text-xs text-gray-500 mt-2">ID Pesanan: {orderData?.id?.slice(0, 8)}</p>
            </div>
            <Button onClick={handleWhatsAppConfirm} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-base" data-testid="whatsapp-confirm-button">
              <MessageCircle className="mr-2" size={20} />
              Konfirmasi via WhatsApp
            </Button>
            <Button onClick={resetForm} variant="outline" className="w-full" data-testid="order-again-button">
              Pesan Lagi
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-8 px-4" data-testid="order-page">
      <Toaster />
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl shadow-xl p-8 mb-6 text-white" data-testid="header-section">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Pemesanan Kaos Khatulistiwa Batch 1</h1>
              <p className="text-blue-100 text-sm mt-1" data-testid="header-description">Mohon isi data dengan benar agar proses pengerjaan lancar.</p>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 mt-6" data-testid="contact-person-section">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Phone size={18} /> Contact Person
            </h3>
            <div className="space-y-1 text-sm" data-testid="contact-person-list">
              <p>085338538900 (Mendem)</p>
              <p>081519719102 (Pulu)</p>
            </div>
          </div>
        </div>

        <Card className="mb-6 overflow-hidden shadow-lg" data-testid="mockup-section">
          <CardContent className="p-0">
            <img src="/mockup.png" alt="Mockup Kaos Khatulistiwa" className="w-full h-auto object-cover" data-testid="mockup-image" />
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6" data-testid="order-form">
          <Card className="shadow-lg" data-testid="customer-data-section">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center"><User className="text-white" size={20} /></div>
                <div>
                  <CardTitle className="text-xl">Data Pemesan</CardTitle>
                  <CardDescription>Informasi lengkap pemesan</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label htmlFor="nama" className="text-base font-semibold">Nama <span className="text-red-500">*</span></Label>
                <Input id="nama" value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} placeholder="Contoh: Budi Santoso" required className="mt-2 h-12 text-base" data-testid="nama-input" />
              </div>
              <div>
                <Label htmlFor="no_hp" className="text-base font-semibold">No HP/WhatsApp <span className="text-red-500">*</span></Label>
                <Input id="no_hp" value={formData.no_hp} onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })} placeholder="Contoh: 081234567890" required className="mt-2 h-12 text-base" data-testid="no-hp-input" />
              </div>
              <div>
                <Label htmlFor="alamat" className="text-base font-semibold">Alamat Lengkap <span className="text-red-500">*</span></Label>
                <Textarea id="alamat" value={formData.alamat} onChange={(e) => setFormData({ ...formData, alamat: e.target.value })} placeholder="Contoh: Jl. Mawar No. 10, Jakarta Selatan" required rows={3} className="mt-2 text-base" data-testid="alamat-input" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg" data-testid="size-anak-section">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center"><Shirt className="text-white" size={20} /></div>
                <div><CardTitle className="text-xl">Size Anak</CardTitle><CardDescription>Rp 50.000 (pendek) | Rp 60.000 (panjang)</CardDescription></div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox id="anak-pendek" checked={enableAnakPendek} onCheckedChange={setEnableAnakPendek} data-testid="anak-pendek-checkbox" />
                  <Label htmlFor="anak-pendek" className="text-base font-semibold cursor-pointer">Lengan Pendek</Label>
                </div>
                {enableAnakPendek && (
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3" data-testid="anak-pendek-grid">
                    {Object.keys(sizeAnakPendek).map((size) => (
                      <div key={size}><Label className="text-xs text-center block mb-1 font-bold">{size}</Label><Input type="number" min="0" value={sizeAnakPendek[size]} onChange={(e) => handleSizeChange(setSizeAnakPendek, sizeAnakPendek, size, e.target.value)} className="text-center h-10" data-testid={`anak-pendek-${size.toLowerCase()}-input`} /></div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox id="anak-panjang" checked={enableAnakPanjang} onCheckedChange={setEnableAnakPanjang} data-testid="anak-panjang-checkbox" />
                  <Label htmlFor="anak-panjang" className="text-base font-semibold cursor-pointer">Lengan Panjang</Label>
                </div>
                {enableAnakPanjang && (
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3" data-testid="anak-panjang-grid">
                    {Object.keys(sizeAnakPanjang).map((size) => (
                      <div key={size}><Label className="text-xs text-center block mb-1 font-bold">{size}</Label><Input type="number" min="0" value={sizeAnakPanjang[size]} onChange={(e) => handleSizeChange(setSizeAnakPanjang, sizeAnakPanjang, size, e.target.value)} className="text-center h-10" data-testid={`anak-panjang-${size.toLowerCase()}-input`} /></div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg" data-testid="size-dewasa-section">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center"><Package className="text-white" size={20} /></div>
                <div><CardTitle className="text-xl">Size Dewasa</CardTitle><CardDescription>Rp 100.000 (pendek) | Rp 110.000 (panjang)</CardDescription></div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox id="dewasa-pendek" checked={enableDewasaPendek} onCheckedChange={setEnableDewasaPendek} data-testid="dewasa-pendek-checkbox" />
                  <Label htmlFor="dewasa-pendek" className="text-base font-semibold cursor-pointer">Lengan Pendek</Label>
                </div>
                {enableDewasaPendek && (
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-3" data-testid="dewasa-pendek-grid">
                    {Object.keys(sizeDewasaPendek).map((size) => (
                      <div key={size}><Label className="text-xs text-center block mb-1 font-bold">{size}</Label><Input type="number" min="0" value={sizeDewasaPendek[size]} onChange={(e) => handleSizeChange(setSizeDewasaPendek, sizeDewasaPendek, size, e.target.value)} className="text-center h-10" data-testid={`dewasa-pendek-${size.toLowerCase()}-input`} /></div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox id="dewasa-panjang" checked={enableDewasaPanjang} onCheckedChange={setEnableDewasaPanjang} data-testid="dewasa-panjang-checkbox" />
                  <Label htmlFor="dewasa-panjang" className="text-base font-semibold cursor-pointer">Lengan Panjang</Label>
                </div>
                {enableDewasaPanjang && (
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-3" data-testid="dewasa-panjang-grid">
                    {Object.keys(sizeDewasaPanjang).map((size) => (
                      <div key={size}><Label className="text-xs text-center block mb-1 font-bold">{size}</Label><Input type="number" min="0" value={sizeDewasaPanjang[size]} onChange={(e) => handleSizeChange(setSizeDewasaPanjang, sizeDewasaPanjang, size, e.target.value)} className="text-center h-10" data-testid={`dewasa-panjang-${size.toLowerCase()}-input`} /></div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-2 border-blue-200" data-testid="summary-section">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center"><DollarSign className="text-white" size={20} /></div>
                <CardTitle className="text-xl">Total Pembayaran</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-gray-600 mb-2">Total yang harus dibayar:</p>
              <p className="text-4xl font-bold text-blue-600" data-testid="total-harga">{formatRupiah(totalHarga)}</p>
            </CardContent>
          </Card>

          <Button type="submit" disabled={loading || totalHarga === 0} className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-6 text-lg shadow-lg" data-testid="submit-order-button">
            {loading ? "Mengirim..." : <><Send className="mr-2" size={20} />Kirim Pesanan</>}
          </Button>
        </form>
      </div>
    </div>
  );
}
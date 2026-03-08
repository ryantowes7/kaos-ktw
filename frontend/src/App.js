import React, { useMemo, useState } from "react";
import "@/App.css";
import { ShoppingCart, User, MapPin, Phone, Shirt, Package, DollarSign, Send, CheckCircle, MessageCircle, CreditCard, Building2 } from "lucide-react";
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
  anakPanjang: 50000,
  dewasaPendek: 100000,
  dewasaPanjang: 110000,
};

const defaultAnak = { XS: "", S: "", M: "", L: "", XL: "", XXL: "" };
const defaultDewasa = { S: "", M: "", L: "", XL: "", XXL: "", XXXL: "", "4XL": "", "5XL": "" };

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
    // Jika value kosong, biarkan kosong. Jika ada value, pastikan minimal 0
    if (value === "") {
      setter({ ...current, [key]: "" });
    } else {
      const numValue = parseInt(value, 10);
      setter({ ...current, [key]: isNaN(numValue) ? "" : Math.max(0, numValue) });
    }
  };

  const handleWhatsAppConfirm = (phoneNumber, contactName) => {
    const message =
      `*KONFIRMASI PESANAN KAOS KHATULISTIWA BATCH 1*
` +
      `Halo ${contactName}!
` +
      `Saya ingin mengkonfirmasi pesanan dengan detail sebagai berikut:
` +
      `━━━━━━━━━━━━━━━━━━━━━━━━
` +
      `*DATA PEMESAN*
` +
      `👤 Nama: ${formData.nama}
` +
      `📱 No HP: ${formData.no_hp}
` +
      `📍 Alamat: ${formData.alamat}
` +
      `━━━━━━━━━━━━━━━━━━━━━━━━
` +
      `*TOTAL PEMBAYARAN*
` +
      `💰 ${formatRupiah(totalHarga)}
` +
      `━━━━━━━━━━━━━━━━━━━━━━━━
` +
      `ID Pesanan: ${orderData?.id?.slice(0, 8)}
` +
      `Terima kasih atas perhatiannya! 🙏`;

    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4" data-testid="order-success-screen">
        <Toaster />
        <Card className="max-w-lg w-full shadow-2xl border-2 border-green-200">
          <CardContent className="pt-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <div data-testid="order-success-message">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Pesanan Berhasil! 🎉</h2>
              <p className="text-gray-600 text-base">Terima kasih <span className="font-semibold">{formData.nama}</span>, pesanan Anda telah kami terima dengan baik.</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-200 text-left" data-testid="order-success-summary">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <p className="text-lg font-bold text-gray-800">Ringkasan Pesanan</p>
              </div>
              <div className="space-y-2">
                <p className="text-base text-gray-700"><span className="font-semibold">Total Pembayaran:</span> <span className="text-blue-600 font-bold">{formatRupiah(totalHarga)}</span></p>
                <p className="text-sm text-gray-500">ID Pesanan: <span className="font-mono font-medium">{orderData?.id?.slice(0, 8)}</span></p>
              </div>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-amber-900 mb-3 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Silakan konfirmasi pesanan Anda ke salah satu kontak berikut:
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={() => handleWhatsAppConfirm('6285338538900', 'Mendem')} 
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-5 text-base shadow-md transition-all" 
                  data-testid="whatsapp-confirm-button-mendem"
                >
                  <MessageCircle className="mr-2" size={20} />
                  Konfirmasi ke Mendem (085338538900)
                </Button>
                <Button 
                  onClick={() => handleWhatsAppConfirm('6281519719102', 'Pulu')} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-5 text-base shadow-md transition-all" 
                  data-testid="whatsapp-confirm-button-pulu"
                >
                  <MessageCircle className="mr-2" size={20} />
                  Konfirmasi ke Pulu (081519719102)
                </Button>
              </div>
            </div>

            <Button onClick={resetForm} variant="outline" className="w-full border-2 font-semibold py-5" data-testid="order-again-button">
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
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">Pemesanan Kaos Khatulistiwa Batch 1</h1>
              <p className="text-blue-100 text-base mt-2 font-medium" data-testid="header-description">Silakan lengkapi formulir pemesanan dengan data yang akurat untuk memastikan proses pengerjaan berjalan lancar.</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 mt-6 border border-white/20" data-testid="contact-person-section">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Phone size={20} /> Contact Person
            </h3>
            <div className="space-y-2 text-base" data-testid="contact-person-list">
              <div className="flex items-center gap-2">
                <MessageCircle size={16} />
                <p className="font-medium">085338538900 <span className="text-blue-200">(Mendem)</span></p>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle size={16} />
                <p className="font-medium">081519719102 <span className="text-blue-200">(Pulu)</span></p>
              </div>
            </div>
          </div>
        </div>

        <Card className="mb-6 overflow-hidden shadow-lg" data-testid="mockup-section">
          <CardContent className="p-0">
            <img src="/mockup.png" alt="Mockup Kaos Khatulistiwa" className="w-full h-auto object-cover" data-testid="mockup-image" />
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6" data-testid="order-form">
          <Card className="shadow-lg border-t-4 border-t-blue-600" data-testid="customer-data-section">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center"><User className="text-white" size={22} /></div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-800">Data Pemesan</CardTitle>
                  <CardDescription className="text-base">Pastikan informasi yang Anda masukkan sudah benar</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div>
                <Label htmlFor="nama" className="text-base font-bold text-gray-700 flex items-center gap-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </Label>
                <Input id="nama" value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} placeholder="Contoh: Budi Santoso" required className="mt-2 h-12 text-base border-2 focus:border-blue-500" data-testid="nama-input" />
              </div>
              <div>
                <Label htmlFor="no_hp" className="text-base font-bold text-gray-700 flex items-center gap-1">
                  Nomor HP/WhatsApp <span className="text-red-500">*</span>
                </Label>
                <Input id="no_hp" value={formData.no_hp} onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })} placeholder="Contoh: 081234567890" required className="mt-2 h-12 text-base border-2 focus:border-blue-500" data-testid="no-hp-input" />
              </div>
              <div>
                <Label htmlFor="alamat" className="text-base font-bold text-gray-700 flex items-center gap-1">
                  Alamat Lengkap Pengiriman <span className="text-red-500">*</span>
                </Label>
                <Textarea id="alamat" value={formData.alamat} onChange={(e) => setFormData({ ...formData, alamat: e.target.value })} placeholder="Contoh: Jl. Mawar No. 10, Kelurahan Kebon Jeruk, Jakarta Selatan 12345" required rows={3} className="mt-2 text-base border-2 focus:border-blue-500" data-testid="alamat-input" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2 border-gray-200" data-testid="size-chart-section">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                  <Shirt className="text-white" size={22} />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-800">Panduan Ukuran</CardTitle>
                  <CardDescription className="text-base">Lihat tabel ukuran untuk memilih size yang sesuai</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg overflow-hidden border-2 border-gray-200 hover:border-purple-400 transition-colors">
                  <div className="bg-purple-100 px-4 py-2 border-b">
                    <h3 className="text-sm font-bold text-purple-900 text-center">Size Chart Anak</h3>
                  </div>
                  <img 
                    src="/size-chart-anak.jpeg" 
                    alt="Size Chart Anak" 
                    className="w-full h-auto object-contain" 
                    data-testid="size-chart-anak-image"
                  />
                </div>
                <div className="bg-white rounded-lg overflow-hidden border-2 border-gray-200 hover:border-pink-400 transition-colors">
                  <div className="bg-pink-100 px-4 py-2 border-b">
                    <h3 className="text-sm font-bold text-pink-900 text-center">Size Chart Dewasa</h3>
                  </div>
                  <img 
                    src="/size-chart-dewasa.jpeg" 
                    alt="Size Chart Dewasa" 
                    className="w-full h-auto object-contain" 
                    data-testid="size-chart-dewasa-image"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-t-4 border-t-green-600" data-testid="size-anak-section">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center"><Shirt className="text-white" size={22} /></div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-800">Size Anak</CardTitle>
                  <CardDescription className="text-base font-medium">Rp 50.000 (Lengan Pendek) | Rp 50.000 (Lengan Panjang)</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox id="anak-pendek" checked={enableAnakPendek} onCheckedChange={setEnableAnakPendek} data-testid="anak-pendek-checkbox" />
                  <Label htmlFor="anak-pendek" className="text-base font-bold cursor-pointer text-gray-700">Lengan Pendek</Label>
                </div>
                {enableAnakPendek && (
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3" data-testid="anak-pendek-grid">
                    {Object.keys(sizeAnakPendek).map((size) => (
                      <div key={size}><Label className="text-xs text-center block mb-1 font-bold">{size}</Label><Input type="number" min="0" value={sizeAnakPendek[size]} onChange={(e) => handleSizeChange(setSizeAnakPendek, sizeAnakPendek, size, e.target.value)} placeholder="0" className="text-center h-10" data-testid={`anak-pendek-${size.toLowerCase()}-input`} /></div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox id="anak-panjang" checked={enableAnakPanjang} onCheckedChange={setEnableAnakPanjang} data-testid="anak-panjang-checkbox" />
                  <Label htmlFor="anak-panjang" className="text-base font-bold cursor-pointer text-gray-700">Lengan Panjang</Label>
                </div>
                {enableAnakPanjang && (
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3" data-testid="anak-panjang-grid">
                    {Object.keys(sizeAnakPanjang).map((size) => (
                     <div key={size}><Label className="text-xs text-center block mb-1 font-bold">{size}</Label><Input type="number" min="0" value={sizeAnakPanjang[size]} onChange={(e) => handleSizeChange(setSizeAnakPanjang, sizeAnakPanjang, size, e.target.value)} placeholder="0" className="text-center h-10" data-testid={`anak-panjang-${size.toLowerCase()}-input`} /></div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-t-4 border-t-orange-600" data-testid="size-dewasa-section">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center"><Package className="text-white" size={22} /></div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-800">Size Dewasa</CardTitle>
                  <CardDescription className="text-base font-medium">Rp 100.000 (Lengan Pendek) | Rp 110.000 (Lengan Panjang)</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox id="dewasa-pendek" checked={enableDewasaPendek} onCheckedChange={setEnableDewasaPendek} data-testid="dewasa-pendek-checkbox" />
                  <Label htmlFor="dewasa-pendek" className="text-base font-bold cursor-pointer text-gray-700">Lengan Pendek</Label>
                </div>
                {enableDewasaPendek && (
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-3" data-testid="dewasa-pendek-grid">
                    {Object.keys(sizeDewasaPendek).map((size) => (
                      <div key={size}><Label className="text-xs text-center block mb-1 font-bold">{size}</Label><Input type="number" min="0" value={sizeDewasaPendek[size]} onChange={(e) => handleSizeChange(setSizeDewasaPendek, sizeDewasaPendek, size, e.target.value)} placeholder="0" className="text-center h-10" data-testid={`dewasa-pendek-${size.toLowerCase()}-input`} /></div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox id="dewasa-panjang" checked={enableDewasaPanjang} onCheckedChange={setEnableDewasaPanjang} data-testid="dewasa-panjang-checkbox" />
                  <Label htmlFor="dewasa-panjang" className="text-base font-bold cursor-pointer text-gray-700">Lengan Panjang</Label>
                </div>
                {enableDewasaPanjang && (
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-3" data-testid="dewasa-panjang-grid">
                    {Object.keys(sizeDewasaPanjang).map((size) => (
                      <div key={size}><Label className="text-xs text-center block mb-1 font-bold">{size}</Label><Input type="number" min="0" value={sizeDewasaPanjang[size]} onChange={(e) => handleSizeChange(setSizeDewasaPanjang, sizeDewasaPanjang, size, e.target.value)} placeholder="0" className="text-center h-10" data-testid={`dewasa-panjang-${size.toLowerCase()}-input`} /></div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-4 border-blue-300 bg-gradient-to-br from-white to-blue-50" data-testid="summary-section">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"><DollarSign className="text-white" size={24} /></div>
                <CardTitle className="text-2xl font-bold">Total Pembayaran</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-8 pb-6 text-center">
              <p className="text-base font-semibold text-gray-700 mb-3">Total yang harus dibayar:</p>
              <p className="text-5xl font-extrabold text-blue-600 mb-2" data-testid="total-harga">{formatRupiah(totalHarga)}</p>
              <p className="text-sm text-gray-500 mt-3">Pastikan nominal transfer sesuai dengan total di atas</p>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-2 border-emerald-200" data-testid="payment-info-section">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-green-600 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">Informasi Pembayaran</CardTitle>
                  <CardDescription className="text-emerald-50">Transfer ke salah satu rekening berikut</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-300 hover:shadow-lg transition-shadow" data-testid="bank-bri">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-blue-900 mb-1">Bank BRI</h3>
                      <p className="text-sm text-blue-700 font-medium">Bank Rakyat Indonesia</p>
                    </div>
                  </div>
                  <div className="space-y-2 bg-white/70 rounded-lg p-4 border border-blue-200">
                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-1">Nomor Rekening:</p>
                      <p className="text-lg font-bold text-gray-900 tracking-wide">002101026100533</p>
                    </div>
                    <div className="pt-2 border-t border-blue-200">
                      <p className="text-xs text-gray-600 font-semibold mb-1">Atas Nama:</p>
                      <p className="text-base font-bold text-gray-900">Wendri Muji Atmoko</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-5 border-2 border-indigo-300 hover:shadow-lg transition-shadow" data-testid="bank-bca">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-indigo-900 mb-1">Bank BCA</h3>
                      <p className="text-sm text-indigo-700 font-medium">Bank Central Asia</p>
                    </div>
                  </div>
                  <div className="space-y-2 bg-white/70 rounded-lg p-4 border border-indigo-200">
                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-1">Nomor Rekening:</p>
                      <p className="text-lg font-bold text-gray-900 tracking-wide">1210618089</p>
                    </div>
                    <div className="pt-2 border-t border-indigo-200">
                      <p className="text-xs text-gray-600 font-semibold mb-1">Atas Nama:</p>
                      <p className="text-base font-bold text-gray-900">Wendri Muji Atmoko</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg p-4">
                <p className="text-sm text-amber-900">
                  <span className="font-bold">📌 Catatan:</span> Setelah melakukan transfer, mohon konfirmasi pembayaran melalui WhatsApp untuk proses verifikasi.
                </p>
              </div>
            </CardContent>
          </Card>

          <Button 
            type="submit" 
            disabled={loading || totalHarga === 0} 
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-7 text-xl shadow-2xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
            data-testid="submit-order-button"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Mengirim Pesanan...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Send className="mr-2" size={22} />
                Kirim Pesanan Sekarang
              </span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
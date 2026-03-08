import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Textarea } from './components/ui/textarea';
import { Button } from './components/ui/button';
import { Checkbox } from './components/ui/checkbox';
import { ShoppingCart, User, MapPin, Phone, Shirt, Package, DollarSign, Send, CheckCircle, MessageCircle } from 'lucide-react';
import { toast } from './components/ui/sonner';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function App() {
  const [formData, setFormData] = useState({
    nama: '',
    no_hp: '',
    alamat: '',
  });

  const [sizeAnakPendek, setSizeAnakPendek] = useState({
    XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0
  });

  const [sizeAnakPanjang, setSizeAnakPanjang] = useState({
    XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0
  });

  const [sizeDewasaPendek, setSizeDewasaPendek] = useState({
    S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0, '4XL': 0, '5XL': 0
  });

  const [sizeDewasaPanjang, setSizeDewasaPanjang] = useState({
    S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0, '4XL': 0, '5XL': 0
  });

  const [enableAnakPendek, setEnableAnakPendek] = useState(false);
  const [enableAnakPanjang, setEnableAnakPanjang] = useState(false);
  const [enableDewasaPendek, setEnableDewasaPendek] = useState(false);
  const [enableDewasaPanjang, setEnableDewasaPanjang] = useState(false);

  const [totalHarga, setTotalHarga] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderData, setOrderData] = useState(null);

  // Harga constants
  const HARGA_ANAK_PENDEK = 50000;
  const HARGA_ANAK_PANJANG = 60000;
  const HARGA_DEWASA_PENDEK = 100000;
  const HARGA_DEWASA_PANJANG = 110000;

  // Calculate total harga
  useEffect(() => {
    let total = 0;

    if (enableAnakPendek) {
      const totalAnakPendek = Object.values(sizeAnakPendek).reduce((sum, val) => sum + val, 0);
      total += totalAnakPendek * HARGA_ANAK_PENDEK;
    }

    if (enableAnakPanjang) {
      const totalAnakPanjang = Object.values(sizeAnakPanjang).reduce((sum, val) => sum + val, 0);
      total += totalAnakPanjang * HARGA_ANAK_PANJANG;
    }

    if (enableDewasaPendek) {
      const totalDewasaPendek = Object.values(sizeDewasaPendek).reduce((sum, val) => sum + val, 0);
      total += totalDewasaPendek * HARGA_DEWASA_PENDEK;
    }

    if (enableDewasaPanjang) {
      const totalDewasaPanjang = Object.values(sizeDewasaPanjang).reduce((sum, val) => sum + val, 0);
      total += totalDewasaPanjang * HARGA_DEWASA_PANJANG;
    }

    setTotalHarga(total);
  }, [sizeAnakPendek, sizeAnakPanjang, sizeDewasaPendek, sizeDewasaPanjang, enableAnakPendek, enableAnakPanjang, enableDewasaPendek, enableDewasaPanjang]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nama || !formData.no_hp || !formData.alamat) {
      toast.error('Mohon lengkapi semua data!');
      return;
    }

    if (totalHarga === 0) {
      toast.error('Mohon pilih minimal 1 kaos!');
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        nama: formData.nama,
        no_hp: formData.no_hp,
        alamat: formData.alamat,
        size_anak_pendek: enableAnakPendek ? sizeAnakPendek : {},
        size_anak_panjang: enableAnakPanjang ? sizeAnakPanjang : {},
        size_dewasa_pendek: enableDewasaPendek ? sizeDewasaPendek : {},
        size_dewasa_panjang: enableDewasaPanjang ? sizeDewasaPanjang : {},
        total_harga: totalHarga
      };

      const response = await axios.post(`${BACKEND_URL}/api/orders`, orderPayload);
      
      setOrderData(response.data);
      setOrderSuccess(true);
      toast.success('Pesanan berhasil dikirim!');
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('Gagal mengirim pesanan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppConfirm = () => {
    const message = `Halo! Saya ${formData.nama} ingin konfirmasi pesanan Kaos Khatulistiwa Batch 1:nn` +
      `Nama: ${formData.nama}n` +
      `No HP: ${formData.no_hp}n` +
      `Alamat: ${formData.alamat}nn` +
      `Total: Rp ${totalHarga.toLocaleString('id-ID')}nn` +
      `Terima kasih!`;
    
    const waUrl = `https://wa.me/6285338538900?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-2xl border-2 border-green-200">
          <CardContent className="pt-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Pesanan Berhasil!</h2>
              <p className="text-gray-600">Terima kasih {formData.nama}, pesanan Anda telah kami terima.</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-left">
              <p className="text-sm text-gray-700 mb-1"><span className="font-semibold">Total:</span> {formatRupiah(totalHarga)}</p>
              <p className="text-xs text-gray-500 mt-2">ID Pesanan: {orderData?.id?.substring(0, 8)}</p>
            </div>
            <Button 
              onClick={handleWhatsAppConfirm} 
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-base"
              data-testid="whatsapp-confirm-button"
            >
              <MessageCircle className="mr-2" size={20} />
              Konfirmasi via WhatsApp
            </Button>
            <Button 
              onClick={() => {
                setOrderSuccess(false);
                setFormData({ nama: '', no_hp: '', alamat: '' });
                setSizeAnakPendek({ XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 });
                setSizeAnakPanjang({ XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 });
                setSizeDewasaPendek({ S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0, '4XL': 0, '5XL': 0 });
                setSizeDewasaPanjang({ S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0, '4XL': 0, '5XL': 0 });
                setEnableAnakPendek(false);
                setEnableAnakPanjang(false);
                setEnableDewasaPendek(false);
                setEnableDewasaPanjang(false);
              }} 
              variant="outline" 
              className="w-full"
              data-testid="order-again-button"
            >
              Pesan Lagi
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl shadow-xl p-8 mb-6 text-white" data-testid="header-section">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Pemesanan Kaos "Khatulistiwa" Batch 1</h1>
              <p className="text-blue-100 text-sm mt-1">Mohon isi data dengan benar agar proses pengerjaan bisa lancar!!</p>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mt-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Phone size={18} />
              Contact Person
            </h3>
            <div className="space-y-1 text-sm">
              <p>085338538900 (Mendem)</p>
              <p>081519719102 (Pulu)</p>
            </div>
          </div>
        </div>

        {/* Mockup Image */}
        <Card className="mb-6 overflow-hidden shadow-lg" data-testid="mockup-section">
          <CardContent className="p-0">
            <img 
              src="/mockup-kaos.png" 
              alt="Mockup Kaos Khatulistiwa" 
              className="w-full h-auto object-cover"
            />
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Data Pemesan */}
          <Card className="shadow-lg" data-testid="customer-data-section">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <User className="text-white" size={20} />
                </div>
                <div>
                  <CardTitle className="text-xl">Data Pemesan</CardTitle>
                  <CardDescription>Informasi lengkap pemesan</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label htmlFor="nama" className="text-base font-semibold">Nama <span className="text-red-500">*</span></Label>
                <Input
                  id="nama"
                  data-testid="nama-input"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Budi Santoso"
                  required
                  className="mt-2 h-12 text-base"
                />
              </div>
              <div>
                <Label htmlFor="no_hp" className="text-base font-semibold">No HP/WhatsApp <span className="text-red-500">*</span></Label>
                <Input
                  id="no_hp"
                  data-testid="no-hp-input"
                  value={formData.no_hp}
                  onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                  placeholder="Contoh: 081234567890"
                  required
                  className="mt-2 h-12 text-base"
                />
              </div>
              <div>
                <Label htmlFor="alamat" className="text-base font-semibold">Alamat Lengkap <span className="text-red-500">*</span></Label>
                <Textarea
                  id="alamat"
                  data-testid="alamat-input"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  placeholder="Contoh: Jl. Mawar No. 10, Jakarta Selatan"
                  required
                  rows={3}
                  className="mt-2 text-base"
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Pemesanan - Size Anak */}
          <Card className="shadow-lg" data-testid="size-anak-section">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <Shirt className="text-white" size={20} />
                </div>
                <div>
                  <CardTitle className="text-xl">Size Anak</CardTitle>
                  <CardDescription>Kaos anak - Rp 50.000 (pendek) | Rp 60.000 (panjang)</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Lengan Pendek */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox
                    id="anak-pendek"
                    data-testid="anak-pendek-checkbox"
                    checked={enableAnakPendek}
                    onCheckedChange={setEnableAnakPendek}
                  />
                  <Label htmlFor="anak-pendek" className="text-base font-semibold cursor-pointer">
                    Lengan Pendek
                  </Label>
                </div>
                {enableAnakPendek && (
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {Object.keys(sizeAnakPendek).map(size => (
                      <div key={size}>
                        <Label className="text-xs text-center block mb-1 font-bold">{size}</Label>
                        <Input
                          type="number"
                          min="0"
                          data-testid={`anak-pendek-${size.toLowerCase()}-input`}
                          value={sizeAnakPendek[size]}
                          onChange={(e) => setSizeAnakPendek({ ...sizeAnakPendek, [size]: parseInt(e.target.value) || 0 })}
                          className="text-center h-10"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Lengan Panjang */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox
                    id="anak-panjang"
                    data-testid="anak-panjang-checkbox"
                    checked={enableAnakPanjang}
                    onCheckedChange={setEnableAnakPanjang}
                  />
                  <Label htmlFor="anak-panjang" className="text-base font-semibold cursor-pointer">
                    Lengan Panjang
                  </Label>
                </div>
                {enableAnakPanjang && (
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {Object.keys(sizeAnakPanjang).map(size => (
                      <div key={size}>
                        <Label className="text-xs text-center block mb-1 font-bold">{size}</Label>
                        <Input
                          type="number"
                          min="0"
                          data-testid={`anak-panjang-${size.toLowerCase()}-input`}
                          value={sizeAnakPanjang[size]}
                          onChange={(e) => setSizeAnakPanjang({ ...sizeAnakPanjang, [size]: parseInt(e.target.value) || 0 })}
                          className="text-center h-10"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Data Pemesanan - Size Dewasa */}
          <Card className="shadow-lg" data-testid="size-dewasa-section">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                  <Package className="text-white" size={20} />
                </div>
                <div>
                  <CardTitle className="text-xl">Size Dewasa</CardTitle>
                  <CardDescription>Kaos dewasa - Rp 100.000 (pendek) | Rp 110.000 (panjang)</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Lengan Pendek */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox
                    id="dewasa-pendek"
                    data-testid="dewasa-pendek-checkbox"
                    checked={enableDewasaPendek}
                    onCheckedChange={setEnableDewasaPendek}
                  />
                  <Label htmlFor="dewasa-pendek" className="text-base font-semibold cursor-pointer">
                    Lengan Pendek
                  </Label>
                </div>
                {enableDewasaPendek && (
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                    {Object.keys(sizeDewasaPendek).map(size => (
                      <div key={size}>
                        <Label className="text-xs text-center block mb-1 font-bold">{size}</Label>
                        <Input
                          type="number"
                          min="0"
                          data-testid={`dewasa-pendek-${size.toLowerCase()}-input`}
                          value={sizeDewasaPendek[size]}
                          onChange={(e) => setSizeDewasaPendek({ ...sizeDewasaPendek, [size]: parseInt(e.target.value) || 0 })}
                          className="text-center h-10"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Lengan Panjang */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox
                    id="dewasa-panjang"
                    data-testid="dewasa-panjang-checkbox"
                    checked={enableDewasaPanjang}
                    onCheckedChange={setEnableDewasaPanjang}
                  />
                  <Label htmlFor="dewasa-panjang" className="text-base font-semibold cursor-pointer">
                    Lengan Panjang
                  </Label>
                </div>
                {enableDewasaPanjang && (
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                    {Object.keys(sizeDewasaPanjang).map(size => (
                      <div key={size}>
                        <Label className="text-xs text-center block mb-1 font-bold">{size}</Label>
                        <Input
                          type="number"
                          min="0"
                          data-testid={`dewasa-panjang-${size.toLowerCase()}-input`}
                          value={sizeDewasaPanjang[size]}
                          onChange={(e) => setSizeDewasaPanjang({ ...sizeDewasaPanjang, [size]: parseInt(e.target.value) || 0 })}
                          className="text-center h-10"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="shadow-xl border-2 border-blue-200" data-testid="summary-section">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <DollarSign className="text-white" size={20} />
                </div>
                <CardTitle className="text-xl">Total Pembayaran</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Total yang harus dibayar:</p>
                <p className="text-4xl font-bold text-blue-600" data-testid="total-harga">{formatRupiah(totalHarga)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={loading || totalHarga === 0}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-6 text-lg shadow-lg"
            data-testid="submit-order-button"
          >
            {loading ? (
              'Mengirim...'
            ) : (
              <>
                <Send className="mr-2" size={20} />
                Kirim Pesanan
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default App;

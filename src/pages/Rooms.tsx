import { useState, useRef } from "react";
import { AppLayout } from "@/components/ui/Layout";
import { products, recentConsumptions, type Room } from "@/lib/data";
import { useRoomsAndGuests } from "@/hooks/use-cloudbeds";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BedDouble, Plus, Receipt, Download, Share2, Minus, Trash2, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SignatureCanvas from 'react-signature-canvas';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export default function Rooms() {
  const { toast } = useToast();
  const { data: rooms = [], isLoading, error, refetch } = useRoomsAndGuests();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [roomForReceipt, setRoomForReceipt] = useState<Room | null>(null);
  const [localConsumptions, setLocalConsumptions] = useState(recentConsumptions);
  const [signatures, setSignatures] = useState<Record<string, string>>({});
  const sigCanvas = useRef<SignatureCanvas>(null);

  const handleAddConsumption = (closeDialog: boolean) => {
    if (!selectedProduct || !quantity || parseInt(quantity) < 1 || !selectedRoom) {
      toast({
        title: "Error",
        description: "Por favor selecciona un producto y una cantidad válida.",
        variant: "destructive"
      });
      return;
    }

    const newConsumption = {
      id: `c${Date.now()}`,
      roomId: selectedRoom.id,
      productId: selectedProduct,
      quantity: parseInt(quantity),
      date: new Date().toISOString()
    };

    recentConsumptions.push(newConsumption);
    setLocalConsumptions([...recentConsumptions]);

    toast({
      title: "Consumo registrado",
      description: `Se registró el consumo en la habitación ${selectedRoom.number}.`,
    });

    if (closeDialog) {
      setIsDialogOpen(false);
    }
    setSelectedProduct("");
    setQuantity("1");
  };

  const updateQuantity = (consumptionId: string, delta: number) => {
    const consumption = recentConsumptions.find(c => c.id === consumptionId);
    if (consumption) {
      consumption.quantity += delta;
      if (consumption.quantity <= 0) {
        const index = recentConsumptions.findIndex(c => c.id === consumptionId);
        if (index !== -1) recentConsumptions.splice(index, 1);
      }
      setLocalConsumptions([...recentConsumptions]);
    }
  };

  const removeConsumption = (consumptionId: string) => {
    const index = recentConsumptions.findIndex(c => c.id === consumptionId);
    if (index !== -1) {
      recentConsumptions.splice(index, 1);
      setLocalConsumptions([...recentConsumptions]);
    }
  };

  const openDialog = (room: Room) => {
    setSelectedRoom(room);
    setIsDialogOpen(true);
  };

  const selectedProductData = products.find(p => p.id === selectedProduct);
  const quantityNum = Math.max(1, parseInt(quantity) || 1);

  const openReceipt = (room: Room) => {
    setRoomForReceipt(room);
    setIsReceiptOpen(true);
  };

  const generatePDF = async () => {
    const element = document.getElementById('ticket-content');
    if (!element) return null;

    const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    return pdf;
  };

  const handleDownload = async () => {
    if (!roomForReceipt) return;
    const pdf = await generatePDF();
    if (pdf) {
      pdf.save(`ticket_habitacion_${roomForReceipt.number}.pdf`);
    }
  };

  const handleShare = async () => {
    if (!roomForReceipt) return;
    const pdf = await generatePDF();
    if (!pdf) return;

    const pdfBlob = pdf.output('blob');
    const file = new File([pdfBlob], `ticket_habitacion_${roomForReceipt.number}.pdf`, { type: 'application/pdf' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: `Ticket Habitación ${roomForReceipt.number}`,
          files: [file]
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      toast({
        title: "Compartir no soportado",
        description: "Tu navegador no soporta compartir archivos. El PDF se descargará en su lugar.",
      });
      pdf.save(`ticket_habitacion_${roomForReceipt.number}.pdf`);
    }
  };

  // --- Loading state ---
  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-heading font-bold tracking-tight">Habitaciones</h2>
            <p className="text-muted-foreground">Gestiona el consumo por habitación.</p>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm">Cargando habitaciones desde CloudBeds...</span>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // --- Error state ---
  if (error) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-heading font-bold tracking-tight">Habitaciones</h2>
            <p className="text-muted-foreground">Gestiona el consumo por habitación.</p>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3 text-center max-w-md">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <span className="text-sm text-destructive font-medium">Error al cargar habitaciones</span>
              <span className="text-xs text-muted-foreground">{error.message}</span>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-heading font-bold tracking-tight">Habitaciones</h2>
            <p className="text-muted-foreground">Gestiona el consumo por habitación.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Actualizar
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => {
            const roomConsumptions = localConsumptions.filter(c => c.roomId === room.id);
            const totalSpent = roomConsumptions.reduce((acc, curr) => {
              const p = products.find(p => p.id === curr.productId);
              return acc + (p ? p.price * curr.quantity : 0);
            }, 0);

            const statusBorder = {
              occupied: "border-l-4 border-l-green-500",
              vacant: "border-l-4 border-l-muted-foreground/30",
              cleaning: "border-l-4 border-l-amber-500",
            }[room.status];

            const statusBadgeClass = {
              occupied: "bg-green-100 text-green-800 hover:bg-green-100 border-green-200",
              vacant: "bg-background text-muted-foreground",
              cleaning: "bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200",
            }[room.status];

            const statusDot = {
              occupied: "bg-green-500",
              vacant: "bg-muted-foreground/40",
              cleaning: "bg-amber-500",
            }[room.status];

            return (
              <Card key={room.id} className={`flex flex-col transition-shadow duration-200 hover:shadow-md cursor-default ${statusBorder}`}>
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg min-w-0">
                      <BedDouble className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
                      <span className="truncate">Hab. {room.number}</span>
                    </CardTitle>
                    <Badge variant="outline" className={`shrink-0 text-xs ${statusBadgeClass}`}>
                      <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${statusDot}`} />
                      {room.status === 'occupied' ? 'Ocupada' : room.status === 'vacant' ? 'Libre' : 'Limpieza'}
                    </Badge>
                  </div>
                  <CardDescription className="truncate">{room.guestName || 'Sin huésped'}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-4 flex flex-col justify-end">
                  <div className="flex justify-between items-baseline text-sm mb-4 pt-2 border-t">
                    <span className="text-muted-foreground">Consumo</span>
                    <span className="text-lg font-bold tracking-tight">{totalSpent > 0 ? `$${totalSpent.toFixed(2)}` : '—'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={roomConsumptions.length === 0}
                      onClick={() => openReceipt(room)}
                      className="w-full h-9"
                    >
                      <Receipt className="mr-1.5 h-3.5 w-3.5" />
                      Ticket
                    </Button>
                    <Button
                      className="w-full h-9"
                      size="sm"
                      variant="secondary"
                      disabled={room.status !== 'occupied'}
                      onClick={() => openDialog(room)}
                    >
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      Añadir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="w-[95vw] max-w-[425px] p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>Registrar Consumo</DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                <BedDouble className="h-3.5 w-3.5 shrink-0" />
                <span>
                  Hab. {selectedRoom?.number}
                  {selectedRoom?.guestName && (
                    <span className="text-muted-foreground"> — {selectedRoom.guestName}</span>
                  )}
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-2">
              {/* Product Select */}
              <div className="grid gap-2">
                <Label htmlFor="product">Producto</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger id="product">
                    <SelectValue placeholder="Selecciona un producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} — ${p.price.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity Stepper */}
              <div className="grid gap-2">
                <Label>Cantidad</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 shrink-0"
                    onClick={() => setQuantity(String(Math.max(1, parseInt(quantity) - 1 || 1)))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 text-center">
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="text-center h-11 w-full text-lg font-medium"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 shrink-0"
                    onClick={() => setQuantity(String((parseInt(quantity) || 1) + 1))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Price Preview */}
              {selectedProductData && (
                <div className="rounded-md bg-muted/50 border px-3 py-2.5 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground truncate mr-2">{selectedProductData.name}</span>
                    <span className="shrink-0">${selectedProductData.price.toFixed(2)} c/u</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium border-t pt-1.5">
                    <span>Subtotal ({quantityNum}x)</span>
                    <span className="font-bold">${(selectedProductData.price * quantityNum).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex-col gap-2 mt-2 sm:flex-row sm:justify-between">
              <Button type="button" variant="outline" className="w-full sm:w-auto order-3 sm:order-1" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
                <Button type="button" variant="secondary" className="flex-1 sm:flex-none" onClick={() => handleAddConsumption(false)}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Añadir otro
                </Button>
                <Button type="button" className="flex-1 sm:flex-none" onClick={() => handleAddConsumption(true)}>
                  Añadir y cerrar
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
          <DialogContent className="w-[95vw] max-w-[550px] max-h-[90vh] flex flex-col p-0 gap-0">
            <div id="ticket-content" className="flex-1 overflow-y-auto p-4 sm:p-6 bg-background">
              {/* Header */}
              <div className="flex flex-col items-center mb-5 border-b pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <img
                    src="https://assets.cdn.filesafe.space/IoceQKmmLCUC2EoTagyi/media/67f01a2c905d24d0f68edbd6.png"
                    alt="Grand Gardenia Logo"
                    crossOrigin="anonymous"
                    className="h-8 sm:h-10 w-auto object-contain"
                  />
                  <span className="text-lg sm:text-2xl font-bold font-heading tracking-tight">Grand Gardenia</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground text-center">Ticket de Consumo de Frigobar</p>
              </div>

              {/* Room / Date / Folio */}
              <div className="mb-4">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-sm">
                  <div>
                    <div className="font-medium text-foreground">
                      Habitación {roomForReceipt?.number} {roomForReceipt?.guestName ? `- ${roomForReceipt.guestName}` : ''}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })} {new Date().toLocaleTimeString('es-MX')}
                    </div>
                  </div>
                  <div className="font-medium text-foreground sm:text-right text-xs sm:text-sm">
                    <span className="text-muted-foreground sm:hidden">Folio: </span>
                    <span>{roomForReceipt ? String(rooms.findIndex(r => r.id === roomForReceipt.id) + 1).padStart(4, '0') : ''}</span>
                  </div>
                </div>
              </div>

              {/* Product Table */}
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="rounded-md border min-w-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Producto</TableHead>
                        <TableHead className="text-center text-xs w-[90px]">Cant.</TableHead>
                        <TableHead className="text-right text-xs hidden sm:table-cell">Precio</TableHead>
                        <TableHead className="text-right text-xs">Subtotal</TableHead>
                        <TableHead data-html2canvas-ignore="true" className="w-[40px] sm:w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roomForReceipt && localConsumptions.filter(c => c.roomId === roomForReceipt.id).map(consumption => {
                        const product = products.find(p => p.id === consumption.productId);
                        if (!product) return null;
                        return (
                          <TableRow key={consumption.id}>
                            <TableCell className="font-medium text-xs sm:text-sm">{product.name}</TableCell>
                            <TableCell className="text-center text-xs sm:text-sm">
                              <div className="flex items-center justify-center gap-1 sm:gap-2">
                                <Button data-html2canvas-ignore="true" variant="outline" size="icon" className="h-6 w-6 shrink-0" onClick={() => updateQuantity(consumption.id, -1)}>
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-4 text-center">{consumption.quantity}</span>
                                <Button data-html2canvas-ignore="true" variant="outline" size="icon" className="h-6 w-6 shrink-0" onClick={() => updateQuantity(consumption.id, 1)}>
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-xs sm:text-sm hidden sm:table-cell">${product.price.toFixed(2)}</TableCell>
                            <TableCell className="text-right text-xs sm:text-sm font-medium">${(product.price * consumption.quantity).toFixed(2)}</TableCell>
                            <TableCell data-html2canvas-ignore="true">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeConsumption(consumption.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Total */}
              <div className="mt-4 rounded-md bg-muted/60 px-3 py-2.5 flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Total</span>
                <span className="text-xl font-bold tracking-tight">
                  ${roomForReceipt && localConsumptions
                    .filter(c => c.roomId === roomForReceipt.id)
                    .reduce((acc, curr) => {
                      const p = products.find(p => p.id === curr.productId);
                      return acc + (p ? p.price * curr.quantity : 0);
                    }, 0).toFixed(2)}
                </span>
              </div>

              {/* Signature */}
              <div className="mt-5 border-t pt-4">
                <h4 className="text-xs sm:text-sm font-medium mb-2 text-muted-foreground">Firma de conformidad</h4>
                {roomForReceipt && signatures[roomForReceipt.id] ? (
                  <div className="flex flex-col items-center">
                    <img src={signatures[roomForReceipt.id]} alt="Firma" className="border rounded bg-white max-h-28 object-contain" />
                    <Button data-html2canvas-ignore="true" variant="ghost" size="sm" className="mt-2 text-xs" onClick={() => {
                      const newSigs = {...signatures};
                      delete newSigs[roomForReceipt.id];
                      setSignatures(newSigs);
                    }}>
                      Limpiar firma
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="border rounded bg-white w-full">
                      <SignatureCanvas
                        ref={sigCanvas}
                        penColor="black"
                        canvasProps={{ className: 'w-full h-28 sm:h-32 rounded' }}
                      />
                    </div>
                    <div data-html2canvas-ignore="true" className="flex gap-2 mt-2 w-full">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => sigCanvas.current?.clear()}>
                        Borrar
                      </Button>
                      <Button size="sm" className="flex-1" onClick={() => {
                        if (sigCanvas.current && !sigCanvas.current.isEmpty() && roomForReceipt) {
                          setSignatures({
                            ...signatures,
                            [roomForReceipt.id]: sigCanvas.current.getCanvas().toDataURL('image/png')
                          });
                        }
                      }}>
                        Guardar Firma
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer branding */}
              <div className="mt-6 text-center text-xs text-muted-foreground">
                <p>Gracias por su preferencia</p>
                <p className="font-medium mt-0.5">www.grandgardenia.com.mx</p>
              </div>
            </div>

            {/* Sticky action footer */}
            <DialogFooter className="border-t bg-background p-3 sm:p-4 flex-col sm:flex-row sm:justify-between gap-2 shrink-0">
              <div className="flex gap-2 w-full sm:w-auto">
                <Button type="button" variant="outline" className="flex-1 sm:flex-none" onClick={handleDownload}>
                  <Download className="mr-1.5 h-4 w-4" />
                  Descargar
                </Button>
                <Button type="button" variant="outline" className="flex-1 sm:flex-none" onClick={handleShare}>
                  <Share2 className="mr-1.5 h-4 w-4" />
                  Compartir
                </Button>
              </div>
              <Button type="button" className="w-full sm:w-auto" onClick={() => setIsReceiptOpen(false)}>Cerrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

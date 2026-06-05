import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useRef } from "react";
import { AppLayout } from "@/components/ui/Layout";
import { products, recentConsumptions, rooms } from "@/lib/data";
import {
  Package,
  BedDouble,
  AlertTriangle,
  TrendingUp,
  Download,
  Share2,
  Plus,
  Minus,
  Trash2,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import SignatureCanvas from "react-signature-canvas";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export default function Index() {
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year">("week");
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [roomForReceipt, setRoomForReceipt] = useState<any>(null);
  const [signatures, setSignatures] = useState<Record<string, string>>({});
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const sigCanvas = useRef<SignatureCanvas>(null);
  const { toast } = useToast();

  const updateQuantity = (consumptionId: string, delta: number) => {
    const consumption = recentConsumptions.find((c) => c.id === consumptionId);
    if (consumption) {
      consumption.quantity += delta;
      if (consumption.quantity <= 0) {
        const index = recentConsumptions.findIndex(
          (c) => c.id === consumptionId,
        );
        if (index !== -1) recentConsumptions.splice(index, 1);
      }
      setUpdateTrigger((prev) => prev + 1);
    }
  };

  const removeConsumption = (consumptionId: string) => {
    const index = recentConsumptions.findIndex((c) => c.id === consumptionId);
    if (index !== -1) {
      recentConsumptions.splice(index, 1);
      setUpdateTrigger((prev) => prev + 1);
    }
  };

  const generatePDF = async (room: any) => {
    const element = document.getElementById("ticket-content");
    if (!element) return null;

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
    });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    return pdf;
  };

  const handleDownload = async (room: any) => {
    const pdf = await generatePDF(room);
    if (pdf) {
      pdf.save(`ticket-habitacion-${room.number}.pdf`);
    }
  };

  const handleShare = async (room: any) => {
    const pdf = await generatePDF(room);
    if (!pdf) return;

    const pdfBlob = pdf.output("blob");
    const file = new File([pdfBlob], `ticket-habitacion-${room.number}.pdf`, {
      type: "application/pdf",
    });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: `Ticket Habitación ${room.number}`,
          files: [file],
        });
      } catch (error) {
        console.log("Error compartiendo", error);
      }
    } else {
      toast({
        title: "Compartir no soportado",
        description:
          "Tu navegador no soporta compartir archivos. El PDF se descargará en su lugar.",
      });
      pdf.save(`ticket-habitacion-${room.number}.pdf`);
    }
  };

  const lowStockProducts = products.filter((p) => p.stock < 20);
  const occupiedRooms = rooms.filter((r) => r.status === "occupied").length;

  const totalRevenue = recentConsumptions.reduce((acc, curr) => {
    const product = products.find((p) => p.id === curr.productId);
    return acc + (product ? product.price * curr.quantity : 0);
  }, 0);

  const chartData = {
    week: [
      { name: "Lun", total: 1200 },
      { name: "Mar", total: 900 },
      { name: "Mié", total: 1600 },
      { name: "Jue", total: 1400 },
      { name: "Vie", total: 2100 },
      { name: "Sáb", total: 2800 },
      { name: "Dom", total: 2400 },
    ],
    month: [
      { name: "Sem 1", total: 8500 },
      { name: "Sem 2", total: 9200 },
      { name: "Sem 3", total: 7800 },
      { name: "Sem 4", total: 10500 },
    ],
    year: [
      { name: "Ene", total: 35000 },
      { name: "Feb", total: 32000 },
      { name: "Mar", total: 41000 },
      { name: "Abr", total: 38000 },
      { name: "May", total: 45000 },
      { name: "Jun", total: 42000 },
      { name: "Jul", total: 50000 },
      { name: "Ago", total: 48000 },
      { name: "Sep", total: 39000 },
      { name: "Oct", total: 43000 },
      { name: "Nov", total: 47000 },
      { name: "Dic", total: 52000 },
    ],
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-heading font-bold tracking-tight">
            Dashboard
          </h2>
          <p className="text-muted-foreground">
            Resumen de consumo y estado del frigobar.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ingresos (Hoy)
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalRevenue.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Habitaciones Ocupadas
              </CardTitle>
              <BedDouble className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {occupiedRooms} / {rooms.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Productos
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {lowStockProducts.length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="col-span-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Tendencia de Ingresos</CardTitle>
            <Select
              value={timeframe}
              onValueChange={(value: any) => setTimeframe(value)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Seleccionar periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mes</SelectItem>
                <SelectItem value="year">Este año</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData[timeframe]}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                    itemStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-1 md:col-span-2 lg:col-span-4">
            <CardHeader>
              <CardTitle>Consumos Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentConsumptions.map((consumption) => {
                  const product = products.find(
                    (p) => p.id === consumption.productId,
                  );
                  const room = rooms.find((r) => r.id === consumption.roomId);

                  return (
                    <div
                      key={consumption.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0 cursor-pointer hover:bg-muted/50 p-2 -mx-2 rounded-md transition-colors"
                      onClick={() => {
                        setRoomForReceipt(room);
                        setIsReceiptOpen(true);
                      }}
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Habitación {room?.number}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {consumption.quantity}x {product?.name}
                        </p>
                      </div>
                      <div className="font-medium">
                        $
                        {((product?.price || 0) * consumption.quantity).toFixed(
                          2,
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Alertas de Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockProducts.length > 0 ? (
                  lowStockProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {product.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Quedan {product.stock} unidades
                        </p>
                      </div>
                      <div className="text-sm font-medium text-destructive">
                        Reabastecer
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Todo el stock está en niveles óptimos.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto p-0 sm:p-6">
          <div id="ticket-content" className="p-4 sm:p-6 bg-background">
            <div className="flex flex-col items-center mb-6 border-b pb-4">
              <div className="flex items-center gap-2 mb-1">
                <img
                  src="https://assets.cdn.filesafe.space/IoceQKmmLCUC2EoTagyi/media/67f01a2c905d24d0f68edbd6.png"
                  alt="Grand Gardenia Logo"
                  crossOrigin="anonymous"
                  className="h-10 w-auto object-contain"
                />
                <span className="text-2xl font-bold font-heading tracking-tight">
                  Grand Gardenia
                </span>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Ticket de Consumo de Frigobar
              </p>
            </div>

            <div className="flex justify-between items-center mb-4 text-sm">
              <div>
                <div className="font-medium text-foreground">
                  Habitación {roomForReceipt?.number}
                </div>
                <div className="text-muted-foreground">
                  {new Date().toLocaleDateString("es-MX", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  {new Date().toLocaleTimeString("es-MX")}
                </div>
              </div>
              <div className="font-medium text-foreground text-right">
                Folio:{" "}
                {roomForReceipt
                  ? String(
                      rooms.findIndex((r) => r.id === roomForReceipt.id) + 1,
                    ).padStart(4, "0")
                  : ""}
              </div>
            </div>
            <div className="py-4 overflow-x-auto">
              <div className="rounded-md border min-w-[450px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-center">Cant.</TableHead>
                      <TableHead className="text-right">Precio</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      <TableHead
                        data-html2canvas-ignore="true"
                        className="w-[80px]"
                      ></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roomForReceipt &&
                      recentConsumptions
                        .filter((c) => c.roomId === roomForReceipt.id)
                        .map((consumption) => {
                          const product = products.find(
                            (p) => p.id === consumption.productId,
                          );
                          return (
                            <TableRow key={consumption.id}>
                              <TableCell className="font-medium">
                                {product?.name}
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <Button
                                    data-html2canvas-ignore="true"
                                    variant="outline"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() =>
                                      updateQuantity(consumption.id, -1)
                                    }
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-4 text-center">
                                    {consumption.quantity}
                                  </span>
                                  <Button
                                    data-html2canvas-ignore="true"
                                    variant="outline"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() =>
                                      updateQuantity(consumption.id, 1)
                                    }
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                ${product?.price.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right">
                                $
                                {(
                                  (product?.price || 0) * consumption.quantity
                                ).toFixed(2)}
                              </TableCell>
                              <TableCell data-html2canvas-ignore="true">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  onClick={() =>
                                    removeConsumption(consumption.id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                  </TableBody>
                </Table>
              </div>
            </div>
            <div className="flex justify-end mt-4 text-lg font-bold">
              Total:{" "}
              <span className="ml-2">
                $
                {roomForReceipt &&
                  recentConsumptions
                    .filter((c) => c.roomId === roomForReceipt.id)
                    .reduce((acc, curr) => {
                      const product = products.find(
                        (p) => p.id === curr.productId,
                      );
                      return (
                        acc + (product ? product.price * curr.quantity : 0)
                      );
                    }, 0)
                    .toFixed(2)}
              </span>
            </div>

            <div className="mt-6 border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Firma de conformidad</h4>
              {roomForReceipt && signatures[roomForReceipt.id] ? (
                <div className="flex flex-col items-center">
                  <img
                    src={signatures[roomForReceipt.id]}
                    alt="Firma"
                    className="border rounded bg-white max-h-32 object-contain"
                  />
                  <Button
                    data-html2canvas-ignore="true"
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-xs"
                    onClick={() => {
                      const newSigs = { ...signatures };
                      delete newSigs[roomForReceipt.id];
                      setSignatures(newSigs);
                    }}
                  >
                    Limpiar firma
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="border rounded bg-white w-full">
                    <SignatureCanvas
                      ref={sigCanvas}
                      penColor="black"
                      canvasProps={{ className: "w-full h-32 rounded" }}
                    />
                  </div>
                  <div
                    data-html2canvas-ignore="true"
                    className="flex gap-2 mt-2"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sigCanvas.current?.clear()}
                    >
                      Borrar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (
                          sigCanvas.current &&
                          !sigCanvas.current.isEmpty() &&
                          roomForReceipt
                        ) {
                          setSignatures({
                            ...signatures,
                            [roomForReceipt.id]: sigCanvas.current
                              .getCanvas()
                              .toDataURL("image/png"),
                          });
                        }
                      }}
                    >
                      Guardar Firma
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 text-center text-sm text-muted-foreground">
              <p>Gracias por su preferencia</p>
              <p className="font-medium mt-1">www.grandgardenia.com.mx</p>
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => handleDownload(roomForReceipt)}
            >
              <Download className="mr-2 h-4 w-4" />
              Descargar
            </Button>
            <Button onClick={() => handleShare(roomForReceipt)}>
              <Share2 className="mr-2 h-4 w-4" />
              Compartir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

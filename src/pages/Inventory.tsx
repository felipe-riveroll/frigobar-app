import { useState } from "react";
import { AppLayout } from "@/components/ui/Layout";
import { products, type Product } from "@/lib/data";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  Pencil,
  Package,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

const categoryConfig: Record<
  Product["category"],
  { label: string; color: string }
> = {
  bebidas: { label: "Bebidas", color: "bg-blue-500" },
  snacks: { label: "Snacks", color: "bg-orange-500" },
  otros: { label: "Otros", color: "bg-purple-500" },
};

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [inventory, setInventory] = useState<Product[]>(products);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newStock, setNewStock] = useState("");
  const [newCategory, setNewCategory] = useState<Product["category"]>("bebidas");

  // Inline editing state
  const [editingCell, setEditingCell] = useState<{
    productId: string;
    field: "price" | "stock";
  } | null>(null);
  const [editValue, setEditValue] = useState("");

  const filteredProducts = inventory.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Computed stats
  const totalProducts = inventory.length;
  const totalStockValue = inventory.reduce(
    (sum, p) => sum + p.price * p.stock,
    0,
  );
  const lowStockCount = inventory.filter((p) => p.stock <= 20).length;

  const handleStartEdit = (
    productId: string,
    field: "price" | "stock",
    currentValue: string,
  ) => {
    setEditingCell({ productId, field });
    setEditValue(currentValue);
  };

  const handleSaveEdit = (productId: string, field: "price" | "stock") => {
    const parsed = field === "price" ? parseFloat(editValue) : parseInt(editValue, 10);

    if (isNaN(parsed) || parsed < 0 || editValue.trim() === "") {
      handleCancelEdit();
      toast.error("Valor inválido", {
        description: "Se restauró el valor anterior.",
      });
      return;
    }

    setInventory((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, [field]: parsed } : p)),
    );
    setEditingCell(null);
    setEditValue("");

    toast.success("Producto actualizado", {
      description: `Se actualizó el ${field === "price" ? "precio" : "stock"} correctamente.`,
    });
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const handleAddProduct = () => {
    if (!newName.trim() || !newPrice || !newStock) {
      toast.error("Campos incompletos", {
        description: "Por favor completa todos los campos.",
      });
      return;
    }

    const newProduct: Product = {
      id: `p${inventory.length + 1}`,
      name: newName.trim(),
      price: parseFloat(newPrice),
      stock: parseInt(newStock, 10),
      category: newCategory,
    };

    setInventory([newProduct, ...inventory]);
    setNewName("");
    setNewPrice("");
    setNewStock("");
    setNewCategory("bebidas");
    setIsDialogOpen(false);

    toast.success("Producto agregado", {
      description: `"${newProduct.name}" se agregó al inventario.`,
    });
  };

  const getStockBadge = (stock: number) => {
    if (stock > 20) {
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
          Óptimo
        </Badge>
      );
    }
    if (stock > 5) {
      return (
        <Badge className="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800">
          Bajo Stock
        </Badge>
      );
    }
    return <Badge variant="destructive">Sin Stock</Badge>;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-heading font-bold tracking-tight">
              Inventario
            </h2>
            <p className="text-muted-foreground">
              Gestiona los productos del frigobar.
            </p>
          </div>
          <Button className="shrink-0 gap-2" onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Nuevo Producto
          </Button>
        </div>

        {/* Stats Section */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Productos
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                productos registrados
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Valor Total en Stock
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalStockValue.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                valor estimado del inventario
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Stock Bajo
              </CardTitle>
              <AlertTriangle
                className={`h-4 w-4 ${lowStockCount > 0 ? "text-destructive" : "text-muted-foreground"}`}
              />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${lowStockCount > 0 ? "text-destructive" : ""}`}>
                {lowStockCount}
              </div>
              <p className="text-xs text-muted-foreground">
                productos con stock bajo
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Products Table */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg">Productos</CardTitle>
                <CardDescription>
                  Administra precios y stock. Doble clic para editar.
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre o categoría..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-full sm:w-64"
                  />
                </div>
                <p className="text-sm text-muted-foreground whitespace-nowrap">
                  {filteredProducts.length} de {inventory.length}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Precio (MXN)</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => {
                      const isEditingPrice =
                        editingCell?.productId === product.id &&
                        editingCell.field === "price";
                      const isEditingStock =
                        editingCell?.productId === product.id &&
                        editingCell.field === "stock";

                      return (
                        <TableRow
                          key={product.id}
                          className="group/row transition-colors"
                        >
                          <TableCell className="font-medium">
                            {product.name}
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-2">
                              <span
                                className={`h-2 w-2 rounded-full ${categoryConfig[product.category].color}`}
                              />
                              {categoryConfig[product.category].label}
                            </span>
                          </TableCell>
                          <TableCell
                            className="text-right cursor-pointer relative group/cell"
                            onDoubleClick={() =>
                              handleStartEdit(
                                product.id,
                                "price",
                                product.price.toString(),
                              )
                            }
                          >
                            {isEditingPrice ? (
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                className="h-8 w-24 ml-auto text-right"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={() =>
                                  handleSaveEdit(product.id, "price")
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter")
                                    handleSaveEdit(product.id, "price");
                                  if (e.key === "Escape") handleCancelEdit();
                                }}
                                autoFocus
                              />
                            ) : (
                              <span className="inline-flex items-center gap-1">
                                ${product.price.toFixed(2)}
                                <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover/row:opacity-100 transition-opacity" />
                              </span>
                            )}
                          </TableCell>
                          <TableCell
                            className="text-right cursor-pointer relative group/cell"
                            onDoubleClick={() =>
                              handleStartEdit(
                                product.id,
                                "stock",
                                product.stock.toString(),
                              )
                            }
                          >
                            {isEditingStock ? (
                              <Input
                                type="number"
                                min="0"
                                step="1"
                                className="h-8 w-20 ml-auto text-right"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={() =>
                                  handleSaveEdit(product.id, "stock")
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter")
                                    handleSaveEdit(product.id, "stock");
                                  if (e.key === "Escape") handleCancelEdit();
                                }}
                                autoFocus
                              />
                            ) : (
                              <span className="inline-flex items-center gap-1">
                                {product.stock}
                                <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover/row:opacity-100 transition-opacity" />
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {getStockBadge(product.stock)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No se encontraron productos.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nuevo Producto</DialogTitle>
            <DialogDescription>
              Agrega un producto al inventario del frigobar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nombre del producto
              </label>
              <Input
                id="name"
                placeholder="Ej: Agua Mineral 500ml"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="category" className="text-sm font-medium">
                Categoría
              </label>
              <Select value={newCategory} onValueChange={(value: any) => setNewCategory(value)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bebidas">Bebidas</SelectItem>
                  <SelectItem value="snacks">Snacks</SelectItem>
                  <SelectItem value="otros">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="price" className="text-sm font-medium">
                  Precio (MXN)
                </label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="stock" className="text-sm font-medium">
                  Stock inicial
                </label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddProduct}>
              Agregar Producto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

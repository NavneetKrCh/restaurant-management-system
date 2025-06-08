"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Package, AlertTriangle } from "lucide-react"
import Link from "next/link"

interface Ingredient {
  id: string
  name: string
  unit: string
  quantityToday: number
  minThreshold: number
}

interface Dish {
  id: string
  name: string
  price: number
  ingredients: { ingredientId: string; quantity: number }[]
  category: string
}

export default function InventoryPage() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [newDish, setNewDish] = useState({ name: "", price: 0, category: "", ingredients: [] })
  const [newIngredient, setNewIngredient] = useState({ name: "", unit: "", quantityToday: 0, minThreshold: 0 })
  const [isAddingDish, setIsAddingDish] = useState(false)
  const [isAddingIngredient, setIsAddingIngredient] = useState(false)

  useEffect(() => {
    // Load data from localStorage
    const savedDishes = localStorage.getItem("dishes")
    const savedIngredients = localStorage.getItem("ingredients")

    if (savedDishes) {
      setDishes(JSON.parse(savedDishes))
    } else {
      // Initialize with sample data
      const sampleDishes = [
        {
          id: "1",
          name: "Margherita Pizza",
          price: 12.99,
          category: "Pizza",
          ingredients: [
            { ingredientId: "1", quantity: 200 },
            { ingredientId: "2", quantity: 150 },
            { ingredientId: "3", quantity: 100 },
          ],
        },
        {
          id: "2",
          name: "Caesar Salad",
          price: 8.99,
          category: "Salad",
          ingredients: [
            { ingredientId: "4", quantity: 100 },
            { ingredientId: "5", quantity: 50 },
            { ingredientId: "6", quantity: 30 },
          ],
        },
      ]
      setDishes(sampleDishes)
      localStorage.setItem("dishes", JSON.stringify(sampleDishes))
    }

    if (savedIngredients) {
      setIngredients(JSON.parse(savedIngredients))
    } else {
      // Initialize with sample ingredients
      const sampleIngredients = [
        { id: "1", name: "Pizza Dough", unit: "g", quantityToday: 5000, minThreshold: 1000 },
        { id: "2", name: "Tomato Sauce", unit: "ml", quantityToday: 3000, minThreshold: 500 },
        { id: "3", name: "Mozzarella Cheese", unit: "g", quantityToday: 2000, minThreshold: 300 },
        { id: "4", name: "Lettuce", unit: "g", quantityToday: 1500, minThreshold: 200 },
        { id: "5", name: "Parmesan Cheese", unit: "g", quantityToday: 800, minThreshold: 100 },
        { id: "6", name: "Croutons", unit: "g", quantityToday: 500, minThreshold: 100 },
      ]
      setIngredients(sampleIngredients)
      localStorage.setItem("ingredients", JSON.stringify(sampleIngredients))
    }
  }, [])

  const addDish = () => {
    if (newDish.name && newDish.price > 0) {
      const dish = {
        ...newDish,
        id: Date.now().toString(),
        ingredients: [],
      }
      const updatedDishes = [...dishes, dish]
      setDishes(updatedDishes)
      localStorage.setItem("dishes", JSON.stringify(updatedDishes))
      setNewDish({ name: "", price: 0, category: "", ingredients: [] })
      setIsAddingDish(false)
    }
  }

  const addIngredient = () => {
    if (newIngredient.name && newIngredient.unit) {
      const ingredient = {
        ...newIngredient,
        id: Date.now().toString(),
      }
      const updatedIngredients = [...ingredients, ingredient]
      setIngredients(updatedIngredients)
      localStorage.setItem("ingredients", JSON.stringify(updatedIngredients))
      setNewIngredient({ name: "", unit: "", quantityToday: 0, minThreshold: 0 })
      setIsAddingIngredient(false)
    }
  }

  const updateIngredientQuantity = (id: string, quantity: number) => {
    const updatedIngredients = ingredients.map((ing) => (ing.id === id ? { ...ing, quantityToday: quantity } : ing))
    setIngredients(updatedIngredients)
    localStorage.setItem("ingredients", JSON.stringify(updatedIngredients))
  }

  const deleteDish = async (dishId: string) => {
    try {
      const response = await fetch(`/api/dishes/${dishId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        const updatedDishes = dishes.filter((dish) => dish.id !== dishId)
        setDishes(updatedDishes)
        localStorage.setItem("dishes", JSON.stringify(updatedDishes))
      } else {
        throw new Error("Failed to delete dish")
      }
    } catch (error) {
      console.error("Error deleting dish:", error)
      alert("Failed to delete dish. Please try again.")
    }
  }

  const lowStockIngredients = ingredients.filter((ing) => ing.quantityToday <= ing.minThreshold)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-gray-600">Manage dishes, ingredients, and daily quantities</p>
          </div>
          <Link href="/">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {lowStockIngredients.length > 0 && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Low Stock Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {lowStockIngredients.map((ing) => (
                  <Badge key={ing.id} variant="destructive">
                    {ing.name}: {ing.quantityToday}
                    {ing.unit}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dishes Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Dishes
                </CardTitle>
                <Dialog open={isAddingDish} onOpenChange={setIsAddingDish}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Dish
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Dish</DialogTitle>
                      <DialogDescription>Enter the details for the new dish</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="dishName">Dish Name</Label>
                        <Input
                          id="dishName"
                          value={newDish.name}
                          onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
                          placeholder="Enter dish name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dishPrice">Price ($)</Label>
                        <Input
                          id="dishPrice"
                          type="number"
                          step="0.01"
                          value={newDish.price}
                          onChange={(e) => setNewDish({ ...newDish, price: Number.parseFloat(e.target.value) || 0 })}
                          placeholder="Enter price"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dishCategory">Category</Label>
                        <Input
                          id="dishCategory"
                          value={newDish.category}
                          onChange={(e) => setNewDish({ ...newDish, category: e.target.value })}
                          placeholder="Enter category"
                        />
                      </div>
                      <Button onClick={addDish} className="w-full">
                        Add Dish
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dishes.map((dish) => (
                  <div key={dish.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{dish.name}</h3>
                        <p className="text-sm text-gray-600">{dish.category}</p>
                        <p className="text-lg font-bold text-green-600">${dish.price}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => deleteDish(dish.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ingredients Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Daily Ingredients (QuantToday)</CardTitle>
                <Dialog open={isAddingIngredient} onOpenChange={setIsAddingIngredient}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Ingredient
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Ingredient</DialogTitle>
                      <DialogDescription>Enter the details for the new ingredient</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="ingredientName">Ingredient Name</Label>
                        <Input
                          id="ingredientName"
                          value={newIngredient.name}
                          onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                          placeholder="Enter ingredient name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ingredientUnit">Unit</Label>
                        <Input
                          id="ingredientUnit"
                          value={newIngredient.unit}
                          onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                          placeholder="g, ml, pieces, etc."
                        />
                      </div>
                      <div>
                        <Label htmlFor="ingredientQuantity">Quantity Today</Label>
                        <Input
                          id="ingredientQuantity"
                          type="number"
                          value={newIngredient.quantityToday}
                          onChange={(e) =>
                            setNewIngredient({ ...newIngredient, quantityToday: Number.parseInt(e.target.value) || 0 })
                          }
                          placeholder="Enter quantity"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ingredientThreshold">Min Threshold</Label>
                        <Input
                          id="ingredientThreshold"
                          type="number"
                          value={newIngredient.minThreshold}
                          onChange={(e) =>
                            setNewIngredient({ ...newIngredient, minThreshold: Number.parseInt(e.target.value) || 0 })
                          }
                          placeholder="Enter minimum threshold"
                        />
                      </div>
                      <Button onClick={addIngredient} className="w-full">
                        Add Ingredient
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ingredient</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ingredients.map((ingredient) => (
                    <TableRow key={ingredient.id}>
                      <TableCell className="font-medium">{ingredient.name}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={ingredient.quantityToday}
                          onChange={(e) =>
                            updateIngredientQuantity(ingredient.id, Number.parseInt(e.target.value) || 0)
                          }
                          className="w-20"
                        />
                        <span className="ml-2 text-sm text-gray-500">{ingredient.unit}</span>
                      </TableCell>
                      <TableCell>
                        {ingredient.quantityToday <= ingredient.minThreshold ? (
                          <Badge variant="destructive">Low Stock</Badge>
                        ) : (
                          <Badge variant="secondary">In Stock</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

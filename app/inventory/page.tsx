"use client"

import { DialogTrigger } from "@/components/ui/dialog"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Plus, Edit, Trash2, Package, AlertTriangle, X, Check } from "lucide-react"
import Link from "next/link"

interface SubIngredient {
  name: string
  description?: string
  preparation_method?: string
  cooking_time?: number
  temperature?: string
  notes?: string
}

interface DishIngredient {
  ingredientId: string
  quantity: number
  unit: string
  sub_ingredient?: SubIngredient
}

interface Ingredient {
  id: string
  name: string
  unit: string
  quantityToday: number
  minThreshold: number
  costPerUnit?: number
  supplier?: string
}

interface Dish {
  id: string
  name: string
  price: number
  ingredients: DishIngredient[]
  category: string
  description?: string
  preparation_time?: number
}

export default function InventoryPage() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [newDish, setNewDish] = useState({
    name: "",
    price: 0,
    category: "",
    description: "",
    preparation_time: 0,
    ingredients: [] as DishIngredient[],
  })
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    unit: "",
    quantityToday: 0,
    minThreshold: 0,
    costPerUnit: 0,
    supplier: "",
  })
  const [isAddingDish, setIsAddingDish] = useState(false)
  const [isAddingIngredient, setIsAddingIngredient] = useState(false)
  const [currentDishIngredient, setCurrentDishIngredient] = useState<DishIngredient>({
    ingredientId: "",
    quantity: 0,
    unit: "",
    sub_ingredient: undefined,
  })
  const [showIngredientDialog, setShowIngredientDialog] = useState(false)
  const [newIngredientForDish, setNewIngredientForDish] = useState({
    name: "",
    unit: "",
    quantityToday: 100,
    minThreshold: 10,
    costPerUnit: 0,
    supplier: "",
  })

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
          description: "Classic pizza with tomato sauce and mozzarella",
          preparation_time: 15,
          ingredients: [
            {
              ingredientId: "1",
              quantity: 200,
              unit: "g",
              sub_ingredient: {
                name: "Pizza Base",
                description: "Rolled and shaped pizza dough",
                preparation_method: "Roll dough to 12-inch diameter",
                cooking_time: 2,
                temperature: "Room temperature",
                notes: "Let rest for 5 minutes before adding toppings",
              },
            },
            {
              ingredientId: "2",
              quantity: 150,
              unit: "ml",
              sub_ingredient: {
                name: "Pizza Sauce",
                description: "Seasoned tomato sauce spread",
                preparation_method: "Spread evenly leaving 1-inch border",
                cooking_time: 0,
                temperature: "Room temperature",
                notes: "Don't over-sauce to prevent soggy crust",
              },
            },
            {
              ingredientId: "3",
              quantity: 100,
              unit: "g",
              sub_ingredient: {
                name: "Melted Mozzarella",
                description: "Shredded mozzarella for topping",
                preparation_method: "Sprinkle evenly over sauce",
                cooking_time: 12,
                temperature: "450°F oven",
                notes: "Should be golden and bubbly when done",
              },
            },
          ],
        },
        {
          id: "2",
          name: "Caesar Salad",
          price: 8.99,
          category: "Salad",
          description: "Fresh romaine lettuce with Caesar dressing",
          preparation_time: 8,
          ingredients: [
            {
              ingredientId: "4",
              quantity: 100,
              unit: "g",
              sub_ingredient: {
                name: "Chopped Lettuce",
                description: "Fresh romaine lettuce, chopped",
                preparation_method: "Wash, dry, and chop into bite-sized pieces",
                cooking_time: 0,
                temperature: "Cold",
                notes: "Keep chilled until serving",
              },
            },
            {
              ingredientId: "5",
              quantity: 50,
              unit: "g",
              sub_ingredient: {
                name: "Grated Parmesan",
                description: "Freshly grated parmesan cheese",
                preparation_method: "Grate fresh parmesan over salad",
                cooking_time: 0,
                temperature: "Room temperature",
                notes: "Use microplane for best texture",
              },
            },
            {
              ingredientId: "6",
              quantity: 30,
              unit: "g",
            },
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
        {
          id: "1",
          name: "Pizza Dough",
          unit: "g",
          quantityToday: 5000,
          minThreshold: 1000,
          costPerUnit: 0.002,
          supplier: "Local Bakery",
        },
        {
          id: "2",
          name: "Tomato Sauce",
          unit: "ml",
          quantityToday: 3000,
          minThreshold: 500,
          costPerUnit: 0.003,
          supplier: "Sauce Co.",
        },
        {
          id: "3",
          name: "Mozzarella Cheese",
          unit: "g",
          quantityToday: 2000,
          minThreshold: 300,
          costPerUnit: 0.008,
          supplier: "Dairy Farm",
        },
        {
          id: "4",
          name: "Lettuce",
          unit: "g",
          quantityToday: 1500,
          minThreshold: 200,
          costPerUnit: 0.004,
          supplier: "Fresh Greens",
        },
        {
          id: "5",
          name: "Parmesan Cheese",
          unit: "g",
          quantityToday: 800,
          minThreshold: 100,
          costPerUnit: 0.015,
          supplier: "Cheese Shop",
        },
        {
          id: "6",
          name: "Croutons",
          unit: "g",
          quantityToday: 500,
          minThreshold: 100,
          costPerUnit: 0.006,
          supplier: "Bread Co.",
        },
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
      }
      const updatedDishes = [...dishes, dish]
      setDishes(updatedDishes)
      localStorage.setItem("dishes", JSON.stringify(updatedDishes))
      setNewDish({
        name: "",
        price: 0,
        category: "",
        description: "",
        preparation_time: 0,
        ingredients: [],
      })
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
      setNewIngredient({
        name: "",
        unit: "",
        quantityToday: 0,
        minThreshold: 0,
        costPerUnit: 0,
        supplier: "",
      })
      setIsAddingIngredient(false)
    }
  }

  const addIngredientToDish = () => {
    if (currentDishIngredient.ingredientId && currentDishIngredient.quantity > 0) {
      const updatedIngredients = [...newDish.ingredients, currentDishIngredient]
      setNewDish({ ...newDish, ingredients: updatedIngredients })
      setCurrentDishIngredient({
        ingredientId: "",
        quantity: 0,
        unit: "",
        sub_ingredient: undefined,
      })
    }
  }

  const removeIngredientFromDish = (index: number) => {
    const updatedIngredients = newDish.ingredients.filter((_, i) => i !== index)
    setNewDish({ ...newDish, ingredients: updatedIngredients })
  }

  const createAndAddIngredient = () => {
    if (newIngredientForDish.name && newIngredientForDish.unit) {
      // Create new ingredient
      const newIngredientId = Date.now().toString()
      const ingredient = {
        ...newIngredientForDish,
        id: newIngredientId,
      }

      // Add to ingredients list
      const updatedIngredients = [...ingredients, ingredient]
      setIngredients(updatedIngredients)
      localStorage.setItem("ingredients", JSON.stringify(updatedIngredients))

      // Set it as the current dish ingredient
      setCurrentDishIngredient({
        ...currentDishIngredient,
        ingredientId: newIngredientId,
        unit: newIngredientForDish.unit,
      })

      // Reset form and close dialog
      setNewIngredientForDish({
        name: "",
        unit: "",
        quantityToday: 100,
        minThreshold: 10,
        costPerUnit: 0,
        supplier: "",
      })
      setShowIngredientDialog(false)
    }
  }

  const updateIngredientQuantity = (id: string, quantity: number) => {
    const updatedIngredients = ingredients.map((ing) => (ing.id === id ? { ...ing, quantityToday: quantity } : ing))
    setIngredients(updatedIngredients)
    localStorage.setItem("ingredients", JSON.stringify(updatedIngredients))
  }

  const deleteDish = async (dishId: string) => {
    try {
      const updatedDishes = dishes.filter((dish) => dish.id !== dishId)
      setDishes(updatedDishes)
      localStorage.setItem("dishes", JSON.stringify(updatedDishes))
    } catch (error) {
      console.error("Error deleting dish:", error)
      alert("Failed to delete dish. Please try again.")
    }
  }

  const lowStockIngredients = ingredients.filter((ing) => ing.quantityToday <= ing.minThreshold)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Inventory Management</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage dishes with sub-ingredients, ingredients, and daily quantities
            </p>
          </div>
          <Link href="/">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {lowStockIngredients.length > 0 && (
          <Card className="mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
                Low Stock Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {lowStockIngredients.map((ing) => (
                  <Badge key={ing.id} variant="destructive">
                    {ing.name}: {ing.quantityToday} {ing.unit}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dishes Section */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Package className="h-5 w-5" />
                  Dishes with Sub-Ingredients
                </CardTitle>
                <Dialog open={isAddingDish} onOpenChange={setIsAddingDish}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Dish
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900">
                    <DialogHeader>
                      <DialogTitle className="text-gray-900 dark:text-gray-100">
                        Add New Dish with Ingredients
                      </DialogTitle>
                      <DialogDescription className="text-gray-600 dark:text-gray-400">
                        Enter the details for the new dish and specify required ingredients
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                      {/* Basic Dish Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="dishName" className="text-gray-900 dark:text-gray-100">
                            Dish Name
                          </Label>
                          <Input
                            id="dishName"
                            value={newDish.name}
                            onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
                            placeholder="Enter dish name"
                            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dishPrice" className="text-gray-900 dark:text-gray-100">
                            Price ($)
                          </Label>
                          <Input
                            id="dishPrice"
                            type="number"
                            step="0.01"
                            value={newDish.price === 0 ? "" : newDish.price}
                            onChange={(e) =>
                              setNewDish({
                                ...newDish,
                                price: e.target.value === "" ? 0 : Number.parseFloat(e.target.value) || 0,
                              })
                            }
                            placeholder="Enter price"
                            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dishCategory" className="text-gray-900 dark:text-gray-100">
                            Category
                          </Label>
                          <Input
                            id="dishCategory"
                            value={newDish.category}
                            onChange={(e) => setNewDish({ ...newDish, category: e.target.value })}
                            placeholder="Enter category"
                            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="prepTime" className="text-gray-900 dark:text-gray-100">
                            Preparation Time (minutes)
                          </Label>
                          <Input
                            id="prepTime"
                            type="number"
                            value={newDish.preparation_time === 0 ? "" : newDish.preparation_time}
                            onChange={(e) =>
                              setNewDish({
                                ...newDish,
                                preparation_time: e.target.value === "" ? 0 : Number.parseInt(e.target.value) || 0,
                              })
                            }
                            placeholder="Enter prep time"
                            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dishDescription" className="text-gray-900 dark:text-gray-100">
                          Description
                        </Label>
                        <Textarea
                          id="dishDescription"
                          value={newDish.description}
                          onChange={(e) => setNewDish({ ...newDish, description: e.target.value })}
                          placeholder="Enter dish description"
                          rows={3}
                          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                        />
                      </div>

                      <Separator className="bg-gray-200 dark:bg-gray-700" />

                      {/* Ingredients Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Required Ingredients
                          </h4>
                          <Dialog open={showIngredientDialog} onOpenChange={setShowIngredientDialog}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Create New Ingredient
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-white dark:bg-gray-900">
                              <DialogHeader>
                                <DialogTitle className="text-gray-900 dark:text-gray-100">
                                  Create New Ingredient
                                </DialogTitle>
                                <DialogDescription className="text-gray-600 dark:text-gray-400">
                                  This ingredient will be added to the database and can be used in this dish
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="newIngName" className="text-gray-900 dark:text-gray-100">
                                    Ingredient Name
                                  </Label>
                                  <Input
                                    id="newIngName"
                                    value={newIngredientForDish.name}
                                    onChange={(e) =>
                                      setNewIngredientForDish({ ...newIngredientForDish, name: e.target.value })
                                    }
                                    placeholder="Enter ingredient name"
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="newIngUnit" className="text-gray-900 dark:text-gray-100">
                                      Unit
                                    </Label>
                                    <Input
                                      id="newIngUnit"
                                      value={newIngredientForDish.unit}
                                      onChange={(e) =>
                                        setNewIngredientForDish({ ...newIngredientForDish, unit: e.target.value })
                                      }
                                      placeholder="g, ml, pieces, etc."
                                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="newIngQuantity" className="text-gray-900 dark:text-gray-100">
                                      Initial Quantity
                                    </Label>
                                    <Input
                                      id="newIngQuantity"
                                      type="number"
                                      value={
                                        newIngredientForDish.quantityToday === 100
                                          ? ""
                                          : newIngredientForDish.quantityToday
                                      }
                                      onChange={(e) =>
                                        setNewIngredientForDish({
                                          ...newIngredientForDish,
                                          quantityToday:
                                            e.target.value === "" ? 100 : Number.parseInt(e.target.value) || 100,
                                        })
                                      }
                                      placeholder="Enter quantity"
                                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                                    />
                                  </div>
                                </div>
                                <Button onClick={createAndAddIngredient} className="w-full">
                                  Create and Add to Dish
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>

                        {/* Add Ingredient to Dish */}
                        <Card className="p-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div className="space-y-2">
                              <Label className="text-gray-900 dark:text-gray-100">Select Ingredient</Label>
                              <Select
                                value={currentDishIngredient.ingredientId}
                                onValueChange={(value) => {
                                  const ingredient = ingredients.find((ing) => ing.id === value)
                                  setCurrentDishIngredient({
                                    ...currentDishIngredient,
                                    ingredientId: value,
                                    unit: ingredient?.unit || "",
                                  })
                                }}
                              >
                                <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                                  <SelectValue placeholder="Choose ingredient" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                                  {ingredients.map((ingredient) => (
                                    <SelectItem
                                      key={ingredient.id}
                                      value={ingredient.id}
                                      className="text-gray-900 dark:text-gray-100"
                                    >
                                      {ingredient.name} ({ingredient.unit})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-gray-900 dark:text-gray-100">Quantity</Label>
                              <Input
                                type="number"
                                value={currentDishIngredient.quantity === 0 ? "" : currentDishIngredient.quantity}
                                onChange={(e) =>
                                  setCurrentDishIngredient({
                                    ...currentDishIngredient,
                                    quantity: e.target.value === "" ? 0 : Number.parseFloat(e.target.value) || 0,
                                  })
                                }
                                placeholder="Amount needed"
                                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                              />
                            </div>
                            {/* Sub-ingredient details */}
                            {currentDishIngredient.ingredientId && (
                              <div className="col-span-3 space-y-4 mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                                <h5 className="font-medium text-gray-900 dark:text-gray-100">
                                  Sub-Ingredient Details (Optional)
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label className="text-gray-900 dark:text-gray-100">Sub-ingredient Name</Label>
                                    <Input
                                      value={currentDishIngredient.sub_ingredient?.name || ""}
                                      onChange={(e) =>
                                        setCurrentDishIngredient({
                                          ...currentDishIngredient,
                                          sub_ingredient: {
                                            ...currentDishIngredient.sub_ingredient,
                                            name: e.target.value,
                                          },
                                        })
                                      }
                                      placeholder="e.g., Chopped Lettuce"
                                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-gray-900 dark:text-gray-100">Preparation Method</Label>
                                    <Input
                                      value={currentDishIngredient.sub_ingredient?.preparation_method || ""}
                                      onChange={(e) =>
                                        setCurrentDishIngredient({
                                          ...currentDishIngredient,
                                          sub_ingredient: {
                                            ...currentDishIngredient.sub_ingredient,
                                            preparation_method: e.target.value,
                                          },
                                        })
                                      }
                                      placeholder="e.g., Wash, dry, and chop"
                                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-gray-900 dark:text-gray-100">Cooking Time (minutes)</Label>
                                    <Input
                                      type="number"
                                      value={
                                        currentDishIngredient.sub_ingredient?.cooking_time === 0
                                          ? ""
                                          : currentDishIngredient.sub_ingredient?.cooking_time || ""
                                      }
                                      onChange={(e) =>
                                        setCurrentDishIngredient({
                                          ...currentDishIngredient,
                                          sub_ingredient: {
                                            ...currentDishIngredient.sub_ingredient,
                                            cooking_time:
                                              e.target.value === "" ? 0 : Number.parseInt(e.target.value) || 0,
                                          },
                                        })
                                      }
                                      placeholder="Enter cooking time"
                                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-gray-900 dark:text-gray-100">Temperature</Label>
                                    <Input
                                      value={currentDishIngredient.sub_ingredient?.temperature || ""}
                                      onChange={(e) =>
                                        setCurrentDishIngredient({
                                          ...currentDishIngredient,
                                          sub_ingredient: {
                                            ...currentDishIngredient.sub_ingredient,
                                            temperature: e.target.value,
                                          },
                                        })
                                      }
                                      placeholder="e.g., 450°F oven"
                                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-gray-900 dark:text-gray-100">Notes</Label>
                                  <Input
                                    value={currentDishIngredient.sub_ingredient?.notes || ""}
                                    onChange={(e) =>
                                      setCurrentDishIngredient({
                                        ...currentDishIngredient,
                                        sub_ingredient: {
                                          ...currentDishIngredient.sub_ingredient,
                                          notes: e.target.value,
                                        },
                                      })
                                    }
                                    placeholder="Additional preparation notes"
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                                  />
                                </div>
                              </div>
                            )}
                            <Button
                              onClick={addIngredientToDish}
                              disabled={!currentDishIngredient.ingredientId || currentDishIngredient.quantity <= 0}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add
                            </Button>
                          </div>
                        </Card>

                        {/* Current Dish Ingredients */}
                        {newDish.ingredients.length > 0 && (
                          <div className="space-y-2">
                            <h5 className="font-medium text-gray-900 dark:text-gray-100">Dish Ingredients:</h5>
                            <div className="space-y-2">
                              {newDish.ingredients.map((ingredient, index) => {
                                const ingredientData = ingredients.find((ing) => ing.id === ingredient.ingredientId)
                                return (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                  >
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                          {ingredientData?.name}
                                        </span>
                                        <Badge variant="outline">
                                          {ingredient.quantity} {ingredient.unit}
                                        </Badge>
                                        {ingredient.sub_ingredient?.name && (
                                          <Badge variant="secondary">{ingredient.sub_ingredient.name}</Badge>
                                        )}
                                      </div>
                                      {ingredient.sub_ingredient?.preparation_method && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                          {ingredient.sub_ingredient.preparation_method}
                                        </p>
                                      )}
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => removeIngredientFromDish(index)}>
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      <Button onClick={addDish} className="w-full" disabled={!newDish.name || newDish.price <= 0}>
                        <Check className="h-4 w-4 mr-2" />
                        Create Dish
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dishes.map((dish) => (
                  <div
                    key={dish.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{dish.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{dish.category}</p>
                        {dish.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{dish.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          <p className="text-lg font-bold text-green-600 dark:text-green-400">${dish.price}</p>
                          {dish.preparation_time && <Badge variant="outline">{dish.preparation_time} min</Badge>}
                        </div>
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

                    {/* Ingredients List */}
                    {dish.ingredients && dish.ingredients.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Ingredients:</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {dish.ingredients.map((ingredient, idx) => {
                            const ingredientData = ingredients.find((ing) => ing.id === ingredient.ingredientId)
                            return (
                              <div
                                key={idx}
                                className="text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-gray-900 dark:text-gray-100">
                                    {ingredientData?.name || "Unknown Ingredient"}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {ingredient.quantity} {ingredient.unit}
                                  </Badge>
                                </div>
                                {ingredient.sub_ingredient && (
                                  <div className="mt-1 pl-2 border-l-2 border-blue-200 dark:border-blue-700">
                                    <p className="font-medium text-blue-700 dark:text-blue-300 text-xs">
                                      → {ingredient.sub_ingredient.name}
                                    </p>
                                    {ingredient.sub_ingredient.preparation_method && (
                                      <p className="text-gray-600 dark:text-gray-400 text-xs">
                                        {ingredient.sub_ingredient.preparation_method}
                                      </p>
                                    )}
                                    {ingredient.sub_ingredient.cooking_time && (
                                      <p className="text-gray-500 dark:text-gray-500 text-xs">
                                        Cook: {ingredient.sub_ingredient.cooking_time}min @{" "}
                                        {ingredient.sub_ingredient.temperature}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ingredients Section */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900 dark:text-gray-100">Daily Ingredients</CardTitle>
                <Dialog open={isAddingIngredient} onOpenChange={setIsAddingIngredient}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Ingredient
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white dark:bg-gray-900">
                    <DialogHeader>
                      <DialogTitle className="text-gray-900 dark:text-gray-100">Add New Ingredient</DialogTitle>
                      <DialogDescription className="text-gray-600 dark:text-gray-400">
                        Enter the details for the new ingredient
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="ingredientName" className="text-gray-900 dark:text-gray-100">
                          Ingredient Name
                        </Label>
                        <Input
                          id="ingredientName"
                          value={newIngredient.name}
                          onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                          placeholder="Enter ingredient name"
                          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ingredientUnit" className="text-gray-900 dark:text-gray-100">
                          Unit
                        </Label>
                        <Input
                          id="ingredientUnit"
                          value={newIngredient.unit}
                          onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                          placeholder="g, ml, pieces, etc."
                          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="ingredientQuantity" className="text-gray-900 dark:text-gray-100">
                            Quantity Today
                          </Label>
                          <Input
                            id="ingredientQuantity"
                            type="number"
                            value={newIngredient.quantityToday === 0 ? "" : newIngredient.quantityToday}
                            onChange={(e) =>
                              setNewIngredient({
                                ...newIngredient,
                                quantityToday: e.target.value === "" ? 0 : Number.parseInt(e.target.value) || 0,
                              })
                            }
                            placeholder="Enter quantity"
                            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ingredientThreshold" className="text-gray-900 dark:text-gray-100">
                            Min Threshold
                          </Label>
                          <Input
                            id="ingredientThreshold"
                            type="number"
                            value={newIngredient.minThreshold}
                            onChange={(e) =>
                              setNewIngredient({ ...newIngredient, minThreshold: Number.parseInt(e.target.value) || 0 })
                            }
                            placeholder="Enter minimum threshold"
                            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="ingredientCostPerUnit" className="text-gray-900 dark:text-gray-100">
                            Cost Per Unit
                          </Label>
                          <Input
                            id="ingredientCostPerUnit"
                            type="number"
                            step="0.01"
                            value={newIngredient.costPerUnit === 0 ? "" : newIngredient.costPerUnit}
                            onChange={(e) =>
                              setNewIngredient({
                                ...newIngredient,
                                costPerUnit: e.target.value === "" ? 0 : Number.parseFloat(e.target.value) || 0,
                              })
                            }
                            placeholder="Enter cost per unit"
                            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ingredientSupplier" className="text-gray-900 dark:text-gray-100">
                            Supplier
                          </Label>
                          <Input
                            id="ingredientSupplier"
                            type="text"
                            value={newIngredient.supplier}
                            onChange={(e) =>
                              setNewIngredient({
                                ...newIngredient,
                                supplier: e.target.value,
                              })
                            }
                            placeholder="Enter supplier"
                            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                          />
                        </div>
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
                  <TableRow className="border-gray-200 dark:border-gray-700">
                    <TableHead className="text-gray-900 dark:text-gray-100">Ingredient</TableHead>
                    <TableHead className="text-gray-900 dark:text-gray-100">Quantity</TableHead>
                    <TableHead className="text-gray-900 dark:text-gray-100">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ingredients.map((ingredient) => (
                    <TableRow key={ingredient.id} className="border-gray-200 dark:border-gray-700">
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                        <div>
                          <p>{ingredient.name}</p>
                          {ingredient.supplier && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">by {ingredient.supplier}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={ingredient.quantityToday}
                            onChange={(e) =>
                              updateIngredientQuantity(ingredient.id, Number.parseInt(e.target.value) || 0)
                            }
                            className="w-20 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                          />
                          <span className="text-sm text-gray-500 dark:text-gray-400">{ingredient.unit}</span>
                        </div>
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

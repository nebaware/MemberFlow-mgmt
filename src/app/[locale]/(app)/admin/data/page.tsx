"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/admin/data-table"
import { userColumns, orderColumns, productColumns } from "@/components/admin/columns"
import AdminAuthGuard from "@/components/admin/admin-auth-guard"
import { Loader2 } from "lucide-react"

export default function DataExplorerPage() {
    const [activeTab, setActiveTab] = useState("users")
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData(activeTab)
    }, [activeTab])

    const fetchData = async (tab: string) => {
        setLoading(true)
        try {
            let endpoint = ""
            if (tab === "users") endpoint = "/api/admin/users" // We might need to adjust this if /api/admin/users returns different structure
            if (tab === "orders") endpoint = "/api/admin/orders"
            if (tab === "products") endpoint = "/api/admin/products"

            const res = await fetch(endpoint)
            const json = await res.json()

            if (tab === "users") setData(json.users || []) // Assuming API returns { users: [] }
            if (tab === "orders") setData(json.orders || [])
            if (tab === "products") setData(json.products || [])

            // Fallback if API returns array directly (like /api/users might)
            if (Array.isArray(json)) setData(json)

        } catch (error) {
            console.error("Failed to fetch data", error)
            setData([])
        } finally {
            setLoading(false)
        }
    }

    return (
        <AdminAuthGuard>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Data Explorer</h1>
                    <p className="text-muted-foreground">
                        Direct access to database records.
                    </p>
                </div>

                <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="users">Users</TabsTrigger>
                        <TabsTrigger value="orders">Orders</TabsTrigger>
                        <TabsTrigger value="products">Products</TabsTrigger>
                    </TabsList>

                    <TabsContent value="users" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>All Users</CardTitle>
                                <CardDescription>
                                    Manage all registered users on the platform.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="flex justify-center p-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : (
                                    <DataTable columns={userColumns} data={data} />
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="orders" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>All Orders</CardTitle>
                                <CardDescription>
                                    View real-time order history across the platform.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="flex justify-center p-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : (
                                    <DataTable columns={orderColumns} data={data} />
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="products" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>All Products</CardTitle>
                                <CardDescription>
                                    Browse complete product inventory.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="flex justify-center p-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : (
                                    <DataTable columns={productColumns} data={data} />
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminAuthGuard>
    )
}

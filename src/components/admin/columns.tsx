"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

// User Columns
export type User = {
    id: string
    name: string
    email: string
    role: string
    verificationStatus: string
    createdAt: string
}

export const userColumns: ColumnDef<User>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => <Badge variant="outline">{row.getValue("role")}</Badge>,
    },
    {
        accessorKey: "verificationStatus",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("verificationStatus") as string
            return (
                <Badge variant={status === "verified" ? "default" : status === "rejected" ? "destructive" : "secondary"}>
                    {status}
                </Badge>
            )
        },
    },
    {
        accessorKey: "createdAt",
        header: "Joined",
        cell: ({ row }) => format(new Date(row.getValue("createdAt")), "MMM d, yyyy"),
    },
]

// Order Columns
export type Order = {
    id: string
    orderNumber: string
    buyer: { name: string; email: string }
    seller: { name: string; email: string }
    totalAmount: number
    status: string
    createdAt: string
}

export const orderColumns: ColumnDef<Order>[] = [
    {
        accessorKey: "orderNumber",
        header: "Order #",
    },
    {
        accessorKey: "buyer.name",
        header: "Buyer",
    },
    {
        accessorKey: "seller.name",
        header: "Seller",
    },
    {
        accessorKey: "totalAmount",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Amount
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("totalAmount"))
            const formatted = new Intl.NumberFormat("en-ET", {
                style: "currency",
                currency: "ETB",
            }).format(amount)
            return <div className="font-medium">{formatted}</div>
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <Badge>{row.getValue("status")}</Badge>,
    },
    {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => format(new Date(row.getValue("createdAt")), "MMM d, yyyy"),
    },
]

// Product Columns
export type Product = {
    id: string
    title: string
    price: number
    category: string
    seller: { name: string; email: string }
    createdAt: string
}

export const productColumns: ColumnDef<Product>[] = [
    {
        accessorKey: "title",
        header: "Product",
    },
    {
        accessorKey: "category",
        header: "Category",
    },
    {
        accessorKey: "seller.name",
        header: "Seller",
    },
    {
        accessorKey: "price",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Price
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("price"))
            const formatted = new Intl.NumberFormat("en-ET", {
                style: "currency",
                currency: "ETB",
            }).format(amount)
            return <div className="font-medium">{formatted}</div>
        },
    },
    {
        accessorKey: "createdAt",
        header: "Listed",
        cell: ({ row }) => format(new Date(row.getValue("createdAt")), "MMM d, yyyy"),
    },
]

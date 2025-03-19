"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

interface EditPaymentMethodPanelProps {
  onClose: () => void
  onSave: (id: string, fields: Record<string, string>) => void
  isLoading: boolean
  paymentMethod: {
    id: string
    name: string
    type: string
    details: Record<string, string>
    instructions?: string
  }
}

export default function EditPaymentMethodPanel({
  onClose,
  onSave,
  isLoading,
  paymentMethod,
}: EditPaymentMethodPanelProps) {
  const [charCount, setCharCount] = useState(0)

  // Create a dynamic schema based on payment method type
  const createFormSchema = () => {
    const baseSchema: Record<string, any> = {
      instructions: z.string().optional(),
    }

    // Add fields based on payment method type
    if (paymentMethod.type === "alipay") {
      baseSchema.account = z.string().min(1, "Alipay ID is required")
    } else if (["google_pay", "paypal", "skrill"].includes(paymentMethod.type)) {
      baseSchema.identifier = z.string().min(1, "Identifier is required")
    } else if (paymentMethod.type === "bank_transfer") {
      baseSchema.account_number = z.string().min(1, "Account number is required")
      baseSchema.bank_name = z.string().min(1, "Bank name is required")
      baseSchema.swift_code = z.string().optional()
      baseSchema.branch = z.string().optional()
    }

    return z.object(baseSchema)
  }

  // Create form schema
  const formSchema = createFormSchema()

  // Create form with initial values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...paymentMethod.details,
      instructions: paymentMethod.instructions || "",
    },
  })

  // Update character count for instructions
  useEffect(() => {
    const instructions = form.watch("instructions") || ""
    setCharCount(instructions.length)
  }, [form.watch("instructions")])

  // Handle form submission
  function onSubmit(values: z.infer<typeof formSchema>) {
    onSave(paymentMethod.id, values)
  }

  // Get field label based on field name
  const getFieldLabel = (fieldName: string): string => {
    const fieldLabels: Record<string, string> = {
      account: "Alipay ID",
      account_number: "Account Number",
      swift_code: "SWIFT or IFSC code",
      bank_name: "Bank Name",
      branch: "Branch",
      identifier: "Email or phone number",
      phone_number: "Phone number",
    }

    return fieldLabels[fieldName] || fieldName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  // Get field type based on field name
  const getFieldType = (fieldName: string): string => {
    if (fieldName.includes("phone")) return "tel"
    if (fieldName.includes("email")) return "email"
    return "text"
  }

  return (
    <Sheet open={true} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit payment method</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto py-6 space-y-6">
              <div className="text-lg font-medium">{paymentMethod.name}</div>

              <div className="space-y-4">
                {Object.keys(paymentMethod.details)
                  .filter((fieldName) => fieldName !== "instructions")
                  .map((fieldName) => (
                    <FormField
                      key={fieldName}
                      control={form.control}
                      name={fieldName as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-500">
                            {getFieldLabel(fieldName)}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type={getFieldType(fieldName)}
                              placeholder={`Enter ${getFieldLabel(fieldName).toLowerCase()}`}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
              </div>

              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-500">Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your instructions"
                        className="min-h-[120px] resize-none"
                        maxLength={300}
                        {...field}
                      />
                    </FormControl>
                    <div className="flex justify-end mt-1 text-xs text-gray-500">{charCount}/300</div>
                  </FormItem>
                )}
              />
            </div>

            <SheetFooter className="pt-4 border-t">
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Saving..." : "Save details"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}


"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

interface AddPaymentMethodPanelProps {
  onClose: () => void
  onAdd: (method: string, fields: Record<string, string>) => void
  isLoading: boolean
}

// Define payment method types and their required fields based on the screenshots
const PAYMENT_METHODS = [
  {
    value: "bank_transfer",
    label: "Bank Transfer",
    fields: [
      { name: "account", label: "Account Number", type: "text", required: true },
      { name: "bank_code", label: "SWIFT or IFSC code", type: "text", required: false },
      { name: "bank_name", label: "Bank Name", type: "text", required: true },
      { name: "branch", label: "Branch", type: "text", required: false },
    ],
  },
  {
    value: "alipay",
    label: "Alipay",
    fields: [{ name: "alipay_id", label: "Alipay ID", type: "text", required: true }],
  },
]

// Create a form schema
const formSchema = z.object({
  method: z.string().min(1, "Please select a payment method"),
  instructions: z.string().optional(),
  // Dynamic fields will be added based on selected method
})

export default function AddPaymentMethodPanel({ onClose, onAdd, isLoading }: AddPaymentMethodPanelProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>("")
  const [charCount, setCharCount] = useState(0)
  const [dynamicSchema, setDynamicSchema] = useState(formSchema)

  // Initialize form
  const form = useForm<z.infer<typeof dynamicSchema>>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      method: "",
      instructions: "",
    },
  })

  // Update schema when payment method changes
  useEffect(() => {
    if (selectedMethod) {
      const method = PAYMENT_METHODS.find((m) => m.value === selectedMethod)
      if (method) {
        // Create a new schema with dynamic fields
        const schemaFields: Record<string, any> = {
          method: z.string().min(1, "Please select a payment method"),
          instructions: z.string().optional(),
        }

        // Add fields based on selected method
        method.fields.forEach((field) => {
          if (field.required) {
            schemaFields[field.name] = z.string().min(1, `${field.label} is required`)
          } else {
            schemaFields[field.name] = z.string().optional()
          }
        })

        setDynamicSchema(z.object(schemaFields))

        // Reset form with new fields
        form.reset({
          method: selectedMethod,
          instructions: form.getValues().instructions,
          ...method.fields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {}),
        })
      }
    }
  }, [selectedMethod, form])

  // Update character count for instructions
  useEffect(() => {
    const instructions = form.watch("instructions") || ""
    setCharCount(instructions.length)
  }, [form.watch("instructions")])

  // Handle method selection
  const handleMethodChange = (value: string) => {
    setSelectedMethod(value)
    form.setValue("method", value)
  }

  // Handle form submission
  function onSubmit(values: z.infer<typeof dynamicSchema>) {
    const { method, instructions, ...fields } = values
    const fieldValues = { ...fields }

    // Add instructions if present
    if (instructions?.trim()) {
      fieldValues.instructions = instructions.trim()
    }

    onAdd(method, fieldValues)
  }

  const selectedMethodConfig = PAYMENT_METHODS.find((m) => m.value === selectedMethod)

  return (
    <Sheet open={true} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add payment method</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto py-6 space-y-6">
              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-500">Choose your payment method</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        handleMethodChange(value)
                        field.onChange(value)
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PAYMENT_METHODS.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedMethodConfig && (
                <div className="space-y-4">
                  {selectedMethodConfig.fields.map((field) => (
                    <FormField
                      key={field.name}
                      control={form.control}
                      name={field.name as any}
                      render={({ field: formField }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-500">{field.label}</FormLabel>
                          <FormControl>
                            <Input
                              type={field.type}
                              placeholder={`Enter ${field.label.toLowerCase()}`}
                              {...formField}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              )}

              {selectedMethod && (
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
              )}
            </div>

            <SheetFooter className="pt-4 border-t">
              <Button type="submit" disabled={isLoading || !selectedMethod}>
                {isLoading ? "Adding..." : "Add"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}


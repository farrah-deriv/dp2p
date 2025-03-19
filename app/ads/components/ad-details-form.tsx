"use client"
import { useEffect } from "react"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import type { AdFormData } from "../types"
import { useIsMobile } from "@/hooks/use-mobile"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { FormControl, FormField, FormItem, FormLabel, FormMessage, Form } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

interface AdDetailsFormProps {
  onNext: (data: Partial<AdFormData>, errors?: ValidationErrors) => void
  onClose: () => void
  initialData?: Partial<AdFormData>
  isEditMode?: boolean
}

interface ValidationErrors {
  totalAmount?: string
  fixedRate?: string
  minAmount?: string
  maxAmount?: string
}

// Create a schema for form validation
const formSchema = z
  .object({
    type: z.enum(["buy", "sell"]),
    totalAmount: z.string().min(1, "Total amount is required"),
    fixedRate: z.string().min(1, "Rate is required"),
    minAmount: z.string().min(1, "Minimum amount is required"),
    maxAmount: z.string().min(1, "Maximum amount is required"),
  })
  .refine(
    (data) => {
      const total = Number(data.totalAmount)
      const min = Number(data.minAmount)
      return min <= total
    },
    {
      message: "Minimum amount must be less than or equal to total amount",
      path: ["minAmount"],
    },
  )
  .refine(
    (data) => {
      const min = Number(data.minAmount)
      const max = Number(data.maxAmount)
      return min <= max
    },
    {
      message: "Maximum amount must be greater than or equal to minimum amount",
      path: ["maxAmount"],
    },
  )

export default function AdDetailsForm({ onNext, onClose, initialData, isEditMode }: AdDetailsFormProps) {
  const isMobile = useIsMobile()

  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: (initialData?.type as "buy" | "sell") || "buy",
      totalAmount: initialData?.totalAmount?.toString() || "",
      fixedRate: initialData?.fixedRate?.toString() || "",
      minAmount: initialData?.minAmount?.toString() || "",
      maxAmount: initialData?.maxAmount?.toString() || "",
    },
  })

  // Update form values when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        type: (initialData.type as "buy" | "sell") || "buy",
        totalAmount: initialData.totalAmount?.toString() || "",
        fixedRate: initialData.fixedRate?.toString() || "",
        minAmount: initialData.minAmount?.toString() || "",
        maxAmount: initialData.maxAmount?.toString() || "",
      })
    }
  }, [initialData, form])

  // Handle form submission
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Convert string values to numbers
    const formData = {
      type: values.type,
      totalAmount: Number.parseFloat(values.totalAmount) || 0,
      fixedRate: Number.parseFloat(values.fixedRate) || 0,
      minAmount: Number.parseFloat(values.minAmount) || 0,
      maxAmount: Number.parseFloat(values.maxAmount) || 0,
    }

    onNext(formData)
  }

  // Communicate form validation state to parent
  useEffect(() => {
    const subscription = form.watch((value) => {
      const isValid = form.formState.isValid
      const event = new CustomEvent("adFormValidationChange", {
        bubbles: true,
        detail: {
          isValid,
          formData: {
            type: value.type,
            totalAmount: Number.parseFloat(value.totalAmount || "0") || 0,
            fixedRate: Number.parseFloat(value.fixedRate || "0") || 0,
            minAmount: Number.parseFloat(value.minAmount || "0") || 0,
            maxAmount: Number.parseFloat(value.maxAmount || "0") || 0,
          },
        },
      })
      document.dispatchEvent(event)
    })

    return () => subscription.unsubscribe()
  }, [form])

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b relative">
        <h2 className="text-xl font-semibold text-center">{isEditMode ? "Edit ad details" : "Enter ad details"}</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="absolute right-6 top-1/2 -translate-y-1/2">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 p-6">
          <div className="max-w-[800px] mx-auto h-full flex flex-col justify-between">
            <div className="space-y-12">
              <div>
                <h3 className="text-base font-medium mb-6">Select trade type</h3>
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-12">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="buy" id="buy" />
                            <Label htmlFor="buy" className="text-lg cursor-pointer">
                              Buy USD
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="sell" id="sell" />
                            <Label htmlFor="sell" className="text-lg cursor-pointer">
                              Sell USD
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <h3 className="text-base font-medium mb-6">Set amount and rate</h3>
                <div className={`${isMobile ? "space-y-4" : "grid grid-cols-2 gap-4"}`}>
                  <FormField
                    control={form.control}
                    name="totalAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm text-gray-500">Total amount</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              {...field}
                              placeholder="0.00"
                              min="0.01"
                              step="0.01"
                              className="text-left pl-3 pr-16 h-10"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">USD</span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fixedRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm text-gray-500">Fixed rate</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              {...field}
                              placeholder="0.00"
                              min="0.01"
                              step="0.01"
                              className="text-left pl-3 pr-16 h-10"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">IDR</span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-base font-medium mb-6">Order amount limit</h3>
                <div className={`${isMobile ? "space-y-4" : "grid grid-cols-2 gap-4"}`}>
                  <FormField
                    control={form.control}
                    name="minAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm text-gray-500">Minimum order amount</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              {...field}
                              placeholder="0.00"
                              min="0.01"
                              step="0.01"
                              className="text-left pl-3 pr-16 h-10"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">USD</span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm text-gray-500">Maximum order amount</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              {...field}
                              placeholder="0.00"
                              min="0.01"
                              step="0.01"
                              className="text-left pl-3 pr-16 h-10"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">USD</span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Fixed positioned button at bottom right */}
          <div className="fixed bottom-6 right-6">
            <Button type="submit" disabled={!form.formState.isValid} className="rounded-full px-8">
              Next
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}


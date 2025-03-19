import { Info, Edit } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface BusinessHoursProps {
  isOpen: boolean
  availability: string
}

export default function BusinessHours({ isOpen, availability }: BusinessHoursProps) {
  return (
    <Card className="mb-6">
      <CardHeader className="p-4 pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h3 className="font-medium">Business hours</h3>
            <Info className="h-4 w-4 ml-1 text-gray-400" />
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="text-green-600 font-medium">{isOpen ? "Open now" : "Closed"}</div>
        <div className="text-sm text-gray-500">({availability})</div>
      </CardContent>
    </Card>
  )
}


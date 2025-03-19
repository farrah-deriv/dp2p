import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface TradeLimitsProps {
  buyLimit: {
    current: number
    max: number
    currency: string
  }
  sellLimit: {
    current: number
    max: number
    currency: string
  }
}

export default function TradeLimits({ buyLimit, sellLimit }: TradeLimitsProps) {
  const buyPercentage = (buyLimit.current / buyLimit.max) * 100
  const sellPercentage = (sellLimit.current / sellLimit.max) * 100

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Daily trade limit</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-500">Buy limit</span>
              <span className="text-sm">
                {buyLimit.currency} {buyLimit.current.toFixed(2)} / {buyLimit.max.toFixed(2)}
              </span>
            </div>
            <Progress value={buyPercentage} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-500">Sell limit</span>
              <span className="text-sm">
                {sellLimit.currency} {sellLimit.current.toFixed(2)} / {sellLimit.max.toFixed(2)}
              </span>
            </div>
            <Progress value={sellPercentage} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


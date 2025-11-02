'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DisclaimersPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Disclaimers</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Risk Disclosure</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-line">
              Trading involves substantial risk of loss and is not suitable for every investor. Past performance is not indicative of future results.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hypothetical Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-line">
              Hypothetical performance results have certain inherent limitations. No representation is being made that any account will or is likely to achieve profits or losses similar to those shown.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

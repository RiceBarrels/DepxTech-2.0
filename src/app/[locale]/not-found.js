import { ConditionalFooter } from "@/components/ui/conditional-footer";
import Nav from "@/components/ui/nav";
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineShadowText } from '@/components/magicui/line-shadow-text'
import { TransitionLink } from '@/components/ui/pageTransitions'

export default function NotFound() {
  return (
    <div className="w-screen h-[100dvh] flex flex-col">
        <div className="flex-1 overflow-y-auto w-full">
            <div className="h-16 hidden sm:block"/>

            <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
              <div className="max-w-2xl mx-auto text-center">
                <div className="mb-8">
                  <LineShadowText
                    className="text-8xl sm:text-9xl font-bold text-primary mb-4"
                    shadowColor="hsl(var(--muted-foreground))"
                  >
                    404
                  </LineShadowText>
                  <h2 className="text-2xl sm:text-3xl font-semibold mb-2">
                    Page Not Found
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    Oops! The page you're looking for doesn't exist or has been moved.
                  </p>
                </div>

                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>What can you do?</CardTitle>
                    <CardDescription>
                      Here are some helpful options to get you back on track
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <TransitionLink href="/">
                        <Button className="w-full sm:w-auto">
                          Go Home
                        </Button>
                      </TransitionLink>
                      <TransitionLink href="/products">
                        <Button variant="outline" className="w-full sm:w-auto">
                          Browse Products
                        </Button>
                      </TransitionLink>
                      <TransitionLink href="/trade">
                        <Button variant="outline" className="w-full sm:w-auto">
                          Trade-In Center
                        </Button>
                      </TransitionLink>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-1">Homepage</h3>
                      <p className="text-sm text-muted-foreground">
                        Return to our main page
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-1">Products</h3>
                      <p className="text-sm text-muted-foreground">
                        Explore our product catalog
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-1">Trade-In</h3>
                      <p className="text-sm text-muted-foreground">
                        Trade your old devices
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            <ConditionalFooter />
        </div>
        <Nav />
    </div>
  )
}

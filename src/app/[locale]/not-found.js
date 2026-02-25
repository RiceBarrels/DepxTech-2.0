import { ConditionalFooter } from "@/components/ui/conditional-footer";
import { Footer } from "@/components/ui/footer";
import Nav from "@/components/ui/nav";
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineShadowText } from '@/components/magicui/line-shadow-text'
import { TransitionLink } from '@/components/ui/pageTransitions'
import { useTranslations } from 'next-intl'

export default function NotFound() {
  const t = useTranslations('notFound')

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
                    {t('title')}
                  </LineShadowText>
                  <h2 className="text-2xl sm:text-3xl font-semibold mb-2">
                    {t('heading')}
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    {t('description')}
                  </p>
                </div>

                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>{t('whatCanYouDo')}</CardTitle>
                    <CardDescription>
                      {t('helpfulOptions')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <TransitionLink href="/">
                        <Button className="w-full sm:w-auto">
                          {t('goHome')}
                        </Button>
                      </TransitionLink>
                      <TransitionLink href="/products">
                        <Button variant="outline" className="w-full sm:w-auto">
                          {t('browseProducts')}
                        </Button>
                      </TransitionLink>
                      <TransitionLink href="/trade">
                        <Button variant="outline" className="w-full sm:w-auto">
                          {t('tradeInCenter')}
                        </Button>
                      </TransitionLink>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-1">{t('homepageTitle')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('homepageDesc')}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-1">{t('productsTitle')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('productsDesc')}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-1">{t('tradeInTitle')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('tradeInDesc')}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            <ConditionalFooter><Footer /></ConditionalFooter>
        </div>
        <Nav />
    </div>
  )
}

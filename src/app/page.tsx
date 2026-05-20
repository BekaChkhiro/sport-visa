import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function HomePage() {
  return (
    <div className="container mx-auto flex flex-col gap-8 px-4 py-12">
      <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          მოგესალმებით Sport Visa-ში
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          ეს არის სატესტო გვერდი T1.2 ეტაპისთვის — ვამოწმებთ Next.js App Router-ს, Tailwind v4-ს,
          shadcn/ui კომპონენტებსა და Noto Sans Georgian ფონტს.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>shadcn/ui კომპონენტები</CardTitle>
            <CardDescription>Button, Input და Card პრიმიტივები მუშაობს</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Input placeholder="თქვენი სახელი" aria-label="თქვენი სახელი" />
            <div className="flex flex-wrap gap-2">
              <Button>ძირითადი</Button>
              <Button variant="secondary">მეორადი</Button>
              <Button variant="outline">გარე</Button>
              <Button variant="ghost">აჩრდილი</Button>
              <Button variant="destructive">წაშლა</Button>
            </div>
          </CardContent>
          <CardFooter className="border-t">
            <span className="text-muted-foreground text-xs">
              Tailwind CSS v4 + Radix Slot + class-variance-authority
            </span>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ქართული ფონტი</CardTitle>
            <CardDescription>
              Noto Sans Georgian იტვირთება next/font-ით (display: swap)
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <p>აბგდევზთიკლმნოპჟრსტუფქღყშჩცძწჭხჯჰ</p>
            <p className="font-medium">ფეხბურთელი · კლუბი · ტრანსფერი</p>
            <p className="font-semibold">სპორტული პლატფორმა საქართველოსთვის</p>
            <p className="font-bold">2026</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

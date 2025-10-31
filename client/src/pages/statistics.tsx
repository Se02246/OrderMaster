import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  ChartContainer, 
  ChartTooltipContent, 
  ChartLegend,
  type ChartConfig 
} from "@/components/ui/chart";
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { ClipboardList, Trophy, CalendarClock } from "lucide-react";
import { formatDateForDisplay } from "@/lib/date-utils";
import { parse, format } from "date-fns";
import { it } from "date-fns/locale";

// Definisco i tipi per i dati delle statistiche
type StatisticsData = {
  totalOrders: number;
  topEmployee: {
    name: string;
    count: number;
  };
  orderStatusCounts: { name: string; value: number }[];
  paymentStatusCounts: { name: string; value: number }[];
  ordersByMonth: { name: string; total: number }[];
  busiestDay: {
    date: string;
    count: number;
  };
};

// Definisco i colori per i grafici
const PIE_COLORS = {
  "Da Fare": "hsl(var(--chart-5))", // Rosso/Arancio
  "In Corso": "hsl(var(--chart-3))", // Giallo
  "Fatto": "hsl(var(--chart-2))", // Verde
  "Da Pagare": "hsl(var(--chart-5))", // Rosso/Arancio
  "Pagato": "hsl(var(--chart-2))", // Verde
};

// Configurazioni per i grafici
const orderStatusConfig = {
  orders: { label: "Ordini" },
  "Da Fare": { label: "Da Fare", color: PIE_COLORS["Da Fare"] },
  "In Corso": { label: "In Corso", color: PIE_COLORS["In Corso"] },
  "Fatto": { label: "Fatto", color: PIE_COLORS["Fatto"] },
} satisfies ChartConfig;

const paymentStatusConfig = {
  payments: { label: "Pagamenti" },
  "Da Pagare": { label: "Da Pagare", color: PIE_COLORS["Da Pagare"] },
  "Pagato": { label: "Pagato", color: PIE_COLORS["Pagato"] },
} satisfies ChartConfig;

const monthlyChartConfig = {
  total: {
    label: "Totale Ordini",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;


export default function Statistics() {
  const { data: stats, isLoading, isError } = useQuery<StatisticsData>({
    queryKey: ['/api/statistics'],
  });

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#70fad3]"></div>
        <p className="mt-2 text-gray-600">Caricamento statistiche...</p>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="text-center py-8 bg-white rounded-lg shadow">
        <i className="fas fa-exclamation-triangle text-red-500 text-5xl mb-4"></i>
        <h3 className="text-xl font-medium text-gray-700 mb-2">Errore</h3>
        <p className="text-gray-500">Impossibile caricare le statistiche.</p>
      </div>
    );
  }

  // Formattazione dati per il grafico mensile
  const monthlyData = stats.ordersByMonth.map(item => ({
    name: format(parse(item.name, 'yyyy-MM', new Date()), 'LLL yyyy', { locale: it }),
    total: item.total
  }));
  
  // Formattazione giorno più impegnativo
  const formattedBusiestDay = stats.busiestDay.date !== 'N/A' 
    ? formatDateForDisplay(stats.busiestDay.date)
    : 'N/A';

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-dark">Statistiche</h2>
      
      {/* Griglia Metriche Principali */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ordini Totali</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">Totale ordini registrati</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cliente Top</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.topEmployee.name}</div>
            <p className="text-xs text-muted-foreground">
              Con {stats.topEmployee.count} {stats.topEmployee.count === 1 ? 'ordine' : 'ordini'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Giorno più Impegnativo</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formattedBusiestDay}</div>
            <p className="text-xs text-muted-foreground">
              Con {stats.busiestDay.count} {stats.busiestDay.count === 1 ? 'ordine' : 'ordini'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Griglia Grafici */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Grafico Ordini Mensili */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Ordini per Mese (Ultimi 6 Mesi)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={monthlyChartConfig} className="h-[250px] w-full">
              <BarChart data={monthlyData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                />
                <YAxis allowDecimals={false} />
                <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar 
                  dataKey="total" 
                  fill="var(--color-total)" 
                  radius={4} 
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Grafico Torta Stato Ordini */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Stato Ordini</CardTitle>
            <CardDescription>Distribuzione dello stato degli ordini</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ChartContainer config={orderStatusConfig} className="h-[250px] w-full">
              <PieChart>
                <Tooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={stats.orderStatusCounts}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {stats.orderStatusCounts.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={PIE_COLORS[entry.name as keyof typeof PIE_COLORS]} />
                  ))}
                </Pie>
                <ChartLegend
                  content={<ChartLegend content={undefined} />}
                  className="-mt-4"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Grafico Torta Stato Pagamenti */}
        <Card>
          <CardHeader>
            <CardTitle>Stato Pagamenti</CardTitle>
            <CardDescription>Distribuzione dello stato dei pagamenti</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ChartContainer config={paymentStatusConfig} className="h-[250px] w-full">
              <PieChart>
                <Tooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={stats.paymentStatusCounts}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {stats.paymentStatusCounts.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={PIE_COLORS[entry.name as keyof typeof PIE_COLORS]} />
                  ))}
                </Pie>
                <ChartLegend
                  content={<ChartLegend content={undefined} />}
                  className="-mt-4"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        {/* Placeholder per un altro grafico */}
        <Card>
          <CardHeader>
            <CardTitle>Altre Statistiche</CardTitle>
            <CardDescription>Un'altra visualizzazione dati.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[250px]">
            <p className="text-muted-foreground">Grafico in arrivo...</p>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

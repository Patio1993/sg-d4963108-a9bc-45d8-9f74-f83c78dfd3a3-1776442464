import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { caloriesStatsService, type CaloriesDataPoint } from "@/services/caloriesStatsService";
import { format, parseISO } from "date-fns";
import { sk } from "date-fns/locale";

export function CaloriesChart() {
  const [range, setRange] = useState<"week" | "month" | "3months" | "year">("week");
  const [data, setData] = useState<CaloriesDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [range]);

  const loadData = async () => {
    setLoading(true);
    try {
      const caloriesData = await caloriesStatsService.getCaloriesData(range);
      setData(caloriesData);
    } catch (error) {
      console.error("Error loading calories data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "d.M.yy", { locale: sk });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <span>🔥</span> Energia (kcal)
          </CardTitle>
          <Select value={range} onValueChange={(v) => setRange(v as typeof range)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Posledný týždeň</SelectItem>
              <SelectItem value="month">Posledný mesiac</SelectItem>
              <SelectItem value="3months">Posledné 3 mesiace</SelectItem>
              <SelectItem value="year">Posledný rok</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">Načítavam údaje...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">Žiadne údaje o kalóriách</p>
              <p className="text-sm text-muted-foreground">
                Začni zaznamenávať jedlá, aby sa zobrazil graf
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                stroke="#666"
                style={{ fontSize: "12px" }}
              />
              <YAxis 
                stroke="#666"
                style={{ fontSize: "12px" }}
                domain={[0, "dataMax + 200"]}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: "white", 
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "8px 12px"
                }}
                labelFormatter={(label) => formatDate(label as string)}
                formatter={(value: number, name: string) => {
                  const label = name === "calories" ? "Energia" : "Cieľ";
                  return [`${value} kcal`, label];
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: "20px" }}
                formatter={(value) => value === "calories" ? "Energia" : "Cieľ"}
              />
              <Bar
                dataKey="calories"
                fill="#FF6B35"
                radius={[4, 4, 0, 0]}
                name="calories"
              />
              <Bar
                dataKey="goal"
                fill="#7CB342"
                radius={[4, 4, 0, 0]}
                name="goal"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
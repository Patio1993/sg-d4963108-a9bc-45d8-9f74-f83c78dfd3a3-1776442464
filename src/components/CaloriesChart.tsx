import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell } from "recharts";
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

  // Function to determine bar color based on ±10% range
  const getBarColor = (calories: number, goal: number) => {
    const lowerBound = goal * 0.9;
    const upperBound = goal * 1.1;
    return calories >= lowerBound && calories <= upperBound ? "#7CB342" : "#FF6B35";
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
                formatter={(value: number) => [`${value} kcal`, "Energia"]}
              />
              <Legend 
                wrapperStyle={{ paddingTop: "20px" }}
                formatter={() => "Energia"}
              />
              <ReferenceLine
                y={data[0]?.goal || 2000}
                stroke="#9E9E9E"
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{ 
                  value: `Cieľ: ${data[0]?.goal || 2000} kcal`, 
                  position: "insideTopRight", 
                  fill: "#666", 
                  fontSize: 14,
                  fontWeight: "bold",
                  offset: 10
                }}
              />
              <Bar dataKey="calories" name="calories" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.calories, entry.goal)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
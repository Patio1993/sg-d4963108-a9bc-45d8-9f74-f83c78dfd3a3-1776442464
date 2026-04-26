import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { weightStatsService, type WeightDataPoint } from "@/services/weightStatsService";
import { format, parseISO } from "date-fns";
import { sk } from "date-fns/locale";

export function WeightChart() {
  const [range, setRange] = useState<"week" | "month" | "3months" | "year">("week");
  const [data, setData] = useState<WeightDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [range]);

  const loadData = async () => {
    setLoading(true);
    try {
      const weightData = await weightStatsService.getWeightData(range);
      setData(weightData);
    } catch (error) {
      console.error("Error loading weight data:", error);
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

  const rangeLabels = {
    week: "Posledný týždeň",
    month: "Posledný mesiac",
    "3months": "Posledné 3 mesiace",
    year: "Posledný rok",
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <span>⚖️</span> Vývoj hmotnosti
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
              <p className="text-muted-foreground">Žiadne údaje o hmotnosti</p>
              <p className="text-sm text-muted-foreground">
                Začni zaznamenávať svoju hmotnosť v dennom súhrne
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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
                domain={["dataMin - 1", "dataMax + 1"]}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: "white", 
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "8px 12px"
                }}
                labelFormatter={(label) => formatDate(label as string)}
                formatter={(value: number) => [`${value} kg`, ""]}
              />
              <Legend 
                wrapperStyle={{ paddingTop: "20px" }}
                formatter={(value) => value === "weight" ? "Hmotnosť" : "Cieľ"}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#FF6B35"
                strokeWidth={2}
                dot={{ fill: "#FF6B35", r: 5 }}
                activeDot={{ r: 7 }}
                name="weight"
              />
              {data[0]?.goal && (
                <Line
                  type="monotone"
                  dataKey="goal"
                  stroke="#9E9E9E"
                  strokeWidth={2}
                  dot={{ fill: "#9E9E9E", r: 4 }}
                  strokeDasharray="5 5"
                  name="goal"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
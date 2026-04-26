import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { nutritionAnalysisService, type NutrientData } from "@/services/nutritionAnalysisService";

export function NutritionAnalysisChart() {
  const [range, setRange] = useState<"week" | "month" | "3months" | "year">("week");
  const [mealType, setMealType] = useState<"all" | "breakfast" | "lunch" | "dinner" | "snack" | "olovrant">("all");
  const [nutrients, setNutrients] = useState<NutrientData[]>([]);
  const [dateRange, setDateRange] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [range, mealType]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await nutritionAnalysisService.getNutritionAnalysis(range, mealType);
      setNutrients(data.nutrients);
      setDateRange(data.dateRange);
    } catch (error) {
      console.error("Error loading nutrition analysis:", error);
    } finally {
      setLoading(false);
    }
  };

  const mealTypeLabels = {
    all: "Všetko",
    breakfast: "Raňajky",
    lunch: "Obed",
    dinner: "Večera",
    snack: "Desiata",
    olovrant: "Olovrant",
  };

  // Prepare data for pie chart (exclude energy as it's shown separately)
  const pieData = nutrients
    .filter((n) => n.nutrient !== "Energia")
    .map((n) => ({
      name: n.nutrient,
      value: n.average,
      color: n.color,
    }));

  return (
    <Card>
      <CardHeader>
        <div className="space-y-4">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <span>📊</span> Analýza jedálničku
          </CardTitle>
          
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">📅</span>
              <span className="text-sm font-medium">{dateRange}</span>
            </div>
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

          <div className="bg-green-50 rounded-lg p-4 border">
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold whitespace-nowrap">
                Filter denného jedla:
              </label>
              <Select value={mealType} onValueChange={(v) => setMealType(v as typeof mealType)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všetko</SelectItem>
                  <SelectItem value="breakfast">Raňajky</SelectItem>
                  <SelectItem value="lunch">Obed</SelectItem>
                  <SelectItem value="dinner">Večera</SelectItem>
                  <SelectItem value="snack">Desiata</SelectItem>
                  <SelectItem value="olovrant">Olovrant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">Načítavam údaje...</p>
          </div>
        ) : nutrients.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">Žiadne údaje</p>
              <p className="text-sm text-muted-foreground">
                Začni zaznamenávať jedlá, aby sa zobrazila analýza
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pie Chart */}
            <div className="bg-white rounded-lg border p-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `${value.toFixed(1)}g`}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      padding: "8px 12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Nutrients Table */}
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 border-b font-semibold text-sm">
                <div></div>
                <div className="text-center">Priemer</div>
                <div className="text-center">Cieľ</div>
                <div className="text-center">%</div>
              </div>

              {nutrients.map((nutrient, index) => (
                <div
                  key={index}
                  className="grid grid-cols-4 gap-4 p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: nutrient.color }}
                    />
                    <span className="font-medium">{nutrient.nutrient}</span>
                  </div>
                  <div className="text-center font-semibold">
                    {nutrient.average} {nutrient.unit}
                  </div>
                  <div className="text-center text-muted-foreground">
                    {nutrient.goal} {nutrient.unit}
                  </div>
                  <div className="text-center font-semibold">
                    {nutrient.percentage} %
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
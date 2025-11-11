import { useState } from "react";
import { Calculator, X, TrendingUp, Apple, ArrowLeft } from "lucide-react";
import { nutritionAPI } from "../services/api";
import { toast } from "sonner";
import { useTheme } from "../context/ThemeContext";

interface NutritionResult {
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  calcium?: number;
  iron?: number;
  vitaminC?: number;
}

interface NutritionCalculatorProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function NutritionCalculator(
  {
    isOpen: externalIsOpen,
    onOpenChange,
  }: NutritionCalculatorProps = {} as NutritionCalculatorProps
) {
  const { isDarkMode } = useTheme();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = onOpenChange || setInternalIsOpen;

  const [foodInput, setFoodInput] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [nutritionResult, setNutritionResult] =
    useState<NutritionResult | null>(null);
  const [history, setHistory] = useState<
    Array<{ food: string; nutrition: NutritionResult }>
  >([]);

  const handleCalculate = async () => {
    if (!foodInput.trim()) {
      toast.error("Please enter food items");
      return;
    }

    setIsCalculating(true);
    try {
      const response = await nutritionAPI.calculate(foodInput);

      if (response.success && response.nutrition) {
        setNutritionResult(response.nutrition);
        setHistory((prev) => [
          { food: foodInput, nutrition: response.nutrition },
          ...prev.slice(0, 4),
        ]);
        toast.success("Nutrition calculated successfully!");
      } else {
        toast.error(response.message || "Failed to calculate nutrition");
      }
    } catch (error: any) {
      console.error("Nutrition calculation error:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to calculate nutrition. Please try again."
      );
    } finally {
      setIsCalculating(false);
    }
  };

  const handleClear = () => {
    setFoodInput("");
    setNutritionResult(null);
  };

  const handleHistoryClick = (item: {
    food: string;
    nutrition: NutritionResult;
  }) => {
    setFoodInput(item.food);
    setNutritionResult(item.nutrition);
  };

  return (
    <>
      {/* Calculator Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100001] flex items-center justify-center p-4"
          style={{ zIndex: 100001 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
            {/* Header */}
            <div
              className={`px-6 py-4 flex items-center justify-between flex-shrink-0 ${
                isDarkMode
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                  : "bg-white border-b border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleClear();
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode ? "hover:bg-white/20" : "hover:bg-gray-100"
                  }`}
                  aria-label="Back"
                >
                  <ArrowLeft
                    className={`w-5 h-5 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  />
                </button>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isDarkMode ? "bg-white/20" : "bg-amber-100"
                  }`}
                >
                  <Calculator
                    className={`w-5 h-5 ${
                      isDarkMode ? "text-white" : "text-amber-600"
                    }`}
                  />
                </div>
                <div>
                  <h2
                    className={`font-semibold text-lg ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Nutrition Calculator
                  </h2>
                  <p
                    className={`text-xs ${
                      isDarkMode ? "text-white/90" : "text-gray-600"
                    }`}
                  >
                    Calculate your meal nutrition
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleClear();
                }}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? "hover:bg-white/20" : "hover:bg-gray-100"
                }`}
                aria-label="Close"
              >
                <X
                  className={`w-5 h-5 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div
              className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6 scrollbar-thin scrollbar-thumb-amber-400 scrollbar-track-gray-200 dark:scrollbar-track-gray-700"
              style={{
                maxHeight: "calc(90vh - 80px)",
                scrollBehavior: "smooth",
              }}
            >
              {/* Input Section */}
              <div className="space-y-3">
                <label className="block text-base font-bold text-gray-900 dark:text-white mb-2">
                  Enter your food items
                </label>
                <textarea
                  value={foodInput}
                  onChange={(e) => setFoodInput(e.target.value)}
                  placeholder="e.g., 2 chapati, 1 cup of daal, 50 gm of panner, 2 cup of white rice, 1 bread"
                  className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none shadow-sm"
                  rows={4}
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Enter food items separated by commas (e.g., "2 chapati, 1 cup
                  daal, 50 gm panner")
                </p>
              </div>

              {/* Calculate Button */}
              <button
                onClick={handleCalculate}
                disabled={!foodInput.trim() || isCalculating}
                className="w-full px-6 py-3 rounded-lg text-white hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 relative z-10 border-0"
                style={{
                  background:
                    !foodInput.trim() || isCalculating
                      ? "linear-gradient(to right, #d1d5db, #9ca3af)"
                      : "linear-gradient(to right, #f59e0b, #f97316)",
                  color: "#ffffff",
                  textShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
                  boxShadow:
                    !foodInput.trim() || isCalculating
                      ? "none"
                      : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                }}
              >
                {isCalculating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span
                      className="text-white font-semibold"
                      style={{ textShadow: "0 1px 3px rgba(0, 0, 0, 0.3)" }}
                    >
                      Calculating...
                    </span>
                  </>
                ) : (
                  <>
                    <Calculator
                      className="w-5 h-5 text-white"
                      style={{
                        filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))",
                      }}
                    />
                    <span
                      className="text-white font-semibold"
                      style={{ textShadow: "0 1px 3px rgba(0, 0, 0, 0.3)" }}
                    >
                      Calculate Nutrition
                    </span>
                  </>
                )}
              </button>

              {/* Results Section */}
              {nutritionResult && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="w-5 h-5" />
                    <h3 className="font-semibold text-lg">
                      Nutrition Breakdown
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Major Nutrients */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          Protein
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {nutritionResult.protein.toFixed(1)}{" "}
                        <span className="text-sm font-normal">gm</span>
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                          Carbs
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        {nutritionResult.carbs.toFixed(1)}{" "}
                        <span className="text-sm font-normal">gm</span>
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 border border-pink-200 dark:border-pink-700">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                        <span className="text-sm font-medium text-pink-700 dark:text-pink-300">
                          Fats
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-pink-900 dark:text-pink-100">
                        {nutritionResult.fats.toFixed(1)}{" "}
                        <span className="text-sm font-normal">gm</span>
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border border-amber-200 dark:border-amber-700">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                          Calories
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                        {nutritionResult.calories.toFixed(0)}{" "}
                        <span className="text-sm font-normal">kcal</span>
                      </p>
                    </div>

                    {nutritionResult.fiber !== undefined && (
                      <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-sm font-medium text-green-700 dark:text-green-300">
                            Fiber
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                          {nutritionResult.fiber.toFixed(1)}{" "}
                          <span className="text-sm font-normal">gm</span>
                        </p>
                      </div>
                    )}

                    {nutritionResult.sugar !== undefined && (
                      <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-700">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <span className="text-sm font-medium text-red-700 dark:text-red-300">
                            Sugar
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                          {nutritionResult.sugar.toFixed(1)}{" "}
                          <span className="text-sm font-normal">gm</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Additional Nutrients */}
                  {(nutritionResult.sodium ||
                    nutritionResult.calcium ||
                    nutritionResult.iron ||
                    nutritionResult.vitaminC) && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Additional Nutrients
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {nutritionResult.sodium !== undefined && (
                          <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Sodium
                            </p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {nutritionResult.sodium.toFixed(0)} mg
                            </p>
                          </div>
                        )}
                        {nutritionResult.calcium !== undefined && (
                          <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Calcium
                            </p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {nutritionResult.calcium.toFixed(0)} mg
                            </p>
                          </div>
                        )}
                        {nutritionResult.iron !== undefined && (
                          <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Iron
                            </p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {nutritionResult.iron.toFixed(1)} mg
                            </p>
                          </div>
                        )}
                        {nutritionResult.vitaminC !== undefined && (
                          <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Vitamin C
                            </p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {nutritionResult.vitaminC.toFixed(0)} mg
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* History Section */}
              {history.length > 0 && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Apple className="w-4 h-4" />
                    Recent Calculations
                  </h4>
                  <div className="space-y-2">
                    {history.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleHistoryClick(item)}
                        className="w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {item.food}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {item.nutrition.calories.toFixed(0)} kcal •{" "}
                          {item.nutrition.protein.toFixed(1)}g protein •{" "}
                          {item.nutrition.carbs.toFixed(1)}g carbs
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

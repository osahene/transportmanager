"use client";

import { FaCar } from "react-icons/fa";
import { motion } from "framer-motion";
import { Car } from "../../types/cars";

interface VehicleSelectionSectionProps {
  availableCars: Car[];
  selectedCarId: string;
  onCarSelect: (carId: string) => void;
}

export default function VehicleSelectionSection({
  availableCars,
  selectedCarId,
  onCarSelect,
}: VehicleSelectionSectionProps) {
  const selectedCar = availableCars.find((car) => car.id === selectedCarId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <FaCar />
        Vehicle Selection *
      </h2>

      {availableCars.length === 0 ? (
        <div className="text-center py-8">
          <FaCar className="text-gray-400 dark:text-gray-600 text-4xl mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            No vehicles available for booking at the moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableCars.map((car) => (
            <button
              key={car.id}
              type="button"
              onClick={() => onCarSelect(car.id)}
              className={`border rounded-xl p-4 transition-all ${
                selectedCarId === car.id
                  ? "border-blue-500 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500 dark:ring-blue-600 ring-opacity-50"
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 bg-linear-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg flex items-center justify-center">
                  <FaCar className="text-white text-2xl" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {car.make} {car.model}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {car.year} • {car.color}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Plate: {car.licensePlate}
                  </p>
                  <div className="mt-2">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ¢{car.dailyRate}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                      /day
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedCar && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
        >
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">
            Selected Vehicle:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Make & Model
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {selectedCar.make} {selectedCar.model}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Daily Rate
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                ¢{selectedCar.dailyRate}/day
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Color</p>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: selectedCar.color }}
                />
                <span className="font-medium text-gray-900 dark:text-white">
                  {selectedCar.color}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Plate</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {selectedCar.licensePlate}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

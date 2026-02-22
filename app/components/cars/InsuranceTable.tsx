// /components/cars/InsuranceTable.tsx
import { useState } from "react";
import { InsurancePolicy } from "../../types/insurance";
import {
  FaEye,
  FaShieldAlt,
  FaCalendar,
  FaMoneyBillWave,
} from "react-icons/fa";

interface InsuranceTableProps {
  insurancePolicies: InsurancePolicy[];
}

const InsuranceTable: React.FC<InsuranceTableProps> = ({
  insurancePolicies,
}) => {
  const [selectedPolicy, setSelectedPolicy] = useState<InsurancePolicy | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (policy: InsurancePolicy) => {
    setSelectedPolicy(policy);
    setIsModalOpen(true);
  };

  const getInsuranceStatus = (policy: InsurancePolicy) => {
    const today = new Date();
    const endDate = new Date(policy.endDate);
    const startDate = new Date(policy.startDate);
    const daysRemaining = Math.ceil(
      (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysActive = Math.ceil(
      (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (policy.status === "expired" || endDate < today) {
      return {
        status: "expired",
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        daysInfo: `Expired ${Math.abs(daysRemaining)} days ago`,
      };
    }

    if (daysRemaining <= 30) {
      return {
        status: "expiring",
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        daysInfo: `Expires in ${daysRemaining} days`,
      };
    }

    if (policy.status === "active") {
      return {
        status: "active",
        color:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        daysInfo: `Active for ${daysActive} days`,
      };
    }

    return {
      status: policy.status,
      color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      daysInfo: "",
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCoverageType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Insurance Policies
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Total {insurancePolicies.length} policy(s)
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">
                {
                  insurancePolicies.filter(
                    (p) => getInsuranceStatus(p).status === "active"
                  ).length
                }
              </span>{" "}
              Active
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">
                {
                  insurancePolicies.filter(
                    (p) => getInsuranceStatus(p).status === "expiring"
                  ).length
                }
              </span>{" "}
              Expiring
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Provider
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Policy Number
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Coverage Type
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Period
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Premium
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {insurancePolicies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <FaShieldAlt className="w-12 h-12 text-gray-400 mb-2" />
                      <p>No insurance policies found</p>
                      <p className="text-sm mt-1">
                        Add an insurance policy to track coverage
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                insurancePolicies
                  .sort(
                    (a, b) =>
                      new Date(b.endDate).getTime() -
                      new Date(a.endDate).getTime()
                  )
                  .map((policy) => {
                    const status = getInsuranceStatus(policy);
                    return (
                      <tr
                        key={policy.id}
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <FaShieldAlt className="w-4 h-4 text-blue-500 mr-2" />
                            <div>
                              <div className="font-medium text-gray-800 dark:text-white">
                                {policy.provider}
                              </div>
                              
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-mono text-sm text-gray-800 dark:text-white">
                            {policy.policyNumber}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs">
                            {formatCoverageType(policy.coverageType)}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-full">
                          <div className="flex items-center gap-2 text-sm">
                            <FaCalendar className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {formatDate(policy.startDate)} -{" "}
                              {formatDate(policy.endDate)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {status.daysInfo}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}
                          >
                            {status.status.charAt(0).toUpperCase() +
                              status.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <FaMoneyBillWave className="w-4 h-4 text-green-500" />
                            <div className="font-bold text-gray-900 dark:text-white">
                              ¢{policy.premium.toLocaleString()}
                            </div>
                          </div>
                          
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleViewDetails(policy)}
                            className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                            title="View Details"
                          >
                            <FaEye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for policy details */}
      {isModalOpen && selectedPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Insurance Policy Details
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                    Insurance Provider
                  </label>
                  <p className="text-blue-800 dark:text-blue-300 font-medium">
                    {selectedPolicy.provider}
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                    Policy Number
                  </label>
                  <p className="text-blue-800 dark:text-blue-300 font-mono font-medium">
                    {selectedPolicy.policyNumber}
                  </p>
                </div>
              </div>

              {/* Coverage Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Coverage Type
                  </label>
                  <p className="text-gray-800 dark:text-white font-medium">
                    {formatCoverageType(selectedPolicy.coverageType)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Policy Status
                  </label>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      getInsuranceStatus(selectedPolicy).color
                    }`}
                  >
                    {getInsuranceStatus(selectedPolicy)
                      .status.charAt(0)
                      .toUpperCase() +
                      getInsuranceStatus(selectedPolicy).status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Start Date
                  </label>
                  <p className="text-gray-800 dark:text-white">
                    {formatDate(selectedPolicy.startDate)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    End Date
                  </label>
                  <p className="text-gray-800 dark:text-white">
                    {formatDate(selectedPolicy.endDate)}
                  </p>
                </div>
              </div>

              {/* Financial Details */}
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-3">
                  Financial Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Annual Premium
                    </label>
                    <p className="text-xl font-bold text-green-600">
                      ¢{selectedPolicy.premium.toLocaleString()}
                    </p>
                  </div>
                  
                </div>
              </div>

              {/* Renewal Info */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-3">
                  Renewal Information
                </h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Renewal Date
                    </p>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {formatDate(selectedPolicy.endDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Days Until Renewal
                    </p>
                    <p className="font-medium text-yellow-600">
                      {Math.ceil(
                        (new Date(selectedPolicy.endDate).getTime() -
                          new Date().getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}{" "}
                      days
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InsuranceTable;

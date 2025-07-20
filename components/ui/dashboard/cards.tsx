"use client";

import { useAtom } from "jotai";
import { portfolioAtom } from "@/atoms/portfolio";
import { Card } from "@/components/ui/auth-forms/card";
import { iconMap } from "@/components/ui/dashboard/icon-map";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardCards() {
  const [portfolioQuery] = useAtom(portfolioAtom);

  if (portfolioQuery.isPending) {
    return (
      <>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4 min-w-[200px]">
            <Skeleton className="h-4 w-[100px] mb-2" />
            <Skeleton className="h-6 w-[120px]" />
          </Card>
        ))}
      </>
    );
  }

  if (portfolioQuery.isError) {
    return <div className="text-red-500">Error loading portfolio data</div>;
  }

  const portfolio = portfolioQuery.data;

  if (!portfolio) {
    return <div>No portfolio data available</div>;
  }

  const data = {
    accountValue: {
      label: "Account Value",
      value: `$${portfolio.totalValue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      subtext: "Total Portfolio Value",
    },
    todaysChange: {
      label: "Today's Change",
      value: `${portfolio.dayChange >= 0 ? "+" : "-"}$${Math.abs(
        portfolio.dayChange
      ).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      subtext: `${
        portfolio.dayChange >= 0 ? "+" : ""
      }${portfolio.dayChangePercent.toFixed(2)}%`,
      isPositive: portfolio.dayChange >= 0,
    },
    totalGains: {
      label: "Total Gains",
      value: `${portfolio.totalGains >= 0 ? "+" : "-"}$${Math.abs(
        portfolio.totalGains
      ).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      subtext: `${
        portfolio.totalGains >= 0 ? "+" : ""
      }${portfolio.totalGainsPercent.toFixed(2)}%`,
      isPositive: portfolio.totalGains >= 0,
    },
    cash: {
      label: "Cash",
      value: "$15,000.00", // Mock cash balance
      subtext: "30.0% of Account",
    },
  };

  return (
    <>
      {Object.entries(data).map(
        ([key, data]) =>
          data && (
            <Card key={key} className="p-4 min-w-[200px]">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-4 min-w-0">
                  {(() => {
                    const Icon = iconMap[key as keyof typeof iconMap];
                    return (
                      <Icon className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                    );
                  })()}
                  <div className="flex flex-col min-w-0">
                    <p className="text-sm font-medium leading-none text-muted-foreground truncate">
                      {data.label}
                    </p>
                    <h3
                      className={`mt-2 font-bold text-xl truncate ${
                        "isPositive" in data
                          ? data.isPositive
                            ? "text-green-500"
                            : "text-red-500"
                          : ""
                      }`}
                    >
                      {data.value}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {data.subtext}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )
      )}
    </>
  );
}
